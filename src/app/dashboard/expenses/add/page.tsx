'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseForm, type ExpenseFormValues } from '@/components/dashboard/expenses/expense-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddExpensePage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    function handleFormSubmit(values: ExpenseFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        const expenseData = {
          ...values,
          date: values.date.toISOString(),
        };

        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/expenses`), expenseData);
        router.push('/dashboard/expenses');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Expense</CardTitle>
                <CardDescription>Enter the details for a new expense.</CardDescription>
            </CardHeader>
            <CardContent>
                <ExpenseForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
