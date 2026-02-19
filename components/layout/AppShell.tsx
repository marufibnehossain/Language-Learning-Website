'use client';

import { ReactNode, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CreditPill } from '../app/CreditPill';
import { StreakBadge } from '../app/StreakBadge';
import { XpChip } from '../app/XpChip';
import { MobileTabBar } from './MobileTabBar';

interface AppShellProps {
  children: ReactNode;
}

const baseNavItems = [
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/practice', label: 'Practice', icon: '🎯' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

const adminNavItem = { href: '/admin/courses', label: 'Admin', icon: '⚙️' };

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  const navItems = useMemo(
    () => (isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems),
    [isAdmin],
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop Layout */}
      <div className="hidden md:flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-border p-6 flex flex-col">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-primary">LangApp</h1>
          </div>
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                    isActive
                      ? 'bg-primary-soft text-primary-strong font-semibold'
                      : 'text-muted hover:bg-panel hover:text-text'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b border-border px-6 py-4">
            <div className="flex items-center justify-end gap-4">
              {isAdmin && (
                <Link
                  href="/admin/courses"
                  className="px-4 py-2 rounded-lg bg-primary-soft text-primary-strong font-semibold hover:bg-primary hover:text-white transition-smooth text-sm"
                >
                  Manage courses
                </Link>
              )}
              <CreditPill />
              <StreakBadge />
              <XpChip />
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-border px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold text-primary">LangApp</h1>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin/courses"
                  className="px-3 py-1.5 rounded-lg bg-primary-soft text-primary-strong font-semibold text-sm"
                >
                  Manage courses
                </Link>
              )}
              <CreditPill />
              <StreakBadge />
            </div>
          </div>
          <XpChip />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20">{children}</main>

        {/* Bottom Tab Bar */}
        <MobileTabBar />
      </div>
    </div>
  );
}
