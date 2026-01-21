'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetForm, type AssetFormValues } from '@/components/dashboard/net-worth/asset-form';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection, Firestore } from 'firebase/firestore';

export default function AddAssetPage() {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);

    function handleFormSubmit(values: AssetFormValues) {
        if (!user || !firestore) return;
        setSubmitting(true);
        
        addDocumentNonBlocking(collection(firestore, `users/${user.uid}/assets`), values);
        router.push('/dashboard/net-worth');
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Add a New Asset</CardTitle>
                <CardDescription>Enter the details for a new asset.</CardDescription>
            </CardHeader>
            <CardContent>
                <AssetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={null} />
            </CardContent>
        </Card>
    );
}
