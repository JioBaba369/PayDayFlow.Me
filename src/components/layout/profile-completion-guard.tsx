'use client';

import { useUser } from '@/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function ProfileCompletionGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading, userProfile, isProfileLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const isLoading = isUserLoading || isProfileLoading;

  useEffect(() => {
    if (isLoading) return;

    // If not authenticated, send to login page.
    if (!user) {
      router.push('/login');
      return;
    }

    // If authenticated but no profile, send to complete profile page.
    // Exception: Don't redirect if already on the complete-profile page.
    if (!userProfile && pathname !== '/dashboard/complete-profile') {
      router.push('/dashboard/complete-profile');
      return;
    }
    
    // If authenticated and has a profile, but is on the complete profile page,
    // send to the main dashboard.
    if (userProfile && pathname === '/dashboard/complete-profile') {
        router.push('/dashboard');
    }

  }, [user, userProfile, isLoading, router, pathname]);

  if (isLoading) {
      return (
       <div className="flex min-h-screen">
        <div className="hidden md:block md:w-64 border-r p-4">
          <div className="flex items-center gap-2 mb-8">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
          </div>
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }
  
  // If user has no profile and is not on the complete-profile page, show a loader while redirecting.
  if (!userProfile && pathname !== '/dashboard/complete-profile') {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-12 w-12 animate-spin" />
        </div>
      );
  }

  // Otherwise, render the children (the dashboard layout or the complete-profile page itself)
  return <>{children}</>;
}
