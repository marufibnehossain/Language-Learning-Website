'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

interface OutOfCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OutOfCreditsModal({ isOpen, onClose }: OutOfCreditsModalProps) {
  const router = useRouter();
  const [nextRefill, setNextRefill] = useState<string>('tomorrow');

  useEffect(() => {
    const fetchRefillInfo = async () => {
      try {
        const res = await fetch('/api/wallet');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.lastRefillDate) return;

        const lastRefill = new Date(data.lastRefillDate);
        const tomorrow = new Date(lastRefill);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const now = new Date();
        const hoursUntilRefill =
          (tomorrow.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilRefill <= 0) {
          setNextRefill('soon');
        } else if (hoursUntilRefill < 24) {
          setNextRefill(`in ${Math.ceil(hoursUntilRefill)} hours`);
        } else {
          setNextRefill('tomorrow');
        }
      } catch {
        // ignore
      }
    };

    if (isOpen) {
      fetchRefillInfo();
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Out of Credits">
      <div className="space-y-6">
        <p className="text-muted">
          You don't have enough credits to start this lesson. Credits refill daily!
        </p>

        <div className="bg-panel p-4 rounded-lg">
          <p className="text-sm text-muted">
            Next refill:{' '}
            <span className="font-semibold text-text">{nextRefill}</span>
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            onClick={() => {
              router.push('/practice');
              onClose();
            }}
            className="w-full"
          >
            Free Practice
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Come back tomorrow
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              router.push('/store');
              onClose();
            }}
            className="w-full"
          >
            Buy credits
          </Button>
        </div>
      </div>
    </Modal>
  );
}
