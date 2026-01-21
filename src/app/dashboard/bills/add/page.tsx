'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BillForm, type BillFormValues } from '@/components/dashboard/bills/bill-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddBillPage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    async function handleFormSubmit(values: BillFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        const billData = {
          ...values,
          dueDate: values.dueDate.toISOString(),
          paid: false,
        };

        try {
          await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/bills`), billData);
          router.push('/dashboard/bills');
        } catch (error) {
          console.error("Error submitting bill: ", error);
        } finally {
          setSubmitting(false);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Bill</CardTitle>
                <CardDescription>Enter the details for a new recurring payment.</CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
