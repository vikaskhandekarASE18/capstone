import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Mock users for demo
const MOCK_USERS = [
  {
    id: 'user-1',
    email: 'demo@bookstore.com',
    password: 'password123',
    firstName: 'Demo',
    lastName: 'User',
    phone: '9876543210',
    giftPoints: 250,
    createdAt: '2024-01-01T00:00:00Z',
  },
];

export function LoginPage() {
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';
  const [showPassword, setShowPassword] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setAuthError('');
    // Simulate API call delay
    await new Promise((r) => setTimeout(r, 600));
    const user = MOCK_USERS.find((u) => u.email === data.email && u.password === data.password);
    if (!user) {
      setAuthError('Invalid email or password');
      return;
    }
    const { password: _, ...userData } = user;
    login(userData, 'mock-jwt-token-' + userData.id);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">BookStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Welcome back</h1>
          <p className="text-gray-500 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-xs text-blue-700">
            <strong>Demo:</strong> demo@bookstore.com / password123
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded text-blue-600" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Forgot password?
              </Link>
            </div>

            {authError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {authError}
              </p>
            )}

            <Button type="submit" fullWidth loading={isLoading} size="lg">
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
