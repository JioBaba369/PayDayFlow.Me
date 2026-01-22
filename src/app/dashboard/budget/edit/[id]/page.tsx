'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetForm, type BudgetFormValues } from '@/components/dashboard/budget/budget-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { BudgetDoc } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditBudgetPage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const { id } = params;

    const budgetRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/budgets/${id}`);
    }, [user, firestore, id]);

    const { data: editingBudget, isLoading: isBudgetLoading } = useDoc<BudgetDoc>(budgetRef);

    function handleFormSubmit(values: BudgetFormValues) {
        if (!user || !firestore || !editingBudget) return;
        setSubmitting(true);

        const budgetRefToUpdate = doc(firestore, `users/${user.uid}/budgets/${editingBudget.id}`);
        updateDocumentNonBlocking(budgetRefToUpdate, values);
        router.push('/dashboard/budget');
    }

    if (isBudgetLoading) {
        return (
             <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-64" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (!editingBudget) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Budget Not Found</CardTitle>
                    <CardDescription>The budget you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Budget</CardTitle>
                <CardDescription>Update the details for this budget category.</CardDescription>
            </CardHeader>
            <CardContent>
                <BudgetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingBudget} />
            </CardContent>
        </Card>
    );
}
