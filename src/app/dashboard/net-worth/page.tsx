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
import { PlusCircle, Trash2, Camera, Loader2, MoreHorizontal, Pencil } from 'lucide-react';
import { LineChartInteractive } from '@/components/charts/line-chart-interactive';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import type { Asset, Liability, NetWorth, NetWorthHistoryPoint } from '@/lib/types';
import { useUser, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Firestore, doc, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

  const lastMonthNetWorth = netWorthHistory.length > 1 ? netWorthHistory[netWorthHistory.length - 2]?.netWorth || 0 : 0;
  const netWorthChange = currentNetWorth - (netWorthHistory.length > 0 ? netWorthHistory[netWorthHistory.length -1].netWorth : 0);
  const netWorthChangePercentage = lastMonthNetWorth !== 0 ? ((currentNetWorth - lastMonthNetWorth) / Math.abs(lastMonthNetWorth)) * 100 : 0;
  const isGrowthPositive = netWorthChange >= 0;

  async function handleDelete(collectionName: 'assets' | 'liabilities', id: string) {
    if (!user) return;
    await deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/${collectionName}/${id}`));
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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-4">
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
            description={isLoading ? <Skeleton className="h-4 w-48" /> : `${isGrowthPositive ? '+' : ''}${formatCurrency(netWorthChange, currency)} (${netWorthChangePercentage.toFixed(2)}%)`}
            icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          />
           <Card className="flex items-center justify-center">
              <CardContent className="pt-6">
                <Button onClick={handleSnapshot} disabled={isSnapshotting}>
                    {isSnapshotting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
                    Snapshot Net Worth
                </Button>
              </CardContent>
           </Card>
        </div>
        <div className="lg:col-span-2">
          <LineChartInteractive
            data={netWorthHistory}
            currency={currency}
            title="Net Worth History"
            description="Your net worth over time."
            footerText="Tracking your financial growth."
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
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
                    <TableHead className="w-10"></TableHead>
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/dashboard/net-worth/asset/edit/${asset.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete('assets', asset.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
                     <TableHead className="w-10"></TableHead>
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
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                               <Link href={`/dashboard/net-worth/liability/edit/${liability.id}`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                               </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete('liabilities', liability.id)} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
  );
}
