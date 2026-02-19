'use client';

import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium';
  
  const variantStyles = {
    default: 'bg-panel text-text',
    primary: 'bg-primary-soft text-primary-strong',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-warning/20 text-warning',
    danger: 'bg-danger/20 text-danger',
  };

  return (
    <span className={`${baseStyles} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
}
