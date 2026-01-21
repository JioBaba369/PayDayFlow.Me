'use client';

import { useCallback, type PropsWithChildren } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Plane } from 'lucide-react';
import { signOut, type Auth } from 'firebase/auth';

import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import useIdleTimer from '@/hooks/use-idle-timer';
import { useToast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useAuth, useUser } from '@/firebase';
import { ProfileCompletionGuard } from '@/components/layout/profile-completion-guard';

type DashboardLayoutProps = PropsWithChildren;

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const auth = useAuth() as Auth | null;
  const { user } = useUser();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleIdle = useCallback(async () => {
    if (!auth) return;

    try {
      await signOut(auth);
      toast({
        title: 'Session Expired',
        description: 'You have been signed out due to inactivity.',
      });
      router.replace('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  }, [auth, router, toast]);

  const IDLE_TIMEOUT = 15 * 60 * 1000;

  // Only start idle timer when user is authenticated
  useIdleTimer(handleIdle, IDLE_TIMEOUT, {
    enabled: !!user && !!auth,
  });

  const isProfileCompletionRoute = pathname === '/dashboard/complete-profile';

  return (
    <ProfileCompletionGuard>
      {isProfileCompletionRoute ? (
        children
      ) : (
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarHeader>
              <div className="flex h-16 items-center px-4 font-headline font-semibold text-lg">
                <Plane className="h-6 w-6 mr-2" />
                <span className="group-data-[collapsible=icon]:hidden">
                  PayDayFlow.me
                </span>
              </div>
            </SidebarHeader>

            <SidebarContent>
              <SidebarNav />
            </SidebarContent>
          </Sidebar>

          <SidebarInset>
            <Header />
            <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6">
              {children}
            </main>
          </SidebarInset>

          <BottomNav />
        </SidebarProvider>
      )}
    </ProfileCompletionGuard>
  );
}
