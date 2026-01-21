'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format, parseISO } from 'date-fns';
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
import { PlusCircle, Trash2, Camera, Loader2, Pencil, Download, Link2 } from 'lucide-react';
import { LineChartInteractive } from '@/components/charts/line-chart-interactive';
import { formatCurrency, exportToCsv } from '@/lib/utils';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react';
import type { Asset, Liability, NetWorth, NetWorthHistoryPoint, Bill } from '@/lib/types';
import { useUser, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Firestore, doc, query, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';


const snapshotFormSchema = z.object({
  name: z.string().optional(),
});
type SnapshotFormValues = z.infer<typeof snapshotFormSchema>;

function SnapshotForm({ onSubmit, isSubmitting }: { onSubmit: (values: SnapshotFormValues) => void; isSubmitting: boolean; }) {
  const form = useForm<SnapshotFormValues>({
    resolver: zodResolver(snapshotFormSchema),
    defaultValues: { name: '' },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Snapshot Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder={`e.g., End of Year ${new Date().getFullYear()}`} {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save Snapshot'}
        </Button>
      </form>
    </Form>
  );
}


export default function NetWorthPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [isSnapshotting, setSnapshotting] = useState(false);
  const [isSnapshotDialogOpen, setSnapshotDialogOpen] = useState(false);

  const assetsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/assets`), [firestore, user]);
  const liabilitiesQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/liabilities`), [firestore, user]);
  const netWorthQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/netWorths`), orderBy('date', 'desc')), [firestore, user]);
  const billsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/bills`), [firestore, user]);

  const { data: assets, isLoading: areAssetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: liabilities, isLoading: areLiabilitiesLoading } = useCollection<Liability>(liabilitiesQuery);
  const { data: netWorthHistoryDocs, isLoading: areNetWorthsLoading } = useCollection<NetWorth>(netWorthQuery);
  const { data: bills, isLoading: areBillsLoading } = useCollection<Bill>(billsQuery);

  const isLoading = isUserLoading || areAssetsLoading || areLiabilitiesLoading || areNetWorthsLoading || areBillsLoading;
  const currency = userProfile?.currency;

  const totalAssets = useMemo(() => assets?.reduce((sum, asset) => sum + asset.value, 0) || 0, [assets]);
  const totalLiabilities = useMemo(() => liabilities?.reduce((sum, liability) => sum + liability.value, 0) || 0, [liabilities]);
  const currentNetWorth = totalAssets - totalLiabilities;

  const linkedBillIds = useMemo(() => {
    if (!bills) return new Set();
    return new Set(bills.filter(bill => bill.liabilityId).map(bill => bill.liabilityId));
  }, [bills]);
  
  const netWorthHistory: NetWorthHistoryPoint[] = useMemo(() => {
    if (!netWorthHistoryDocs) return [];
    return netWorthHistoryDocs.map(doc => ({
      date: new Date(doc.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
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

  async function handleDeleteAssetOrLiability(collectionName: 'assets' | 'liabilities', id: string) {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/${collectionName}/${id}`));
  }
  
  async function handleDeleteSnapshot(id: string) {
    if (!user) return;
    deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/netWorths/${id}`));
  }
  
  function handleSnapshotSubmit(values: SnapshotFormValues) {
    if (!user) return;
    setSnapshotting(true);
    const newSnapshot = {
      name: values.name || `Snapshot ${format(new Date(), 'PPP p')}`,
      date: new Date().toISOString(),
      assets: totalAssets,
      liabilities: totalLiabilities,
    };
    addDocumentNonBlocking(collection(firestore, `users/${user.uid}/netWorths`), newSnapshot).finally(() => {
      setSnapshotting(false);
      setSnapshotDialogOpen(false);
    });
  }

  function handleExportSnapshots() {
    if (!netWorthHistoryDocs || netWorthHistoryDocs.length === 0) return;
    const dataToExport = netWorthHistoryDocs.map(snapshot => ({
        date: format(parseISO(snapshot.date), 'yyyy-MM-dd'),
        name: snapshot.name,
        assets: snapshot.assets,
        liabilities: snapshot.liabilities,
        net_worth: snapshot.assets - snapshot.liabilities,
    }));
    exportToCsv('net-worth-snapshots.csv', dataToExport);
  }

  function handleExportAssets() {
    if (!assets || assets.length === 0) return;
    const dataToExport = assets.map(asset => ({
        name: asset.name,
        type: asset.type,
        value: asset.value,
    }));
    exportToCsv('assets.csv', dataToExport);
  }

  function handleExportLiabilities() {
    if (!liabilities || liabilities.length === 0) return;
    const dataToExport = liabilities.map(liability => ({
        name: liability.name,
        type: liability.type,
        value: liability.value,
    }));
    exportToCsv('liabilities.csv', dataToExport);
  }

  return (
      <Dialog open={isSnapshotDialogOpen} onOpenChange={setSnapshotDialogOpen}>
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
              title="Live Net Worth"
              value={isLoading ? <Skeleton className="h-8 w-32" /> : formatCurrency(currentNetWorth, currency)}
              description={isLoading || netWorthHistoryDocs?.length === 0 ? "Take a snapshot to track change" : `Change since last snapshot: ${isGrowthPositive ? '+' : ''}${formatCurrency(netWorthChange, currency)} (${netWorthChangePercentage.toFixed(2)}%)`}
              icon={<Scale className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <LineChartInteractive
              data={netWorthHistory}
              currency={currency}
              title="Net Worth History"
              description="A historical view of your saved net worth snapshots."
              action={
                <DialogTrigger asChild>
                  <Button size="sm">
                      <Camera className="mr-2 h-4 w-4" />
                      New Snapshot
                  </Button>
                </DialogTrigger>
              }
            />
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Snapshot History</CardTitle>
                    <CardDescription>A record of your previous net worth snapshots.</CardDescription>
                  </div>
                   <Button variant="outline" size="sm" onClick={handleExportSnapshots} disabled={!netWorthHistoryDocs || netWorthHistoryDocs.length === 0}>
                      <Download className="mr-2 h-4 w-4" />
                      Export
                  </Button>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Net Worth</TableHead>
                        <TableHead className="w-[50px] text-right">Action</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {areNetWorthsLoading && Array.from({length: 3}).map((_,i) => (
                        <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
                    ))}
                    {!areNetWorthsLoading && netWorthHistoryDocs?.map(snapshot => {
                        const netWorth = snapshot.assets - snapshot.liabilities;
                        return (
                        <TableRow key={snapshot.id}>
                            <TableCell>{format(parseISO(snapshot.date), 'PPP')}</TableCell>
                            <TableCell className="font-medium">{snapshot.name}</TableCell>
                            <TableCell className="text-right">{formatCurrency(netWorth, currency)}</TableCell>
                            <TableCell className="text-right">
                                <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleDeleteSnapshot(snapshot.id)}>
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete snapshot</span>
                                </Button>
                            </TableCell>
                        </TableRow>
                        )
                    })}
                    {!areNetWorthsLoading && netWorthHistoryDocs?.length === 0 && <TableRow><TableCell colSpan={4} className="text-center h-24">No snapshots recorded yet.</TableCell></TableRow>}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Assets</CardTitle>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportAssets} disabled={!assets || assets.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild variant="outline" size="sm"><Link href="/dashboard/net-worth/asset/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Asset</Link></Button>
                </div>
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
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteAssetOrLiability('assets', asset.id)}>
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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handleExportLiabilities} disabled={!liabilities || liabilities.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                    <Button asChild variant="outline" size="sm"><Link href="/dashboard/net-worth/liability/add"><PlusCircle className="mr-2 h-4 w-4" /> Add Liability</Link></Button>
                </div>
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
                        <TableCell className="font-medium flex items-center gap-2">
                          {liability.name}
                          {linkedBillIds.has(liability.id) && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Link2 className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>A recurring bill is linked to this liability.</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          </TableCell>
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
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteAssetOrLiability('liabilities', liability.id)}>
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
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Snapshot</DialogTitle>
                <DialogDescription>
                    Optionally give this snapshot a name to easily identify it later.
                </DialogDescription>
            </DialogHeader>
            <SnapshotForm onSubmit={handleSnapshotSubmit} isSubmitting={isSnapshotting} />
        </DialogContent>
      </Dialog>
  );
}
