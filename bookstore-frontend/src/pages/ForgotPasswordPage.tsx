import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

export function ForgotPasswordPage() {
  const [sent, setSent] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 justify-center">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-2xl text-gray-900">BookStore</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-6">Reset your password</h1>
          <p className="text-gray-500 mt-1">We'll send a reset link to your email</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Email sent!</h2>
              <p className="text-gray-500 text-sm mb-6">
                If an account exists with that email, you'll receive a reset link shortly.
              </p>
              <Link to="/login" className="text-blue-600 hover:underline text-sm font-medium">
                Back to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message as string}
                {...register('email')}
              />
              <Button type="submit" fullWidth loading={loading} size="lg">
                Send Reset Link
              </Button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-blue-600 hover:underline">
                  Back to sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
