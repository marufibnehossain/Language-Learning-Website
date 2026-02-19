'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const nextFieldErrors: FieldErrors = {};

    if (!email.trim()) {
      nextFieldErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextFieldErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextFieldErrors.password = 'Password is required';
    } else if (password.length < 8) {
      nextFieldErrors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsLoading(true);

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (res?.ok) {
      // Full page redirect so the app layout sees the session cookie immediately
      window.location.href = '/learn';
      return;
    }
    if (res?.error === 'EMAIL_NOT_VERIFIED') {
      setFormError('Please verify your email before signing in.');
    } else if (res?.error) {
      setFormError('Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-text mb-2">Welcome to LangApp</h1>
        <p className="text-muted mb-6">Sign in to continue learning</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.email ? 'border-danger' : 'border-border'
              }`}
              placeholder="Enter your email"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-danger">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.password ? 'border-danger' : 'border-border'
              }`}
              placeholder="Enter your password"
            />
          </div>

          {fieldErrors.password && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>
          )}

          {formError && <p className="text-danger text-sm">{formError}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="text-primary font-semibold hover:text-primary-strong transition-smooth"
            >
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
