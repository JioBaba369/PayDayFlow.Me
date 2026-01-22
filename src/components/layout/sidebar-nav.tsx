'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { sidebarNavLinks } from '@/lib/nav-config';

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {sidebarNavLinks.map((item) => (
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
