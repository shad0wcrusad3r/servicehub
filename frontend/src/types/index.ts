export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: 'labour' | 'client' | 'admin';
  labour?: Labour;
  client?: Client;
}

export interface Labour {
  id: string;
  name: string;
  categories: Category[];
  hourlyRate: number;
  city: 'Hubli' | 'Dharwad';
  isApproved: boolean;
  averageRating: number;
  ratingCount: number;
  phone?: string;
  recentComments?: Comment[];
}

export interface Client {
  id: string;
  name: string;
  company?: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Job {
  _id: string;
  client: {
    _id: string;
    name: string;
    company?: string;
  };
  labour?: {
    _id: string;
    name: string;
  };
  category: {
    _id: string;
    name: string;
  };
  title: string;
  description: string;
  city: 'Hubli' | 'Dharwad';
  hourlyRate: number;
  estimatedHours: number;
  status: 'open' | 'in_progress' | 'awaiting_completion' | 'completed' | 'cancelled';
  createdAt: string;
  acceptedAt?: string;
  workCompletedAt?: string;
  paymentReceivedAt?: string;
  completedAt?: string;
}

export interface Comment {
  rating: number;
  comment: string;
  createdAt: string;
  clientName: string;
}

export interface Rating {
  _id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  clientName: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    current: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LabourSignupData {
  phone: string;
  otp: string;
  password: string;
  name: string;
  categories: string[];
  hourlyRate: number;
  city: 'Hubli' | 'Dharwad';
}

export interface ClientSignupData {
  email: string;
  phone: string;
  password: string;
  name: string;
  company?: string;
}

export interface LoginData {
  identifier: string; // email or phone
  password: string;
}

export interface JobCreateData {
  title: string;
  description: string;
  category: string;
  city: 'Hubli' | 'Dharwad';
  estimatedHours: number;
}

export interface JobFilters {
  category?: string;
  city?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface LabourFilters {
  category?: string;
  city?: string;
  page?: number;
  limit?: number;
}

export interface JobApplication {
  _id: string;
  job: Job | string;
  labour: {
    _id: string;
    name: string;
    hourlyRate: number;
    city: string;
    averageRating: number;
    ratingCount: number;
    categories: Category[];
    user?: {
      phone: string;
    };
  };
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  respondedAt?: string;
}

export interface JobApplicationSubmit {
  message?: string;
}