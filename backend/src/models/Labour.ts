import mongoose, { Schema, Document } from 'mongoose';

export interface ILabourDocument extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  categories: mongoose.Types.ObjectId[];
  hourlyRate: number;
  city: 'Hubli' | 'Dharwad';
  isApproved: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  totalRating: number;
  ratingCount: number;
  averageRating: number;
}

const labourSchema = new Schema<ILabourDocument>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  categories: [{
    type: Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 50,
    max: 2000,
  },
  city: {
    type: String,
    enum: ['Hubli', 'Dharwad'],
    required: true,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  totalRating: {
    type: Number,
    default: 0,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
}, {
  timestamps: true,
});

// Calculate average rating
labourSchema.methods.updateRating = function(newRating: number) {
  this.totalRating += newRating;
  this.ratingCount += 1;
  this.averageRating = this.totalRating / this.ratingCount;
  return this.save();
};

// Indexes
labourSchema.index({ city: 1, isApproved: 1 });
labourSchema.index({ approvalStatus: 1 });
labourSchema.index({ categories: 1 });
labourSchema.index({ averageRating: -1 });

export const Labour = mongoose.model<ILabourDocument>('Labour', labourSchema);