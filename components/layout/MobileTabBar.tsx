'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo } from 'react';

const baseNavItems = [
  { href: '/learn', label: 'Learn', icon: '📚' },
  { href: '/practice', label: 'Practice', icon: '🎯' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];
const adminNavItem = { href: '/admin/courses', label: 'Admin', icon: '⚙️' };

export function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin ?? false;
  const navItems = useMemo(
    () => (isAdmin ? [...baseNavItems, adminNavItem] : baseNavItems),
    [isAdmin],
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-smooth ${
                isActive ? 'text-primary' : 'text-muted'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
