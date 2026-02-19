'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
  const baseStyles = 'bg-white rounded-lg border border-border p-6';
  const hoverStyles = hover ? 'transition-smooth hover:shadow-soft hover:scale-[1.02] cursor-pointer' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${baseStyles} ${hoverStyles} ${className}`}
    >
      {children}
    </motion.div>
  );
}
