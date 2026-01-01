import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQuery } from 'react-query';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import PhoneInput from '../../components/ui/PhoneInput';
import { LabourSignupData, Category } from '../../types';
import { validatePhone, normalizePhone, formatPhoneDisplay } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const LabourSignupPage: React.FC = () => {
  const { login } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp' | 'details'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      setResendCooldown(0);
    };
  }, []);

  // Fetch categories
  const { data: categoriesData } = useQuery('categories', async () => {
    const response = await api.get('/categories');
    return response.data.categories as Category[];
  });

  // Phone step form
  const phoneForm = useForm<{ phone: string }>();
  
  // OTP step form  
  const otpForm = useForm<{ otp: string }>();
  
  // Details step form
  const detailsForm = useForm<Omit<LabourSignupData, 'phone' | 'otp'>>();

  const handleSendOTP = async (data: { phone: string }) => {
    try {
      setIsLoading(true);
      const normalizedPhone = normalizePhone(data.phone);
      
      await api.post('/auth/labour/request-otp', { 
        phone: normalizedPhone 
      });
      
      setPhoneNumber(normalizedPhone);
      // Reset OTP form when moving to OTP step
      otpForm.reset({ otp: '' });
      setStep('otp');
      startResendCooldown();
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to send OTP';
      phoneForm.setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setIsLoading(true);
      
      await api.post('/auth/labour/request-otp', { 
        phone: phoneNumber 
      });
      
      // Reset OTP form when resending
      otpForm.reset({ otp: '' });
      startResendCooldown();
      toast.success('OTP resent successfully!');
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to resend OTP';
      otpForm.setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOTP = async (data: { otp: string }) => {
    try {
      setIsLoading(true);
      
      // Validate OTP format
      if (data.otp.length !== 4 || !/^\d{4}$/.test(data.otp)) {
        throw new Error('OTP must be 4 digits');
      }
      
      // For development, accept 1234 as valid OTP
      // In production, this should verify with backend
      if (import.meta.env.DEV && data.otp !== '1234') {
        throw new Error('Invalid OTP. Use 1234 for development.');
      }
      
      // Reset details form when moving to details step
      detailsForm.reset();
      setStep('details');
    } catch (error: any) {
      otpForm.setError('root', { message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (data: Omit<LabourSignupData, 'phone' | 'otp'>) => {
    try {
      setIsLoading(true);
      
      const signupData: LabourSignupData = {
        phone: phoneNumber,
        otp: otpForm.getValues('otp'),
        ...data,
      };

      await api.post('/auth/labour/signup', signupData);
      
      toast.success('Account created successfully!');
      
      // Auto-login after successful signup
      await login({
        identifier: phoneNumber,
        password: data.password,
      });
      
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
      detailsForm.setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'phone') {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-gray-900">Join as Worker</h1>
            <p className="text-sm text-gray-600 mt-2">
              Enter your phone number to get started.
            </p>
          </div>

          <div className="card-body">
            <form key="phone-form" onSubmit={phoneForm.handleSubmit(handleSendOTP)} className="space-y-6">
              <PhoneInput
                registration={phoneForm.register('phone', {
                  required: 'Phone number is required',
                  validate: (value) => validatePhone(value) || 'Invalid phone number',
                })}
                error={phoneForm.formState.errors.phone?.message}
                autoFocus
                required
              />

              {phoneForm.formState.errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{phoneForm.formState.errors.root.message}</p>
                </div>
              )}

              <Button type="submit" className="w-full" loading={isLoading}>
                Send OTP
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="max-w-md mx-auto">
        <div className="card">
          <div className="card-header">
            <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
            <p className="text-sm text-gray-600 mt-2">
              Enter the 4-digit code sent to {formatPhoneDisplay(phoneNumber)}
            </p>
            {import.meta.env.DEV && (
              <p className="text-xs text-orange-600 mt-1 font-medium">
                Development mode: Use 1234
              </p>
            )}

          </div>

          <div className="card-body">
            <form key="otp-form" onSubmit={otpForm.handleSubmit(handleVerifyOTP)} className="space-y-6">
              <div>
                <label className="form-label">OTP Code</label>
                <input
                  type="text"
                  maxLength={4}
                  className="form-input text-center text-lg tracking-widest"
                  placeholder="Enter 4-digit code"
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  autoFocus
                  {...otpForm.register('otp', {
                    required: 'OTP is required',
                    pattern: {
                      value: /^\d{4}$/,
                      message: 'OTP must be 4 digits',
                    },
                    onChange: (e) => {
                      // Only allow numeric input
                      e.target.value = e.target.value.replace(/\D/g, '');
                    },
                  })}
                />
                {otpForm.formState.errors.otp && (
                  <p className="form-error">{otpForm.formState.errors.otp.message}</p>
                )}
              </div>

              {otpForm.formState.errors.root && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{otpForm.formState.errors.root.message}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    otpForm.reset({ otp: '' });
                    setStep('phone');
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" className="flex-1" loading={isLoading}>
                  Verify
                </Button>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0 || isLoading}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Complete Profile</h1>
          <p className="text-sm text-gray-600 mt-2">
            Tell us about your skills and experience.
          </p>
        </div>

        <div className="card-body">
          <form key="details-form" onSubmit={detailsForm.handleSubmit(handleSignup)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus
                {...detailsForm.register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 100, message: 'Name must be less than 100 characters' },
                })}
              />
              {detailsForm.formState.errors.name && (
                <p className="form-error">{detailsForm.formState.errors.name.message}</p>
              )}
            </div>

            {/* Categories */}
            <div>
              <label className="form-label">Skills/Categories</label>
              <select
                multiple
                className="form-select"
                {...detailsForm.register('categories', {
                  required: 'At least one category is required',
                })}
              >
                {categoriesData?.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              {detailsForm.formState.errors.categories && (
                <p className="form-error">{detailsForm.formState.errors.categories.message}</p>
              )}
            </div>

            {/* Hourly Rate */}
            <div>
              <label className="form-label">Hourly Rate (₹)</label>
              <input
                type="number"
                min="50"
                max="2000"
                className="form-input"
                placeholder="Enter your hourly rate"
                {...detailsForm.register('hourlyRate', {
                  required: 'Hourly rate is required',
                  min: { value: 50, message: 'Minimum rate is ₹50' },
                  max: { value: 2000, message: 'Maximum rate is ₹2000' },
                  valueAsNumber: true,
                })}
              />
              {detailsForm.formState.errors.hourlyRate && (
                <p className="form-error">{detailsForm.formState.errors.hourlyRate.message}</p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="form-label">City</label>
              <select
                className="form-select"
                {...detailsForm.register('city', {
                  required: 'City is required',
                })}
              >
                <option value="">Select your city</option>
                <option value="Hubli">Hubli</option>
                <option value="Dharwad">Dharwad</option>
              </select>
              {detailsForm.formState.errors.city && (
                <p className="form-error">{detailsForm.formState.errors.city.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                {...detailsForm.register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' },
                })}
              />
              {detailsForm.formState.errors.password && (
                <p className="form-error">{detailsForm.formState.errors.password.message}</p>
              )}
            </div>

            {detailsForm.formState.errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{detailsForm.formState.errors.root.message}</p>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  detailsForm.reset();
                  setStep('otp');
                }}
                className="flex-1"
              >
                Back
              </Button>
              <Button type="submit" className="flex-1" loading={isLoading}>
                Create Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LabourSignupPage;