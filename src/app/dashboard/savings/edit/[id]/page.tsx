'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoalForm, type GoalFormValues } from '@/components/dashboard/savings/goal-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { SavingsGoal } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditGoalPage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    const goalRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/savingsGoals/${params.id}`);
    }, [user, firestore, params.id]);

    const { data: editingGoal, isLoading: isGoalLoading } = useDoc<SavingsGoal>(goalRef);

    function handleFormSubmit(values: GoalFormValues) {
        if (!user || !firestore || !editingGoal) return;
        setSubmitting(true);
        
        const goalData = {
          ...values,
          targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
        };

        const goalRefToUpdate = doc(firestore, `users/${user.uid}/savingsGoals/${editingGoal.id}`);
        updateDocumentNonBlocking(goalRefToUpdate, { ...goalData, currentAmount: editingGoal.currentAmount });
        router.push('/dashboard/savings');
    }

    if (isGoalLoading) {
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

    if (!editingGoal) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Savings Goal Not Found</CardTitle>
                    <CardDescription>The goal you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Savings Goal</CardTitle>
                <CardDescription>Update the details of your savings goal.</CardDescription>
            </CardHeader>
            <CardContent>
                <GoalForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingGoal} />
            </CardContent>
        </Card>
    );
}
