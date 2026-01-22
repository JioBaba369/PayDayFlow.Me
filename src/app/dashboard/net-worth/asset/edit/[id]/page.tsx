'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AssetForm, type AssetFormValues } from '@/components/dashboard/net-worth/asset-form';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { doc, Firestore } from 'firebase/firestore';
import type { Asset } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditAssetPage({ params }: { params: { id: string }}) {
    const { user } = useUser();
    const firestore = useFirestore() as Firestore;
    const router = useRouter();
    const [isSubmitting, setSubmitting] = useState(false);
    const { id } = params;

    const assetRef = useMemo(() => {
        if (!user || !firestore) return null;
        return doc(firestore, `users/${user.uid}/assets/${id}`);
    }, [user, firestore, id]);

    const { data: editingAsset, isLoading: isAssetLoading } = useDoc<Asset>(assetRef);

    function handleFormSubmit(values: AssetFormValues) {
        if (!user || !firestore || !editingAsset) return;
        setSubmitting(true);

        const assetRefToUpdate = doc(firestore, `users/${user.uid}/assets/${editingAsset.id}`);
        updateDocumentNonBlocking(assetRefToUpdate, values);
        router.push('/dashboard/net-worth');
    }

    if (isAssetLoading) {
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

    if (!editingAsset) {
        return (
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Asset Not Found</CardTitle>
                    <CardDescription>The asset you are trying to edit does not exist or could not be loaded.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Edit Asset</CardTitle>
                <CardDescription>Update the details for this asset.</CardDescription>
            </CardHeader>
            <CardContent>
                <AssetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingAsset} />
            </CardContent>
        </Card>
    );
}
