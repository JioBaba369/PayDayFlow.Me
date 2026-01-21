'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BillForm, type BillFormValues } from '@/components/dashboard/bills/bill-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { Bill } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBillPage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    const billRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/bills/${params.id}`);
    }, [user, firestore, params.id]);

    const { data: editingBill, isLoading: isBillLoading } = useDoc<Bill>(billRef);

    function handleFormSubmit(values: BillFormValues) {
        if (!user || !firestore || !editingBill) return;
        setSubmitting(true);
        
        const billData = {
          ...values,
          dueDate: values.dueDate.toISOString(),
        };

        const billRefToUpdate = doc(firestore, `users/${user.uid}/bills/${editingBill.id}`);
        updateDocumentNonBlocking(billRefToUpdate, { ...billData, paid: editingBill.paid });
        router.push('/dashboard/bills');
    }

    if (isBillLoading) {
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
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!editingBill) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Bill Not Found</CardTitle>
                    <CardDescription>The bill you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Bill</CardTitle>
                <CardDescription>Update the details for this recurring payment.</CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingBill} />
            </CardContent>
        </Card>
    );
}
