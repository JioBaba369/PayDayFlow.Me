'use client';

import { useState, useMemo } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatCurrency } from '@/lib/utils';
import { PiggyBank, Briefcase, MinusCircle, Hourglass, PlusCircle, Trash2, MoreHorizontal, Pencil } from 'lucide-react';
import { useUser, useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, Firestore, query, where, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { IncomeStream, Bill, Expense, SavingsGoal, Asset } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { IncomeStreamForm, type IncomeStreamFormValues } from '@/components/dashboard/runway/income-stream-form';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

export default function RunwayPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [editingStream, setEditingStream] = useState<IncomeStream | null>(null);

  // Queries
  const incomeQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/incomeStreams`), [firestore, user]);
  const billsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/bills`), [firestore, user]);
  const savingsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/savingsGoals`), [firestore, user]);
  const assetsQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/assets`), where('type', '==', 'Cash')), [firestore, user]);

  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const expensesQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/expenses`), where('date', '>=', threeMonthsAgo.toISOString())), [firestore, user]);

  // Data fetching
  const { data: incomeStreams, isLoading: incomeLoading } = useCollection<IncomeStream>(incomeQuery);
  const { data: bills, isLoading: billsLoading } = useCollection<Bill>(billsQuery);
  const { data: savingsGoals, isLoading: savingsLoading } = useCollection<SavingsGoal>(savingsQuery);
  const { data: cashAssets, isLoading: assetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: recentExpenses, isLoading: expensesLoading } = useCollection<Expense>(expensesQuery);
  
  const isLoading = isUserLoading || incomeLoading || billsLoading || savingsLoading || assetsLoading || expensesLoading;
  const currency = userProfile?.currency;

  // Calculations
  const { monthlyIncome, monthlyFixedExpenses, monthlyVariableExpenses, savingsVelocity, totalSavings, monthlyBurn, runwayMonths } = useMemo(() => {
    const monthlyIncome = incomeStreams?.reduce((sum, stream) => {
      switch (stream.schedule) {
        case 'Monthly': return sum + stream.amount;
        case 'Bi-Weekly': return sum + stream.amount * 2;
        case 'Yearly': return sum + stream.amount / 12;
        case 'One-Time': return sum; // One-time is not a recurring monthly income
        default: return sum;
      }
    }, 0) || 0;

    const monthlyFixedExpenses = bills?.reduce((sum, bill) => sum + bill.amount, 0) || 0;

    const monthsWithExpenses = new Set(recentExpenses?.map(e => e.date.substring(0, 7))).size || 1;
    const totalVariableExpenses = recentExpenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const monthlyVariableExpenses = totalVariableExpenses / monthsWithExpenses;

    const savingsVelocity = monthlyIncome - (monthlyFixedExpenses + monthlyVariableExpenses);
    
    const totalCashAssets = cashAssets?.reduce((sum, asset) => sum + asset.value, 0) || 0;
    const totalSavings = totalCashAssets; // Total savings is just cash on hand for runway calc

    const monthlyBurn = (monthlyFixedExpenses + monthlyVariableExpenses) - monthlyIncome;
    const runwayMonths = (monthlyBurn > 0 && totalSavings > 0) ? totalSavings / monthlyBurn : Infinity;

    return { monthlyIncome, monthlyFixedExpenses, monthlyVariableExpenses, savingsVelocity, totalSavings, monthlyBurn, runwayMonths };
  }, [incomeStreams, bills, recentExpenses, cashAssets]);
  
  function handleOpenDialog(stream: IncomeStream | null = null) {
    setEditingStream(stream);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: IncomeStreamFormValues) {
    if (!user) return;
    setSubmitting(true);

    try {
        if (editingStream) {
            const streamRef = doc(firestore, `users/${user.uid}/incomeStreams/${editingStream.id}`);
            await updateDocumentNonBlocking(streamRef, values);
        } else {
            await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/incomeStreams`), values);
        }
        setDialogOpen(false);
        setEditingStream(null);
    } catch (error) {
        console.error("Error submitting income stream: ", error);
    } finally {
        setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if(!user) return;
    await deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/incomeStreams/${id}`));
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
    <div className="grid gap-6">
       <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">Personal Runway</h1>
          <p className="text-muted-foreground">A founder-style dashboard for your personal finances.</p>
        </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Burn Rate" value={isLoading ? <Skeleton className="h-8 w-24"/> : formatCurrency(monthlyBurn, currency)} description={monthlyBurn > 0 ? 'Cash flow negative' : 'Cash flow positive'} icon={<MinusCircle className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Savings Velocity" value={isLoading ? <Skeleton className="h-8 w-24"/> : formatCurrency(savingsVelocity, currency)} description="Amount saved per month" icon={<PiggyBank className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Runway" value={isLoading ? <Skeleton className="h-8 w-24"/> : isFinite(runwayMonths) ? `${runwayMonths.toFixed(1)} months` : 'Infinite'} description="Until savings run out" icon={<Hourglass className="h-4 w-4 text-muted-foreground" />} />
        <StatCard title="Total Savings" value={isLoading ? <Skeleton className="h-8 w-24"/> : formatCurrency(totalSavings, currency)} description="Your financial cushion" icon={<Briefcase className="h-4 w-4 text-muted-foreground" />} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
                <CardTitle>Income Streams</CardTitle>
                <CardDescription>Your sources of monthly income.</CardDescription>
            </div>
            <Button size="sm" onClick={() => handleOpenDialog()}><PlusCircle className="h-4 w-4 mr-2" />Add Income</Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({length: 2}).map((_, i) => <TableRow key={i}><TableCell colSpan={4}><Skeleton className="h-8 w-full"/></TableCell></TableRow>)}
                {!isLoading && incomeStreams?.map(stream => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">{stream.name}</TableCell>
                    <TableCell>{stream.schedule}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stream.amount, currency)}</TableCell>
                    <TableCell>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4"/></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenDialog(stream)}>
                                    <Pencil className="mr-2 h-4 w-4"/> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(stream.id)} className="text-destructive">
                                    <Trash2 className="mr-2 h-4 w-4"/> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                 {!isLoading && incomeStreams?.length === 0 && <TableRow><TableCell colSpan={4} className="h-24 text-center">No income streams added.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>An overview of your estimated monthly costs.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Monthly Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Fixed Expenses (Bills)</TableCell>
                  <TableCell className="text-right">{isLoading ? <Skeleton className="h-5 w-20 ml-auto"/> : formatCurrency(monthlyFixedExpenses, currency)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Variable Expenses (Avg.)</TableCell>
                  <TableCell className="text-right">{isLoading ? <Skeleton className="h-5 w-20 ml-auto"/> : formatCurrency(monthlyVariableExpenses, currency)}</TableCell>
                </TableRow>
                 <TableRow className="font-bold">
                  <TableCell>Total Expenses</TableCell>
                  <TableCell className="text-right">{isLoading ? <Skeleton className="h-5 w-20 ml-auto"/> : formatCurrency(monthlyFixedExpenses + monthlyVariableExpenses, currency)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
    <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingStream ? 'Edit' : 'Add'} Income Stream</DialogTitle>
          <DialogDescription>
            {editingStream ? 'Update the details of this income source.' : 'Enter the details of a new source of income.'}
          </DialogDescription>
        </DialogHeader>
        <IncomeStreamForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingStream} />
      </DialogContent>
    </Dialog>
  );
}
