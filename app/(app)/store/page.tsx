'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getCurrentBalance } from '@/lib/credits';

export default function StorePage() {
  const currentBalance = getCurrentBalance();

  const creditPackages = [
    { credits: 50, price: '$4.99', popular: false },
    { credits: 100, price: '$8.99', popular: true },
    { credits: 200, price: '$15.99', popular: false },
  ];

  return (
    <div className="min-h-screen bg-panel py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-text mb-2">Store</h1>
        <p className="text-muted mb-8">Buy credits to continue learning</p>

        <div className="mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted">Current Balance</p>
                <p className="text-3xl font-bold text-text">{currentBalance} credits</p>
              </div>
              <div className="text-4xl">💎</div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {creditPackages.map((pkg, index) => (
            <Card
              key={index}
              className={`relative ${pkg.popular ? 'border-2 border-primary' : ''}`}
            >
              {pkg.popular && (
                <Badge variant="primary" className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <div className="text-center">
                <div className="text-4xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-text mb-2">{pkg.credits} Credits</h3>
                <p className="text-3xl font-bold text-primary mb-6">{pkg.price}</p>
                <Button variant={pkg.popular ? 'primary' : 'secondary'} className="w-full" disabled>
                  Coming Soon
                </Button>
                <p className="text-xs text-muted mt-2">
                  Payment integration not implemented in MVP
                </p>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <h2 className="text-xl font-bold text-text mb-4">How Credits Work</h2>
          <ul className="space-y-2 text-muted">
            <li>• Credits are spent only when you start a lesson attempt (5 credits per attempt)</li>
            <li>• Practice modes are completely free</li>
            <li>• You get 20 credits refilled daily</li>
            <li>• First lesson of the day gives you a 5 credit bonus</li>
            <li>• Maximum credit cap is 100</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
