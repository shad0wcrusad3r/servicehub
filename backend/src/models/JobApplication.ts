import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplicationDocument extends Document {
  job: mongoose.Types.ObjectId;
  labour: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: Date;
  respondedAt?: Date;
}

const jobApplicationSchema = new Schema<IJobApplicationDocument>({
  job: {
    type: Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  labour: {
    type: Schema.Types.ObjectId,
    ref: 'Labour',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  respondedAt: Date,
}, {
  timestamps: true,
});

// Indexes
jobApplicationSchema.index({ job: 1, labour: 1 }, { unique: true }); // One application per job per labour
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ labour: 1, status: 1 });

export const JobApplication = mongoose.model<IJobApplicationDocument>('JobApplication', jobApplicationSchema);
