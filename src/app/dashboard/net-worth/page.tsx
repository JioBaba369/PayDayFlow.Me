'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Camera, Loader2, Pencil } from 'lucide-react';
import { LineChartInteractive } from '@/components/charts/line-chart-interactive';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import type { Asset, Liability, NetWorth, NetWorthHistoryPoint } from '@/lib/types';
import { useUser, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Firestore, doc, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function NetWorthPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [isSnapshotting, setSnapshotting] = useState(false);

  const assetsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/assets`), [firestore, user]);
  const liabilitiesQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/liabilities`), [firestore, user]);
  const netWorthQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/netWorths`), orderBy('date', 'desc')), [firestore, user]);

  const { data: assets, isLoading: areAssetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: liabilities, isLoading: areLiabilitiesLoading } = useCollection<Liability>(liabilitiesQuery);
  const { data: netWorthHistoryDocs, isLoading: areNetWorthsLoading } = useCollection<NetWorth>(netWorthQuery);

  const isLoading = isUserLoading || areAssetsLoading || areLiabilitiesLoading || areNetWorthsLoading;
  const currency = userProfile?.currency;

  const totalAssets = useMemo(() => assets?.reduce((sum, asset) => sum + asset.value, 0) || 0, [assets]);
  const totalLiabilities = useMemo(() => liabilities?.reduce((sum, liability) => sum + liability.value, 0) || 0, [liabilities]);
  const currentNetWorth = totalAssets - totalLiabilities;
  
  const netWorthHistory: NetWorthHistoryPoint[] = useMemo(() => {
    if (!netWorthHistoryDocs) return [];
    return netWorthHistoryDocs.map(doc => ({
      date: new Date(doc.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      netWorth: doc.assets - doc.liabilities,
    })).reverse();
  }, [netWorthHistoryDocs]);

  const lastSnapshotNetWorth = useMemo(() => {
    if (!netWorthHistoryDocs || netWorthHistoryDocs.length === 0) return 0;
    const latestSnapshot = netWorthHistoryDocs[0];
    return latestSnapshot.assets - latestSnapshot.liabilities;
  }, [netWorthHistoryDocs]);

  const netWorthChange = currentNetWorth - lastSnapshotNetWorth;
  const netWorthChangePercentage = lastSnapshotNetWorth !== 0 ? (netWorthChange / Math.abs(lastSnapshotNetWorth)) * 100 : 0;
  const isGrowthPositive = netWorthChange >= 0;

  async function handleDelete(collectionName: 'assets' | 'liabilities', id: string) {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/${collectionName}/${id}`));
  }
  
  function handleSnapshot() {
    if (!user) return;
    setSnapshotting(true);
    const newSnapshot = {
      date: new Date().toISOString(),
      assets: totalAssets,
      liabilities: totalLiabilities,
    };
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/netWorths`), newSnapshot).finally(() => {
      setSnapshotting(false);
    });
  }

  return (
      <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <StatCard
            title="Total Assets"
            value={isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalAssets, currency)}
            icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Total Liabilities"
            value={isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(totalLiabilities, currency)}
            icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Net Worth"
            value={isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(currentNetWorth, currency)}
            description={isLoading ? <Skeleton className="h-4 w-48" /> : `Change since last snapshot: ${isGrowthPositive ? '+' : ''}${formatCurrency(netWorthChange, currency)} (${netWorthChangePercentage.toFixed(2)}%)`}
            icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <LineChartInteractive
            data={netWorthHistory}
            currency={currency}
            title="Net Worth History"
            description="Your net worth over time."
            action={
               <Button onClick={handleSnapshot} disabled={isSnapshotting} size="sm">
                    {isSnapshotting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Snapshot
                </Button>
            }
          />
          <div className="grid gap-4 md:grid-cols-1">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assets</CardTitle>
                <Button asChild variant="outline" size="sm"><Link href="/dashboard/net-worth/asset/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Link></Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                      <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading && Array.from({length: 3}).map((_,i) => (
                      <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))}
                    {!isLoading && assets?.map((asset: Asset) => (
                      <TableRow key={asset.id}>
                        <TableCell className="font-medium">{asset.name}</TableCell>
                        <TableCell><Badge variant="outline">{asset.type}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(asset.value, currency)}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button asChild variant="ghost" size="icon">
                              <Link href={`/dashboard/net-worth/asset/edit/${asset.id}`}>
                                <Pencil className="h-4 w-4" />
                                <span className="sr-only">Edit Asset</span>
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('assets', asset.id)}>
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete Asset</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                     {!isLoading && assets?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">No assets added yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Liabilities</CardTitle>
                <Button asChild variant="outline" size="sm"><Link href="/dashboard/net-worth/liability/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Liability</Link></Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                       <TableHead className="w-24 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                     {isLoading && Array.from({length: 2}).map((_,i) => (
                      <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))}
                    {!isLoading && liabilities?.map((liability: Liability) => (
                      <TableRow key={liability.id}>
                        <TableCell className="font-medium">{liability.name}</TableCell>
                        <TableCell><Badge variant="outline">{liability.type}</Badge></TableCell>
                        <TableCell className="text-right">{formatCurrency(liability.value, currency)}</TableCell>
                         <TableCell>
                          <div className="flex items-center justify-end gap-2">
                              <Button asChild variant="ghost" size="icon">
                                <Link href={`/dashboard/net-worth/liability/edit/${liability.id}`}>
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit Liability</span>
                                </Link>
                              </Button>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete('liabilities', liability.id)}>
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Liability</span>
                              </Button>
                            </div>
                         </TableCell>
                      </TableRow>
                    ))}
                    {!isLoading && liabilities?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">No liabilities added yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}
