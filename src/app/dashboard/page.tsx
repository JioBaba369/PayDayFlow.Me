'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/dashboard/stat-card';
import { formatCurrency } from '@/lib/utils';
import { useUser, useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where, limit, orderBy, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Bill, SavingsGoal, Expense, Asset } from '@/lib/types';
import { differenceInDays, parseISO, startOfMonth, format, endOfMonth } from 'date-fns';
import { DollarSign, Wallet, Calendar, TrendingUp, PlusCircle, ArrowUpRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { ExpenseForm, type ExpenseFormValues } from '@/components/dashboard/expenses/expense-form';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Confidence Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
            <Skeleton className="h-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
             <Skeleton className="h-64 rounded-lg" />
             <Skeleton className="h-64 rounded-lg" />
             <Skeleton className="h-48 rounded-lg lg:col-span-2" />
        </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore | null;

  const [isExpenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [isSubmittingExpense, setSubmittingExpense] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('action') === 'add-expense') {
      setExpenseDialogOpen(true);
    }
  }, [searchParams]);

  const handleExpenseDialogOpenChange = (open: boolean) => {
    setExpenseDialogOpen(open);
    if (!open) {
      router.replace(pathname, { scroll: false });
    }
  }

  const ready = !!user && !!firestore && !isUserLoading;
  const currency = userProfile?.currency;

  // --- SAFE QUERIES ---
  // Fetch all bills and filter/sort on the client to avoid composite index requirement.
  const billsQuery = useMemo(() => {
    if (!ready) return undefined;
    return collection(firestore!, `users/${user!.uid}/bills`);
  }, [ready, firestore, user]);

  const savingsGoalsQuery = useMemo(() => {
    if (!ready) return undefined;
    return query(
      collection(firestore!, `users/${user!.uid}/savingsGoals`),
      limit(3)
      );
  }, [ready, firestore, user]);

  const expensesQuery = useMemo(() => {
    if (!ready) return undefined;
    const monthStart = startOfMonth(new Date()).toISOString();
    return query(
      collection(firestore!, `users/${user!.uid}/expenses`),
      orderBy('date', 'desc'),
      where('date', '>=', monthStart)
    );
  }, [ready, firestore, user]);

  const assetsQuery = useMemo(() => {
    if (!ready) return undefined;
    return query(
      collection(firestore!, `users/${user!.uid}/assets`),
      where('type', '==', 'Cash')
    );
  }, [ready, firestore, user]);

  // --- DATA FETCHING (SAFE) ---
  const {data: allBills, isLoading: areBillsLoading} = useCollection<Bill>(billsQuery);
  const {data: goals, isLoading: areGoalsLoading} = useCollection<SavingsGoal>(savingsGoalsQuery);
  const {data: expenses, isLoading: areExpensesLoading} = useCollection<Expense>(expensesQuery);
  const {data: assets, isLoading: areAssetsLoading} = useCollection<Asset>(assetsQuery);

  const isLoading =
    isUserLoading ||
    areBillsLoading ||
    areGoalsLoading ||
    areExpensesLoading ||
    areAssetsLoading;

  // --- DERIVED DATA ---
  
  // Filter and sort bills on the client
  const unpaidBills = useMemo(() => {
    if (!allBills) return [];
    return allBills
      .filter(bill => !bill.paid)
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  }, [allBills]);

  const recentExpenses = expenses?.slice(0, 5) ?? [];
  const cashLeft = assets?.reduce((s, a) => s + a.value, 0) ?? 0;
  const totalMonthlySpending = expenses?.reduce((s, e) => s + e.amount, 0) ?? 0;
  
  const dayOfMonth = new Date().getDate();
  // Ensure we don't divide by zero, although getDate() is 1-31.
  // This makes the logic more robust and explicit.
  const spendingPace = dayOfMonth > 0 ? totalMonthlySpending / dayOfMonth : 0;

  const upcomingBills = unpaidBills?.slice(0, 5) ?? [];

  const totalUpcomingBills = useMemo(() => {
    if (!unpaidBills) return 0;
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    return unpaidBills
      .filter(bill => {
        const dueDate = parseISO(bill.dueDate);
        return dueDate >= now && dueDate <= thirtyDaysFromNow;
      })
      .reduce((sum, bill) => sum + bill.amount, 0);
  }, [unpaidBills]);

  const savingsProgress = useMemo(() => {
    if (!goals || goals.length === 0) return { current: 0, target: 0, percent: 0};
    const current = goals.reduce((s, g) => s + g.currentAmount, 0);
    const target = goals.reduce((s, g) => s + g.targetAmount, 0);
    return {
      current,
      target,
      percent: target > 0 ? (current / target) * 100 : 0,
    };
  }, [goals]);

  // --- EVENTS ---
  async function handleAddExpense(values: ExpenseFormValues) {
    if (!ready) return;
    setSubmittingExpense(true);
    try {
      await addDocumentNonBlocking(
        collection(firestore!, `users/${user!.uid}/expenses`),
        {
          ...values,
          date: values.date.toISOString(),
        }
      );
      setExpenseDialogOpen(false);
    } finally {
      setSubmittingExpense(false);
    }
  }
  
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // --- RENDER ---
  return (
    <Dialog open={isExpenseDialogOpen} onOpenChange={handleExpenseDialogOpenChange}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold font-headline tracking-tight">Confidence Dashboard</h1>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Cash on Hand" value={formatCurrency(cashLeft, currency)} icon={<Wallet className="h-4 w-4 text-muted-foreground" />} description="Across all cash accounts" />
          <StatCard title="Upcoming Bills" value={formatCurrency(totalUpcomingBills, currency)} icon={<Calendar className="h-4 w-4 text-muted-foreground" />} description="In the next 30 days" />
          <StatCard title="Total Savings" value={formatCurrency(savingsProgress.current, currency)} icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />} description={`${Math.round(savingsProgress.percent)}% of goals complete`} />
          <StatCard title="Daily Spending Pace" value={formatCurrency(spendingPace, currency)} icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} description="Average spend per day this month" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Expenses</CardTitle>
                        <CardDescription>This month's latest transactions.</CardDescription>
                    </div>
                    <Button onClick={() => setExpenseDialogOpen(true)}>
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Add Expense
                    </Button>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
                                <TableRow key={expense.id}>
                                    <TableCell className="font-medium">{expense.description}</TableCell>
                                    <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                                    <TableCell>{format(parseISO(expense.date), 'MMM d')}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(expense.amount, currency)}</TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No expenses logged this month.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center">
                    <div className="grid gap-2">
                        <CardTitle>Upcoming Bills</CardTitle>
                        <CardDescription>
                        Your next few bills that are due.
                        </CardDescription>
                    </div>
                    <Button asChild size="sm" className="ml-auto gap-1">
                        <Link href="/dashboard/bills">
                        All Bills
                        <ArrowUpRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Days Left</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                           {upcomingBills && upcomingBills.length > 0 ? upcomingBills.map((bill) => {
                                const daysUntilDue = differenceInDays(parseISO(bill.dueDate), new Date());
                                return (
                                    <TableRow key={bill.id}>
                                        <TableCell className="font-medium">{bill.name}</TableCell>
                                        <TableCell>{daysUntilDue} days</TableCell>
                                        <TableCell className="text-right">{formatCurrency(bill.amount, currency)}</TableCell>
                                    </TableRow>
                                );
                            }) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No upcoming bills.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

             <Card className="lg:col-span-2">
                <CardHeader>
                    <CardTitle>Savings Goals</CardTitle>
                    <CardDescription>Your progress towards your financial goals.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    {goals && goals.length > 0 ? goals.map((goal) => {
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        return (
                            <div key={goal.id} className="grid gap-2">
                                <div className="flex justify-between font-medium">
                                    <span>{goal.name}</span>
                                    <span>{formatCurrency(goal.currentAmount, currency)} / {formatCurrency(goal.targetAmount, currency)}</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        )
                    }) : (
                        <div className="text-center text-muted-foreground py-8">
                            No savings goals set up yet. <Link href="/dashboard/savings" className="underline text-primary">Add one now</Link>.
                        </div>
                     )}
                </CardContent>
                 <CardFooter>
                    <Button asChild variant="outline" className="w-full">
                        <Link href="/dashboard/savings">Manage All Goals</Link>
                    </Button>
                </CardFooter>
            </Card>

        </div>
      </div>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>
        <ExpenseForm onSubmit={handleAddExpense} isSubmitting={isSubmittingExpense} initialData={null} />
      </DialogContent>
    </Dialog>
  );
}
