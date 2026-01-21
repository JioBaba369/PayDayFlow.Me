'use client';

import { useState } from 'react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { doc, Firestore } from 'firebase/firestore';
import { ProfileForm, type ProfileFormValues } from '@/components/dashboard/profile/profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import { ProfilePictureUpdater } from '@/components/dashboard/profile/profile-picture-updater';
import { Separator } from '@/components/ui/separator';

export default function ProfilePage() {
  const { user, userProfile, isProfileLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to update your profile.',
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const profileRef = doc(firestore, `userProfiles/${user.uid}`);
        updateDocumentNonBlocking(profileRef, values);
        toast({
            title: 'Profile Updated!',
            description: 'Your changes have been saved successfully.',
        });
    } catch (error) {
        console.error("Error updating profile:", error);
        toast({
            variant: 'destructive',
            title: 'An error occurred.',
            description: 'Could not save your profile. Please try again.',
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
        <Card>
            <CardHeader>
                <CardTitle>My Profile</CardTitle>
                <CardDescription>
                    Manage your personal information and profile picture.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isProfileLoading ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Skeleton className="h-10 w-full" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full mt-2" />
                    </div>
                ) : (
                  <div className="grid md:grid-cols-[auto_1px_1fr] gap-8 items-start">
                    <ProfilePictureUpdater />
                    <Separator orientation="vertical" className="hidden md:block h-auto" />
                    <ProfileForm onSubmit={onSubmit} isSubmitting={isSubmitting} initialData={userProfile} />
                  </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
