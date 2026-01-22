'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiabilityForm, type LiabilityFormValues } from '@/components/dashboard/net-worth/liability-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { Liability } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditLiabilityPage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const { id } = params;

    const liabilityRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/liabilities/${id}`);
    }, [user, firestore, id]);

    const { data: editingLiability, isLoading: isLiabilityLoading } = useDoc<Liability>(liabilityRef);

    function handleFormSubmit(values: LiabilityFormValues) {
        if (!user || !firestore || !editingLiability) return;
        setSubmitting(true);

        const liabilityRefToUpdate = doc(firestore, `users/${user.uid}/liabilities/${editingLiability.id}`);
        updateDocumentNonBlocking(liabilityRefToUpdate, values);
        router.push('/dashboard/net-worth');
    }

    if (isLiabilityLoading) {
        return (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!editingLiability) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Liability Not Found</CardTitle>
                    <CardDescription>The liability you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Liability</CardTitle>
                <CardDescription>Update the details for this liability.</CardDescription>
            </CardHeader>
            <CardContent>
                <LiabilityForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingLiability} />
            </CardContent>
        </Card>
    );
}
