'use client';

import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { Plane } from 'lucide-react';
import useIdleTimer from '@/hooks/use-idle-timer';
import { signOut, Auth } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { BottomNav } from '@/components/layout/bottom-nav';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { ProfileCompletionGuard } from '@/components/layout/profile-completion-guard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const auth = useAuth() as Auth;
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const handleIdle = async () => {
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
  };

  const IDLE_TIMEOUT = 15 * 60 * 1000;

  // ✅ Only start idle timer when user is authenticated
  useIdleTimer(handleIdle, IDLE_TIMEOUT, {
    enabled: !!user,
  });

  // ⛔ Prevent layout + guards from rendering too early
  if (isUserLoading) {
    return null; // or a full-page loader if you want
  }

  if (!user) {
    router.replace('/login');
    return null;
  }

  return (
    <ProfileCompletionGuard>
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
    </ProfileCompletionGuard>
  );
}

