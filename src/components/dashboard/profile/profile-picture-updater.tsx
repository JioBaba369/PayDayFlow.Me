'use client';

import { useState, useRef } from 'react';
import { useAuth, useUser, useStorage } from '@/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Camera } from 'lucide-react';
import { Auth } from 'firebase/auth';
import type { FirebaseStorage } from 'firebase/storage';

export function ProfilePictureUpdater() {
    const { user, userProfile } = useUser();
    const auth = useAuth() as Auth;
    const storage = useStorage() as FirebaseStorage;
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getInitials = () => {
        if (userProfile?.firstName && userProfile?.lastName) {
          return `${userProfile.firstName[0]}${userProfile.lastName[0]}`.toUpperCase();
        }
        if (user?.email) {
          return user.email.substring(0, 2).toUpperCase();
        }
        return '..';
    };

    const handleAvatarClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user || !auth.currentUser) return;

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast({ variant: 'destructive', title: 'File is too large', description: 'Please upload an image smaller than 5MB.' });
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast({ variant: 'destructive', title: 'Invalid file type', description: 'Please upload an image file.' });
            return;
        }

        setIsUploading(true);

        try {
            const storageRef = ref(storage, `profile-pictures/${user.uid}`);
            
            const snapshot = await uploadBytes(storageRef, file);
            
            const photoURL = await getDownloadURL(snapshot.ref);

            await updateProfile(auth.currentUser, { photoURL });

            toast({ title: 'Profile picture updated!', description: 'Your new picture is now visible.' });

        } catch (error) {
            console.error("Error updating profile picture:", error);
            toast({ variant: 'destructive', title: 'Upload failed', description: 'Could not update your profile picture. Please try again.' });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4 py-4">
             <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
                disabled={isUploading}
            />
            <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                <Avatar className="h-24 w-24">
                    {user?.photoURL ? (
                        <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
                    ) : (
                        <AvatarFallback className="text-3xl">{getInitials()}</AvatarFallback>
                    )}
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    {isUploading ? (
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    ) : (
                        <Camera className="h-8 w-8 text-white" />
                    )}
                </div>
            </div>
             <p className="text-sm text-muted-foreground">Click image to upload</p>
        </div>
    );
}
