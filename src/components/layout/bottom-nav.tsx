'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { bottomNavLinks } from '@/lib/nav-config';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t z-50">
      <nav className="h-full">
        <ul className="h-full grid grid-cols-5 items-center">
          {bottomNavLinks.map((item) => (
            <li key={item.href} className="h-full">
              <Link
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center h-full w-full gap-1 text-xs font-medium',
                   pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
