'use client';

import type { Unit } from '@/lib/types';

interface UnitHeaderProps {
  unit: Unit;
}

export function UnitHeader({ unit }: UnitHeaderProps) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl font-bold text-text mb-2">{unit.title}</h2>
      <p className="text-muted">{unit.description}</p>
    </div>
  );
}
