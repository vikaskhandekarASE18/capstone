import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const registerSchema = z
  .object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters').regex(/[A-Z]/, 'Must contain uppercase').regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const user = {
      id: 'user-' + Date.now(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      giftPoints: 50, // Welcome bonus
      createdAt: new Date().toISOString(),
    };
    login(user, 'mock-jwt-token-' + user.id);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">BookStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of book lovers</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-6 text-xs text-purple-700">
            🎁 Get 50 gift points as a welcome bonus when you register!
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                error={errors.firstName?.message}
                {...register('firstName')}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                error={errors.lastName?.message}
                {...register('lastName')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+91 98765 43210"
              {...register('phone')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, uppercase + number"
              error={errors.password?.message}
              {...register('password')}
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" fullWidth loading={loading} size="lg">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
