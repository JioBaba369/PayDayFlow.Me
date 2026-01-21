'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiabilityForm, type LiabilityFormValues } from '@/components/dashboard/net-worth/liability-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddLiabilityPage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    async function handleFormSubmit(values: LiabilityFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        try {
            const docRef = await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/liabilities`), values);
            if (docRef) {
                // After creating the liability, redirect to the 'Add Bill' page with details
                // to prompt the user to create a corresponding recurring bill.
                const queryParams = new URLSearchParams({
                    liabilityId: docRef.id,
                    name: values.name,
                    type: values.type
                });
                router.push(`/dashboard/bills/add?${queryParams.toString()}`);
            } else {
                 router.push('/dashboard/net-worth');
            }
        } catch (error) {
            console.error("Failed to add liability or redirect", error);
            // Fallback redirect
            router.push('/dashboard/net-worth');
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Liability</CardTitle>
                <CardDescription>Enter the details for a new liability.</CardDescription>
            </CardHeader>
            <CardContent>
                <LiabilityForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
