'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseForm, type ExpenseFormValues } from '@/components/dashboard/expenses/expense-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditExpensePage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    const expenseRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/expenses/${params.id}`);
    }, [user, firestore, params.id]);

    const { data: editingExpense, isLoading: isExpenseLoading } = useDoc<Expense>(expenseRef);

    async function handleFormSubmit(values: ExpenseFormValues) {
        if (!user || !firestore || !editingExpense) return;
        setSubmitting(true);
        
        const expenseData = {
          ...values,
          date: values.date.toISOString(),
        };

        try {
            const expenseRef = doc(firestore, `users/${user.uid}/expenses/${editingExpense.id}`);
            await updateDocumentNonBlocking(expenseRef, expenseData);
            router.push('/dashboard/expenses');
        } catch (error) {
          console.error("Error updating expense: ", error);
        } finally {
          setSubmitting(false);
        }
    }

    if (isExpenseLoading) {
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

    if (!editingExpense) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Expense Not Found</CardTitle>
                    <CardDescription>The expense you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Expense</CardTitle>
                <CardDescription>Update the details for this expense.</CardDescription>
            </CardHeader>
            <CardContent>
                <ExpenseForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingExpense} />
            </CardContent>
        </Card>
    );
}
