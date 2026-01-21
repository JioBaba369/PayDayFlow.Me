'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plane } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { CompleteProfileForm, type CompleteProfileFormValues } from '@/components/dashboard/complete-profile/complete-profile-form';

export default function CompleteProfilePage() {
  const { user } = useUser();
  const firestore = useFirestore() as Firestore;
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(values: CompleteProfileFormValues) {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to complete your profile.',
        });
        return;
    }
    setIsSubmitting(true);
    try {
        const profileRef = doc(firestore, `userProfiles/${user.uid}`);
        await setDoc(profileRef, {
            email: user.email,
            firstName: values.firstName,
            lastName: values.lastName,
            userProfileId: user.uid,
        });
        toast({
            title: 'Profile Completed!',
            description: 'Welcome! You are now being redirected to your dashboard.',
        });
        // The ProfileCompletionGuard will handle the redirect automatically.
    } catch (error) {
        console.error("Error creating profile:", error);
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
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex items-center gap-2 font-semibold font-headline text-lg">
                    <Plane className="h-6 w-6" />
                    <span>PayDayFlow.me</span>
                </div>
                <CardTitle className="text-2xl">Complete Your Profile</CardTitle>
                <CardDescription>
                    Just one more step to get started.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <CompleteProfileForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
            </CardContent>
        </Card>
    </div>
  );
}
