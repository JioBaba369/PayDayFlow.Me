'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IncomeStreamForm, type IncomeStreamFormValues } from '@/components/dashboard/runway/income-stream-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddIncomePage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    function handleFormSubmit(values: IncomeStreamFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/incomeStreams`), values);
        router.push('/dashboard/runway');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Income Stream</CardTitle>
                <CardDescription>Enter the details of a new source of income.</CardDescription>
            </CardHeader>
            <CardContent>
                <IncomeStreamForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
