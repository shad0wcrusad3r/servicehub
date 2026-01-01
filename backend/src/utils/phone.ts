// Phone utility functions for backend

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

// Validate 10-digit phone number
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[6789]\d{9}$/;
  const cleaned = phone.replace(/\D/g, '');
  return phoneRegex.test(cleaned);
};