'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type Status = 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<Status>('verifying');
  const [message, setMessage] = useState<string>('Verifying your email...');

  useEffect(() => {
    const token = searchParams?.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link.');
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok && data.success) {
          setStatus('success');
          setMessage('Your email has been verified. You can now sign in.');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification link is invalid or has expired.');
        }
      } catch {
        setStatus('error');
        setMessage('Something went wrong while verifying your email.');
      }
    };

    verify();
  }, [searchParams]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-panel p-4">
      <Card className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-text mb-2">Email verification</h1>
        <p
          className={`mb-6 ${
            status === 'error' ? 'text-danger' : 'text-muted'
          }`}
        >
          {message}
        </p>

        {status === 'verifying' && (
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          </div>
        )}

        {(status === 'success' || status === 'error') && (
          <Button variant="primary" className="w-full" onClick={handleGoToLogin}>
            Go to login
          </Button>
        )}
      </Card>
    </div>
  );
}

