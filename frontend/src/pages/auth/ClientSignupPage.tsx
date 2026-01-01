import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';
import PhoneInput from '../../components/ui/PhoneInput';
import { ClientSignupData } from '../../types';
import { validateEmail, validatePhone, normalizePhone } from '../../utils/helpers';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ClientSignupPage: React.FC = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<ClientSignupData>();

  const onSubmit = async (data: ClientSignupData) => {
    try {
      setIsLoading(true);
      
      // Normalize phone number
      data.phone = normalizePhone(data.phone);

      await api.post('/auth/client/signup', data);
      
      toast.success('Account created successfully!');
      
      // Auto-login after successful signup using email
      await login({
        identifier: data.email,
        password: data.password,
      });
      
    } catch (error: any) {
      const message = error.response?.data?.error || 'Signup failed';
      setError('root', { message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <div className="card-header">
          <h1 className="text-2xl font-bold text-gray-900">Join as Client</h1>
          <p className="text-sm text-gray-600 mt-2">
            Create your account to post jobs and find workers.
          </p>
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                {...register('name', {
                  required: 'Name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 100,
                    message: 'Name must be less than 100 characters',
                  },
                })}
              />
              {errors.name && (
                <p className="form-error">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="Enter your email"
                {...register('email', {
                  required: 'Email is required',
                  validate: (value) => validateEmail(value) || 'Invalid email format',
                })}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <PhoneInput
              registration={register('phone', {
                required: 'Phone number is required',
                validate: (value) => validatePhone(value) || 'Invalid phone number',
              })}
              error={errors.phone?.message}
              required
            />

            {/* Company (Optional) */}
            <div>
              <label className="form-label">Company (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your company name"
                {...register('company', {
                  maxLength: {
                    value: 100,
                    message: 'Company name must be less than 100 characters',
                  },
                })}
              />
              {errors.company && (
                <p className="form-error">{errors.company.message}</p>
              )}
            </div>

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
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in
              </Link>
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Looking for work?{' '}
              <Link
                to="/signup/labour"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Join as Worker
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSignupPage;