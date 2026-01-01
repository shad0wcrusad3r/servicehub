import React from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface PhoneInputProps {
  label?: string;
  placeholder?: string;
  registration: UseFormRegisterReturn;
  error?: string;
  className?: string;
  required?: boolean;
  autoFocus?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label = "Phone Number",
  placeholder = "Enter 10-digit mobile number",
  registration,
  error,
  className = "",
  required = false,
  autoFocus = false,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    let value = e.target.value.replace(/\D/g, '');
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    e.target.value = value;
    
    // Call the original onChange if it exists
    if (registration.onChange) {
      registration.onChange(e);
    }
  };

  return (
    <div className={className}>
      <label className="form-label">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 text-sm font-medium">+91</span>
        </div>
        <input
          type="tel"
          className={`form-input pl-12 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder={placeholder}
          autoComplete="tel"
          inputMode="numeric"
          maxLength={10}
          autoFocus={autoFocus}
          {...registration}
          onChange={handleInputChange}
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Enter your 10-digit mobile number without country code
      </p>
      {error && (
        <p className="form-error">{error}</p>
      )}
    </div>
  );
};

export default PhoneInput;