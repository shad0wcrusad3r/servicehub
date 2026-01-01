import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPDocument extends Document {
  phone: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
}

const otpSchema = new Schema<IOTPDocument>({
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
    length: 4,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// TTL index to automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ phone: 1, createdAt: -1 });

export const OTP = mongoose.model<IOTPDocument>('OTP', otpSchema);