'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IncomeStreamForm, type IncomeStreamFormValues } from '@/components/dashboard/runway/income-stream-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { IncomeStream } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditIncomePage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const { id } = params;

    const incomeRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/incomeStreams/${id}`);
    }, [user, firestore, id]);

    const { data: editingIncome, isLoading: isIncomeLoading } = useDoc<IncomeStream>(incomeRef);

    function handleFormSubmit(values: IncomeStreamFormValues) {
        if (!user || !firestore || !editingIncome) return;
        setSubmitting(true);

        const incomeRefToUpdate = doc(firestore, `users/${user.uid}/incomeStreams/${editingIncome.id}`);
        updateDocumentNonBlocking(incomeRefToUpdate, values);
        router.push('/dashboard/runway');
    }

    if (isIncomeLoading) {
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

    if (!editingIncome) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Income Stream Not Found</CardTitle>
                    <CardDescription>The income stream you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Income Stream</CardTitle>
                <CardDescription>Update the details of this income source.</CardDescription>
            </CardHeader>
            <CardContent>
                <IncomeStreamForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingIncome} />
            </CardContent>
        </Card>
    );
}
