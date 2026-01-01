import React from 'react';
import { cn } from '../../utils/helpers';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  children,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl border transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';
  
  const variants = {
    primary: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white border-transparent shadow-lg hover:shadow-glow focus:ring-primary-500',
    secondary: 'bg-gradient-to-r from-secondary-500 to-secondary-600 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-secondary-500',
    outline: 'bg-white text-primary-700 border-2 border-primary-300 hover:bg-primary-50 hover:border-primary-500 focus:ring-primary-500',
    success: 'bg-gradient-to-r from-success-500 to-success-600 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-success-500',
    danger: 'bg-gradient-to-r from-danger-500 to-danger-600 text-white border-transparent shadow-lg hover:shadow-xl focus:ring-danger-500',
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        loading && 'cursor-not-allowed',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 animate-spin">
          <div className="w-full h-full border-2 border-current border-t-transparent rounded-full"></div>
        </div>
      )}
      {children}
    </button>
  );
};

export default Button;