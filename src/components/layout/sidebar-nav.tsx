'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  Plane,
  Sparkles,
  User,
  Settings,
  CreditCard,
} from 'lucide-react';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/budget', icon: PiggyBank, label: 'Budget' },
  { href: '/dashboard/bills', icon: Receipt, label: 'Bills' },
  { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
  { href: '/dashboard/savings', icon: Target, label: 'Savings' },
  { href: '/dashboard/net-worth', icon: TrendingUp, label: 'Net Worth' },
  { href: '/dashboard/runway', icon: Plane, label: 'Runway' },
  { href: '/dashboard/profile', icon: User, label: 'Profile' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href) && (item.href !== '/dashboard' || pathname === '/dashboard')}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
