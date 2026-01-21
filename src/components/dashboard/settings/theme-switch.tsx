'use client';

import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
        <div className="flex items-center justify-between space-x-2">
            <div className="flex flex-col space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-6 w-11 rounded-full" />
        </div>
    );
  }

  const isDarkMode = theme === 'dark';

  const handleCheckedChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  return (
    <div className="flex items-center justify-between space-x-2">
      <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
        <span>Dark Mode</span>
        <span className="font-normal leading-snug text-muted-foreground">
          Toggle dark mode for the application.
        </span>
      </Label>
      <Switch
        id="dark-mode"
        checked={isDarkMode}
        onCheckedChange={handleCheckedChange}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
