import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import PhoneInput from '../../components/ui/PhoneInput';
import { LoginData } from '../../types';
import { validateEmail, validatePhone, normalizePhone } from '../../utils/helpers';

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginData>();

  const onSubmit = async (data: LoginData) => {
    try {
      setIsLoading(true);
      
      // If login method is phone, normalize the phone number
      if (loginMethod === 'phone') {
        data.identifier = normalizePhone(data.identifier);
      }
      
      await login(data);
      // Navigation is handled by AuthContext after successful login
    } catch (error: any) {
      const message = error.response?.data?.error || 'Login failed';
      setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Sign In</h1>
          <p className="text-sm text-gray-600 mt-2">
            Welcome back! Please sign in to your account.
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Login Method Selector */}
            <div>
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => setLoginMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'email'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === 'phone'
                      ? 'bg-white text-primary-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Phone
                </button>
              </div>
            </div>

            {/* Email or Phone Input */}
            {loginMethod === 'email' ? (
              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="Enter your email address"
                  {...register('identifier', {
                    required: 'Email is required',
                    validate: (value) => validateEmail(value) || 'Please enter a valid email address',
                  })}
                />
                {errors.identifier && (
                  <p className="form-error">{errors.identifier.message}</p>
                )}
              </div>
            ) : (
              <PhoneInput
                label="Phone Number"
                placeholder="Enter 10-digit mobile number"
                registration={register('identifier', {
                  required: 'Phone number is required',
                  validate: (value) => validatePhone(value) || 'Please enter a valid 10-digit phone number',
                })}
                error={errors.identifier?.message}
                required
              />
            )}

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Error Message */}
            {errors.root && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.root.message}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <div className="flex flex-col space-y-2">
              <Link
                to="/signup/client"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up as Client
              </Link>
              <Link
                to="/signup/labour"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign up as Worker
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;