import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getStatusColor = (status: string) => {
  const colors = {
    open: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-yellow-100 text-yellow-800',
    awaiting_completion: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    // Legacy statuses
    accepted: 'bg-yellow-100 text-yellow-800',
    work_done: 'bg-purple-100 text-purple-800',
    payment_received: 'bg-orange-100 text-orange-800',
    awaiting_payment: 'bg-orange-100 text-orange-800',
  };
  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
};

export const getStatusText = (status: string) => {
  const texts = {
    open: 'Open',
    in_progress: 'In Progress',
    awaiting_completion: 'Work Completed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    // Legacy statuses
    accepted: 'Accepted',
    work_done: 'Work Done',
    payment_received: 'Payment Received',
    awaiting_payment: 'Awaiting Payment',
  };
  return texts[status as keyof typeof texts] || status;
};

export const renderStars = (rating: number) => {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
};

export const validatePhone = (phone: string) => {
  const phoneRegex = /^[6789]\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Normalize phone to 10-digit format for storage
export const normalizePhone = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');
  
  // Extract 10-digit number
  if (cleaned.length === 10 && cleaned.match(/^[6789]/)) {
    return cleaned;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    const tenDigit = cleaned.slice(2);
    if (tenDigit.match(/^[6789]/)) {
      return tenDigit;
    }
  }
  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    const tenDigit = cleaned.slice(3);
    if (tenDigit.match(/^[6789]/)) {
      return tenDigit;
    }
  }
  
  return cleaned; // Return as-is if format is unexpected
};

// Format phone for display (+91 + 10 digits)
export const formatPhoneDisplay = (phone: string): string => {
  const normalized = normalizePhone(phone);
  if (normalized.length === 10 && normalized.match(/^[6789]/)) {
    return `+91${normalized}`;
  }
  return phone;
};

// Legacy function for backward compatibility
export const formatPhone = (phone: string) => {
  return formatPhoneDisplay(phone);
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};