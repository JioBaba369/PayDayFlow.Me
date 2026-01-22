'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { addMenuItems } from '@/lib/nav-config';

export function AddMenuFab() {
  return (
    <div className="md:hidden fixed bottom-20 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" className="rounded-full h-14 w-14 shadow-lg">
            <Plus className="h-6 w-6" />
            <span className="sr-only">Quick Add</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
            <DropdownMenuLabel>Quick Add</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {addMenuItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
