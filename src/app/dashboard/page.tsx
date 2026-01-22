'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { formatCurrency, cn } from '@/lib/utils';
import { useUser, useCollection } from '@/firebase';
import { collection, query, where, limit, orderBy, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Bill, SavingsGoal, Expense, Asset, IncomeStream } from '@/lib/types';
import { differenceInDays, parseISO, startOfMonth, format } from 'date-fns';
import { DollarSign, Wallet, Calendar, TrendingUp, PlusCircle, ArrowUpRight, TrendingDown, CreditCard } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { CategoryIcon } from '@/components/dashboard/category-icon';
import { Separator } from '@/components/ui/separator';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h1 className="text-2xl font-bold font-headline tracking-tight">Confidence Dashboard</h1>
          <div className="flex items-center gap-4 text-sm">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-6 w-px bg-border" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
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

  const ready = !!user && !!firestore && !isUserLoading;
  const currency = userProfile?.currency;

  // --- SAFE QUERIES ---
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

  const incomeStreamsQuery = useMemo(() => {
    if (!ready) return undefined;
    return collection(firestore!, `users/${user!.uid}/incomeStreams`);
  }, [ready, firestore, user]);


  // --- DATA FETCHING (SAFE) ---
  const {data: allBills, isLoading: areBillsLoading} = useCollection<Bill>(billsQuery);
  const {data: goals, isLoading: areGoalsLoading} = useCollection<SavingsGoal>(savingsGoalsQuery);
  const {data: expenses, isLoading: areExpensesLoading} = useCollection<Expense>(expensesQuery);
  const {data: assets, isLoading: areAssetsLoading} = useCollection<Asset>(assetsQuery);
  const {data: incomeStreams, isLoading: areIncomeStreamsLoading} = useCollection<IncomeStream>(incomeStreamsQuery);

  const isLoading =
    isUserLoading ||
    areBillsLoading ||
    areGoalsLoading ||
    areExpensesLoading ||
    areAssetsLoading ||
    areIncomeStreamsLoading;

  // --- DERIVED DATA ---
  
  const {
    cashLeft,
    totalMonthlyIncome,
    totalMonthlyFixedExpenses,
    totalMonthlyVariableExpenses,
    savingsVelocity,
  } = useMemo(() => {
    const cash = assets?.reduce((s, a) => s + a.value, 0) ?? 0;
    
    const income = incomeStreams?.reduce((sum, stream) => {
        switch (stream.schedule) {
            case 'Weekly': return sum + (stream.amount * 52 / 12);
            case 'Bi-Weekly': return sum + (stream.amount * 26 / 12);
            case 'Semi-Monthly': return sum + stream.amount * 2;
            case 'Monthly': return sum + stream.amount;
            case 'Quarterly': return sum + stream.amount / 3;
            case 'Semi-Annually': return sum + stream.amount / 6;
            case 'Yearly': return sum + stream.amount / 12;
            case 'One-Time': return sum; // We can decide how to handle this, for now, we ignore for monthly velocity
            default: return sum;
        }
    }, 0) ?? 0;

    const fixed = allBills?.reduce((sum, bill) => sum + bill.amount, 0) ?? 0;
    
    const variable = expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;

    const velocity = income - (fixed + variable);

    return {
        cashLeft: cash,
        totalMonthlyIncome: income,
        totalMonthlyFixedExpenses: fixed,
        totalMonthlyVariableExpenses: variable,
        savingsVelocity: velocity,
    };
  }, [assets, incomeStreams, allBills, expenses]);
  
  const totalMonthlyExpenses = totalMonthlyFixedExpenses + totalMonthlyVariableExpenses;
  
  const unpaidBills = useMemo(() => {
    if (!allBills) return [];
    return allBills
      .filter(bill => !bill.paid)
      .sort((a, b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
  }, [allBills]);

  const recentExpenses = expenses?.slice(0, 5) ?? [];
  const upcomingBills = unpaidBills?.slice(0, 5) ?? [];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // --- RENDER ---
  return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <h1 className="text-2xl font-bold font-headline tracking-tight">Confidence Dashboard</h1>
            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Monthly Income:</span>
                    <span className="font-semibold">{formatCurrency(totalMonthlyIncome, currency)}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Cash on Hand:</span>
                    <span className="font-semibold">{formatCurrency(cashLeft, currency)}</span>
                </div>
            </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Savings Velocity" 
            value={
              <span className={cn(savingsVelocity >= 0 ? 'text-[hsl(var(--chart-2))]' : 'text-destructive')}>
                {formatCurrency(savingsVelocity, currency)}
              </span>
            } 
            icon={savingsVelocity >= 0 ? <TrendingUp className="h-4 w-4 text-muted-foreground" /> : <TrendingDown className="h-4 w-4 text-muted-foreground" />}
            description="Monthly income minus expenses" 
          />
          <StatCard 
            title="Monthly Income" 
            value={formatCurrency(totalMonthlyIncome, currency)} 
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />} 
            description="Total from all income streams" 
          />
           <StatCard 
            title="Monthly Expenses" 
            value={formatCurrency(totalMonthlyExpenses, currency)} 
            icon={<CreditCard className="h-4 w-4 text-muted-foreground" />} 
            description={`Fixed: ${formatCurrency(totalMonthlyFixedExpenses, currency)}`}
          />
          <StatCard 
            title="Cash on Hand" 
            value={formatCurrency(cashLeft, currency)} 
            icon={<Wallet className="h-4 w-4 text-muted-foreground" />} 
            description="Across all cash accounts" 
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Expenses</CardTitle>
                        <CardDescription>This month's latest transactions.</CardDescription>
                    </div>
                    <Button asChild>
                        <Link href="/dashboard/expenses/add">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Expense
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="hidden md:block">
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
                                        <TableCell>
                                        <Badge variant="outline" className="gap-1.5 font-normal">
                                            <CategoryIcon category={expense.category} className="h-3.5 w-3.5" />
                                            <span>{expense.category}</span>
                                        </Badge>
                                        </TableCell>
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
                    </div>
                    <div className="md:hidden space-y-4">
                        {recentExpenses.length > 0 ? recentExpenses.map(expense => (
                            <div key={expense.id} className="flex items-center justify-between">
                                <div className="grid gap-1">
                                    <p className="font-medium">{expense.description}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                       <Badge variant="outline" className="gap-1.5 font-normal">
                                            <CategoryIcon category={expense.category} className="h-3.5 w-3.5" />
                                            <span>{expense.category}</span>
                                        </Badge>
                                        <span>{format(parseISO(expense.date), 'MMM d')}</span>
                                    </div>
                                </div>
                                <p className="font-medium">{formatCurrency(expense.amount, currency)}</p>
                            </div>
                        )) : (
                            <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                                No expenses logged this month.
                            </div>
                        )}
                    </div>
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
                     <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {upcomingBills && upcomingBills.length > 0 ? upcomingBills.map((bill) => {
                                    const dueDate = parseISO(bill.dueDate);
                                    const daysUntilDue = differenceInDays(dueDate, new Date());
                                    const isOverdue = daysUntilDue < 0;

                                    let dueDateText;
                                    if (isOverdue) {
                                        dueDateText = <span className="text-destructive">{Math.abs(daysUntilDue)} days overdue</span>;
                                    } else if (daysUntilDue === 0) {
                                        dueDateText = <span>Due today</span>;
                                    } else if (daysUntilDue === 1) {
                                        dueDateText = <span>1 day left</span>;
                                    } else {
                                        dueDateText = <span>{daysUntilDue} days left</span>;
                                    }

                                    return (
                                        <TableRow key={bill.id}>
                                            <TableCell className="font-medium">{bill.name}</TableCell>
                                            <TableCell>{dueDateText}</TableCell>
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
                     </div>
                      <div className="md:hidden space-y-4">
                        {upcomingBills && upcomingBills.length > 0 ? upcomingBills.map((bill) => {
                            const dueDate = parseISO(bill.dueDate);
                            const daysUntilDue = differenceInDays(dueDate, new Date());
                            const isOverdue = daysUntilDue < 0;

                            let dueDateText;
                            if (isOverdue) {
                                dueDateText = <span className="text-sm text-destructive">{Math.abs(daysUntilDue)} days overdue</span>;
                            } else if (daysUntilDue === 0) {
                                dueDateText = <span className="text-sm text-muted-foreground">Due today</span>;
                            } else {
                                dueDateText = <span className="text-sm text-muted-foreground">{daysUntilDue} days left</span>;
                            }

                            return (
                                <div key={bill.id} className="flex items-center justify-between">
                                    <div className="grid gap-1">
                                        <p className="font-medium">{bill.name}</p>
                                        {dueDateText}
                                    </div>
                                    <p className="font-medium">{formatCurrency(bill.amount, currency)}</p>
                                </div>
                            );
                        }) : (
                             <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                                No upcoming bills.
                            </div>
                        )}
                    </div>
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
                            No savings goals set up yet. <Link href="/dashboard/savings/add" className="underline text-primary">Add one now</Link>.
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
  );
}
