import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Job } from '../models/Job';
import { Labour } from '../models/Labour';
import { Client } from '../models/Client';
import { Rating } from '../models/Rating';
import { smsService, emailService } from '../services/mockServices';
import mongoose from 'mongoose';

// Client: Create new job
export const createJob = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { title, description, category, city, estimatedHours } = req.body;

    // Get client profile
    const client = await Client.findOne({ user: req.user!.id });
    if (!client) {
      return res.status(404).json({ error: 'Client profile not found' });
    }

    // Find a labour in the category to get average hourly rate (snapshot)
    const labourList = await Labour.find({ 
      categories: category, 
      city, 
      isApproved: true 
    });

    if (labourList.length === 0) {
      return res.status(400).json({ error: 'No approved workers found for this category and city' });
    }

    // Calculate average hourly rate from available workers
    const averageRate = Math.round(
      labourList.reduce((sum, labour) => sum + labour.hourlyRate, 0) / labourList.length
    );

    const job = new Job({
      client: client._id,
      category,
      title,
      description,
      city,
      hourlyRate: averageRate, // Snapshot the average market rate
      estimatedHours,
      status: 'open',
    });

    await job.save();

    const populatedJob = await Job.findById(job._id)
      .populate('category', 'name')
      .populate('client', 'name');

    res.status(201).json({
      message: 'Job created successfully',
      job: populatedJob,
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Labour: Get available jobs
export const getAvailableJobs = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get labour profile to filter by categories and city
    const labour = await Labour.findOne({ user: req.user!.id })
      .populate('categories');
    
    if (!labour) {
      return res.status(404).json({ error: 'Labour profile not found' });
    }

    const categoryIds = labour.categories.map(cat => cat._id);

    const jobs = await Job.find({
      status: 'open',
      category: { $in: categoryIds },
      city: labour.city,
    })
    .populate('category', 'name')
    .populate('client', 'name company')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

    const total = await Job.countDocuments({
      status: 'open',
      category: { $in: categoryIds },
      city: labour.city,
    });

    res.json({
      jobs,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get available jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DEPRECATED: This endpoint is replaced by job application workflow
// Kept for backward compatibility but should not be used
export const acceptJob = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  return res.status(410).json({ 
    error: 'This endpoint is deprecated. Please use job application workflow instead.',
    message: 'Submit an application via POST /api/jobs/:id/apply'
  });
};

// Client: Mark work done (awaiting completion confirmation)
export const markWorkDone = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('labour', 'name');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const client = await Client.findOne({ user: req.user!.id });
    if (!client || !job.client.equals(client._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (job.status !== 'in_progress') {
      return res.status(400).json({ error: 'Job must be in progress to mark as done' });
    }

    job.status = 'awaiting_completion';
    job.workCompletedAt = new Date();
    await job.save();

    // Notify labour
    const labour = await Labour.findById(job.labour).populate('user', 'phone') as any;
    if (labour) {
      await smsService.sendNotification(
        labour.user.phone,
        `Client has marked work as done for job: ${job.title}. Please confirm and mark payment received.`
      );
    }

    res.json({
      message: 'Work marked as done, awaiting worker confirmation',
      job,
    });
  } catch (error) {
    console.error('Mark work done error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Labour: Mark payment received
export const markPaymentReceived = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('client', 'name');
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const labour = await Labour.findOne({ user: req.user!.id });
    if (!labour || !job.labour?.equals(labour._id)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (job.status !== 'awaiting_completion') {
      return res.status(400).json({ error: 'Work must be marked as done by client first' });
    }

    job.status = 'completed';
    job.paymentReceivedAt = new Date();
    job.completedAt = new Date();
    await job.save();

    // Notify client that labour confirmed payment
    const client = await Client.findById(job.client).populate('user', 'email') as any;
    if (client) {
      await emailService.sendNotification(
        client.user.email,
        'Job Completed',
        `${labour.name} has confirmed payment for job: ${job.title}. Work completed successfully!`
      );
    }

    res.json({
      message: 'Payment confirmed and job completed!',
      job,
    });
  } catch (error) {
    console.error('Mark payment received error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Rate and complete job
export const rateAndCompleteJob = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  // Check if we're in test/development environment or if transactions are supported
  const useTransactions = process.env.NODE_ENV === 'production';
  let session: mongoose.ClientSession | null = null;

  try {
    if (useTransactions) {
      session = await mongoose.startSession();
      session.startTransaction();
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    const job = await Job.findById(id);
    if (!job) {
      if (session) await session.abortTransaction();
      return res.status(404).json({ error: 'Job not found' });
    }

    const client = await Client.findOne({ user: req.user!.id });
    if (!client || !job.client.equals(client._id)) {
      if (session) await session.abortTransaction();
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (job.status !== 'completed') {
      if (session) await session.abortTransaction();
      return res.status(400).json({ error: 'Job must be completed before rating' });
    }

    // Create rating
    const newRating = new Rating({
      job: job._id,
      client: client._id,
      labour: job.labour,
      rating,
      comment,
    });

    await newRating.save(session ? { session } : undefined);

    // Update labour's rating
    const labour = await Labour.findById(job.labour);
    if (labour) {
      labour.totalRating += rating;
      labour.ratingCount += 1;
      labour.averageRating = labour.totalRating / labour.ratingCount;
      await labour.save(session ? { session } : undefined);
    }

    // Job is already completed, just save the rating timestamp
    await job.save(session ? { session } : undefined);

    if (session) await session.commitTransaction();

    res.json({
      message: 'Job completed and rated successfully',
      job,
      rating: newRating,
    });
  } catch (error) {
    if (session) await session.abortTransaction();
    console.error('Rate and complete job error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (session) session.endSession();
  }
};

// Get user's jobs
export const getUserJobs = async (req: AuthRequest, res: Response): Promise<void | Response> => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    let filter: any = {};
    
    if (req.user!.role === 'client') {
      const client = await Client.findOne({ user: req.user!.id });
      if (!client) {
        return res.json({
          jobs: [],
          pagination: {
            current: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0
          }
        });
      }
      filter.client = client._id;
    } else if (req.user!.role === 'labour') {
      const labour = await Labour.findOne({ user: req.user!.id });
      if (!labour) {
        return res.json({
          jobs: [],
          pagination: {
            current: Number(page),
            limit: Number(limit),
            total: 0,
            pages: 0
          }
        });
      }
      filter.labour = labour._id;
      // Exclude 'open' status for labour - they should only see jobs they're working on
      if (!status) {
        filter.status = { $ne: 'open' };
      }
    }

    if (status) {
      filter.status = status;
    }

    const jobs = await Job.find(filter)
      .populate('category', 'name')
      .populate('client', 'name company')
      .populate('labour', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Job.countDocuments(filter);

    res.json({
      jobs,
      pagination: {
        current: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get user jobs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};