import { Request, Response } from 'express';
import { User } from '../models/User';
import { Labour } from '../models/Labour';
import { Client } from '../models/Client';
import { generateToken } from '../utils/jwt';
import { otpService } from '../services/otpService';
import { emailService } from '../services/mockServices';
import { AuthRequest } from '../middleware/auth';
import { normalizePhone, formatPhoneDisplay } from '../utils/phone';
import mongoose from 'mongoose';

// Labour signup - step 1: send OTP
export const labourRequestOTP = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { phone } = req.body;
    
    // Normalize phone number for storage
    const normalizedPhone = normalizePhone(phone);

    // Check if user already exists
    const existingUser = await User.findOne({ phone: normalizedPhone });
    if (existingUser) {
      res.status(400).json({ error: 'User with this phone already exists' });
      return;
    }

    const success = await otpService.sendOTP(normalizedPhone);
    if (!success) {
      res.status(500).json({ error: 'Failed to send OTP' });
      return;
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Labour OTP request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Labour signup - step 2: verify OTP and create account
export const labourSignup = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { phone, otp, password, name, categories, hourlyRate, city } = req.body;
    
    // Normalize phone number for storage
    const normalizedPhone = normalizePhone(phone);

    // Verify OTP
    const isValidOTP = await otpService.verifyOTP(normalizedPhone, otp);
    if (!isValidOTP) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Create user
    const user = new User({
      phone: normalizedPhone,
      password,
      role: 'labour',
      isVerified: true,
    });

    await user.save();

    try {
      // Create labour profile
      const labour = new Labour({
        user: user._id,
        name,
        categories,
        hourlyRate,
        city,
        isApproved: false,
        approvalStatus: 'pending',
      });

      await labour.save();

      const token = generateToken({ id: user._id.toString(), role: 'labour' });

      res.status(201).json({
        message: 'Labour account created successfully',
        token,
        user: {
          id: user._id,
          phone: user.phone ? formatPhoneDisplay(user.phone) : undefined,
          role: user.role,
          labour: {
            id: labour._id,
            name: labour.name,
            categories: labour.categories,
            hourlyRate: labour.hourlyRate,
            city: labour.city,
            isApproved: labour.isApproved,
          }
        }
      });
    } catch (labourError) {
      // If labour profile creation fails, clean up the user
      await User.findByIdAndDelete(user._id);
      throw labourError;
    }
  } catch (error) {
    console.error('Labour signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Error details:', errorMessage);
    console.error('Stack trace:', errorStack);
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    });
  }
};

// Client signup
export const clientSignup = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { email, phone, password, name, company } = req.body;
    
    // Normalize phone number for storage
    const normalizedPhone = normalizePhone(phone);

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { phone: normalizedPhone }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    // Create user
    const user = new User({
      email,
      phone: normalizedPhone,
      password,
      role: 'client',
      isVerified: true, // Auto-verify for clients in MVP
    });

    await user.save();

    // Create client profile
    const client = new Client({
      user: user._id,
      name,
      company,
    });

    await client.save();

    // Send welcome email
    await emailService.sendWelcome(email, name);

    const token = generateToken({ id: user._id.toString(), role: 'client' });

    res.status(201).json({
      message: 'Client account created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone ? formatPhoneDisplay(user.phone) : undefined,
        role: user.role,
        client: {
          id: client._id,
          name: client.name,
          company: client.company,
        }
      }
    });
  } catch (error) {
    console.error('Client signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Login (email/phone + password)
export const login = async (req: Request, res: Response): Promise<void | Response> => {
  try {
    const { identifier, password } = req.body; // identifier can be email or phone
    
    // If identifier looks like a phone, normalize it
    const isPhone = /^\d/.test(identifier.replace(/\D/g, ''));
    const normalizedIdentifier = isPhone ? normalizePhone(identifier) : identifier;

    // Find user by email or phone
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: normalizedIdentifier }]
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Account not verified' });
    }

    const token = generateToken({ id: user._id.toString(), role: user.role });

    // Get profile data based on role
    let profileData = {};
    if (user.role === 'labour') {
      const labour = await Labour.findOne({ user: user._id }).populate('categories', 'name');
      profileData = { labour };
    } else if (user.role === 'client') {
      const client = await Client.findOne({ user: user._id });
      profileData = { client };
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone ? formatPhoneDisplay(user.phone) : undefined,
        role: user.role,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get current user profile (for token verification)
export const getMe = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get profile data based on role
    let profileData = {};
    if (user.role === 'labour') {
      const labour = await Labour.findOne({ user: user._id }).populate('categories', 'name');
      profileData = { labour };
    } else if (user.role === 'client') {
      const client = await Client.findOne({ user: user._id });
      profileData = { client };
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        phone: user.phone ? formatPhoneDisplay(user.phone) : undefined,
        role: user.role,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};