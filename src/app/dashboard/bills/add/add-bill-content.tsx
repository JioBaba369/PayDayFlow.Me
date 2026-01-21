'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BillForm, type BillFormValues } from '@/components/dashboard/bills/bill-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';
import type { Liability } from '@/lib/types';

function getCategoryFromLiability(type: Liability['type']): 'Housing' | 'Loan Payment' {
    switch(type) {
        case 'Mortgage':
            return 'Housing';
        case 'Credit Card':
        case 'Auto Loan':
        case 'Student Loan':
        case 'Personal Loan':
        default:
            return 'Loan Payment';
    }
}

export function AddBillContent() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setSubmitting] = useState(false);

    const liabilityId = searchParams.get('liabilityId');
    const liabilityName = searchParams.get('name');
    const liabilityType = searchParams.get('type') as Liability['type'] | null;

    const initialData = useMemo(() => {
        if (!liabilityName || !liabilityType) return null;

        return {
            name: `Payment for ${liabilityName}`,
            category: getCategoryFromLiability(liabilityType),
        };
    }, [liabilityName, liabilityType]);

    function handleFormSubmit(values: BillFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        const billData: any = {
          ...values,
          dueDate: values.dueDate.toISOString(),
          paid: false,
        };

        if (liabilityId) {
            billData.liabilityId = liabilityId;
        }

        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/bills`), billData);
        // If we came from adding a liability, go to the net worth page, otherwise go to the bills page.
        router.push(liabilityId ? '/dashboard/net-worth' : '/dashboard/bills');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>{initialData ? 'Set Up Recurring Bill' : 'Add a New Bill'}</CardTitle>
                <CardDescription>
                    {initialData 
                        ? `You've added "${liabilityName}". Now, let's set up the recurring payment for it.`
                        : 'Enter the details for a new recurring payment.'
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <BillForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={initialData} />
            </CardContent>
        </Card>
    );
}
