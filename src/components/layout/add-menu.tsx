'use client';

import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { addMenuItems } from '@/lib/nav-config';

export function AddMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-2 h-4 w-4" />
          <span>Quick Add</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {addMenuItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
