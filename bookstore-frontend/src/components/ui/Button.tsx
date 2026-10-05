import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      )}
      {children}
    </button>
  );
}
