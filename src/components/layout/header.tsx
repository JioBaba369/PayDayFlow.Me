'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut, Auth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AddMenu } from './add-menu';


export function Header() {
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');
  const auth = useAuth() as Auth;
  const { user, userProfile } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '..';
  }
  
  const getDisplayName = () => {
    if (userProfile?.firstName && userProfile?.lastName) {
        return `${userProfile.firstName} ${userProfile.lastName}`;
    }
    return user?.email || 'My Account';
  }

  return (
    <header className="flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6">
      <div className="flex w-full items-center gap-4">
        <h1 className="text-xl font-headline font-semibold md:hidden">PayDayFlow.me</h1>
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:block">
            <AddMenu />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                 <Avatar>
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                  ) : userAvatar ? (
                    <AvatarImage
                      src={userAvatar.imageUrl}
                      alt={userAvatar.description}
                      data-ai-hint={userAvatar.imageHint}
                    />
                  ) : (
                    <AvatarFallback>{getInitials()}</AvatarFallback>
                  )}
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{getDisplayName()}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <UserIcon className="h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
