'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const nextFieldErrors: FieldErrors = {};

    if (!name.trim()) {
      nextFieldErrors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      nextFieldErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      nextFieldErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const message = data.error || 'Failed to sign up';
        if (message.toLowerCase().includes('email')) {
          setFieldErrors((prev) => ({ ...prev, email: message }));
        } else {
          setFormError(message);
        }
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const token = data.verificationToken as string | undefined;

      setIsLoading(false);

      if (token) {
        router.push(`/verify-email?token=${encodeURIComponent(token)}`);
      } else {
        router.push('/login');
      }
    } catch (err) {
      setFormError('Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-text mb-2">Create Account</h1>
        <p className="text-muted mb-6">Sign up to start learning</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.name ? 'border-danger' : 'border-border'
              }`}
              placeholder="Enter your name"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-danger">{fieldErrors.name}</p>}
          </div>

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
              placeholder="Create a password"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text mb-2">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                fieldErrors.confirmPassword ? 'border-danger' : 'border-border'
              }`}
              placeholder="Confirm your password"
            />
          </div>

          {fieldErrors.password && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.password}</p>
          )}
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-xs text-danger">{fieldErrors.confirmPassword}</p>
          )}

          {formError && <p className="text-danger text-sm">{formError}</p>}

          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-semibold hover:text-primary-strong transition-smooth">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
