
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { LayoutDashboard, Wallet, Receipt, PiggyBank, TrendingUp, Rocket, Settings, LogOut } from 'lucide-react';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/budget', label: 'Budgeting', icon: Wallet },
  { href: '/dashboard/bills', label: 'Bills', icon: Receipt },
  { href: '/dashboard/savings', label: 'Savings', icon: PiggyBank },
  { href: '/dashboard/net-worth', label: 'Net Worth', icon: TrendingUp },
  { href: '/dashboard/runway', label: 'Runway', icon: Rocket },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
        <SidebarHeader className="p-4">
            <Logo />
        </SidebarHeader>
        <div className="flex-1 overflow-y-auto">
            <SidebarMenu className="w-full p-4">
                {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <Link href={item.href}>
                    <SidebarMenuButton isActive={pathname === item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </div>
         <SidebarFooter className="p-4">
            <SidebarMenu>
                <SidebarMenuItem>
                     <SidebarMenuButton>
                        <Settings />
                        <span>Settings</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <Link href="/">
                        <SidebarMenuButton>
                            <LogOut />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </div>
  );
}
