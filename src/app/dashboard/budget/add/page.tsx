'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BudgetForm, type BudgetFormValues } from '@/components/dashboard/budget/budget-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddBudgetPage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    function handleFormSubmit(values: BudgetFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/budgets`), values);
        router.push('/dashboard/budget');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Budget</CardTitle>
                <CardDescription>Create a spending limit for a new category.</CardDescription>
            </CardHeader>
            <CardContent>
                <BudgetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
