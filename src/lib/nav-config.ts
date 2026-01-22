import {
  LayoutDashboard,
  PiggyBank,
  Receipt,
  Target,
  TrendingUp,
  Plane,
  CreditCard,
  User,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export const sidebarNavLinks: { href: string; icon: LucideIcon; label: string; }[] = [
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

export const bottomNavLinks: { href: string; icon: LucideIcon; label: string; }[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/bills', icon: Receipt, label: 'Bills' },
  { href: '/dashboard/expenses', icon: CreditCard, label: 'Expenses' },
  { href: '/dashboard/budget', icon: PiggyBank, label: 'Budget' },
  { href: '/dashboard/savings', icon: Target, label: 'Savings' },
];

export const addMenuItems: { href: string; label: string; }[] = [
    { href: '/dashboard/expenses/add', label: 'Add Expense' },
    { href: '/dashboard/bills/add', label: 'Add Bill' },
    { href: '/dashboard/budget/add', label: 'Add Budget' },
    { href: '/dashboard/savings/add', label: 'Add Savings Goal' },
    { href: '/dashboard/net-worth/asset/add', label: 'Add Asset' },
    { href: '/dashboard/net-worth/liability/add', label: 'Add Liability' },
    { href: '/dashboard/runway/income/add', label: 'Add Income' },
];
