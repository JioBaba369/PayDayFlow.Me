'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalForm, type GoalFormValues } from '@/components/dashboard/savings/goal-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddGoalPage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    function handleFormSubmit(values: GoalFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);

        const goalData = {
          ...values,
          targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
          currentAmount: 0,
        };
        
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/savingsGoals`), goalData);
        router.push('/dashboard/savings');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Savings Goal</CardTitle>
                <CardDescription>What are you saving for? Set a name, a target amount, and an optional date.</CardDescription>
            </CardHeader>
            <CardContent>
                <GoalForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
