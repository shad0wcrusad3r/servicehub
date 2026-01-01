export interface IUser {
  _id: string;
  email?: string;
  phone?: string;
  password: string;
  role: 'labour' | 'client' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILabour extends IUser {
  name: string;
  categories: string[];
  hourlyRate: number;
  city: 'Hubli' | 'Dharwad';
  isApproved: boolean;
  totalRating: number;
  ratingCount: number;
  averageRating: number;
}

export interface IClient extends IUser {
  name: string;
  company?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface IJob {
  _id: string;
  client: string;
  labour?: string;
  category: string;
  title: string;
  description: string;
  city: 'Hubli' | 'Dharwad';
  hourlyRate: number; // snapshot at job creation
  estimatedHours: number;
  status: 'open' | 'accepted' | 'work_done' | 'payment_received' | 'completed' | 'cancelled';
  createdAt: Date;
  acceptedAt?: Date;
  workDoneAt?: Date;
  paymentReceivedAt?: Date;
  completedAt?: Date;
}

export interface IRating {
  _id: string;
  job: string;
  client: string;
  labour: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: Date;
}

export interface IOTP {
  phone: string;
  otp: string;
  expiresAt: Date;
  isUsed: boolean;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'labour' | 'client' | 'admin';
  };
}