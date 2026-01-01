import { OTP } from '../models/OTP';
import { smsService } from './mockServices';

export class OTPService {
  // Generate 4-digit OTP
  private generateOTP(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  // Send OTP to phone
  async sendOTP(phone: string): Promise<boolean> {
    try {
      // Invalidate any existing OTPs for this phone
      await OTP.updateMany(
        { phone, isUsed: false },
        { isUsed: true }
      );

      const otp = this.generateOTP();
      
      // For development, use fixed OTP (default to development if NODE_ENV not set)
      const finalOTP = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') ? '1234' : otp;

      // Save OTP to database
      const otpDoc = new OTP({
        phone,
        otp: finalOTP,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      });

      await otpDoc.save();

      // Send SMS
      await smsService.sendOTP(phone, finalOTP);

      return true;
    } catch (error) {
      console.error('Failed to send OTP:', error);
      return false;
    }
  }

  // Verify OTP
  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    try {
      const otpDoc = await OTP.findOne({
        phone,
        otp,
        isUsed: false,
        expiresAt: { $gt: new Date() }
      });

      if (!otpDoc) {
        return false;
      }

      // Mark OTP as used
      otpDoc.isUsed = true;
      await otpDoc.save();

      return true;
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      return false;
    }
  }
}

export const otpService = new OTPService();