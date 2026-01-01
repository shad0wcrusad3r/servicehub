import mongoose, { Schema, Document } from 'mongoose';

export interface IJobDocument extends Document {
  client: mongoose.Types.ObjectId;
  labour?: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  title: string;
  description: string;
  city: 'Hubli' | 'Dharwad';
  hourlyRate: number;
  estimatedHours: number;
  status: 'open' | 'in_progress' | 'awaiting_completion' | 'completed' | 'cancelled';
  acceptedAt?: Date;
  workCompletedAt?: Date;
  paymentReceivedAt?: Date;
  completedAt?: Date;
}

const jobSchema = new Schema<IJobDocument>({
  client: {
    type: Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  labour: {
    type: Schema.Types.ObjectId,
    ref: 'Labour',
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000,
  },
  city: {
    type: String,
    enum: ['Hubli', 'Dharwad'],
    required: true,
  },
  hourlyRate: {
    type: Number,
    required: true,
    min: 50,
    max: 2000,
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'awaiting_completion', 'completed', 'cancelled'],
    default: 'open',
  },
  acceptedAt: Date,
  workCompletedAt: Date,
  paymentReceivedAt: Date,
  completedAt: Date,
}, {
  timestamps: true,
});

// Note: Status transitions are validated in the controller layer
// to avoid TypeScript issues with mongoose internals

// Indexes
jobSchema.index({ status: 1, city: 1 });
jobSchema.index({ client: 1 });
jobSchema.index({ labour: 1 });
jobSchema.index({ category: 1 });

export const Job = mongoose.model<IJobDocument>('Job', jobSchema);