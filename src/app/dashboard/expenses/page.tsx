'use client';

import { useMemo } from 'react';
import Link from 'next/link';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { parseISO, startOfMonth, endOfMonth, format } from 'date-fns';
import { PlusCircle, Trash2, Pencil, MoreHorizontal } from 'lucide-react';
import { useUser, useCollection, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Firestore, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import type { Expense } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CategoryIcon } from '@/components/dashboard/category-icon';

const MobileExpenseCardSkeleton = () => (
    <Card>
        <CardContent className="p-4">
            <div className="flex justify-between items-start gap-4">
                <div className="grid gap-1.5 flex-1">
                    <Skeleton className="h-5 w-32" />
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-20" />
                    </div>
                </div>
                <div className="grid gap-1.5 items-end text-right">
                    <Skeleton className="h-5 w-16 ml-auto" />
                     <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </CardContent>
    </Card>
);

export default function ExpensesPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;

  const expensesQuery = useMemo(() => {
    if (!firestore || !user) return null;
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    return query(
        collection(firestore, `users/${user.uid}/expenses`),
        where('date', '>=', monthStart.toISOString()),
        where('date', '<=', monthEnd.toISOString()),
        orderBy('date', 'desc')
    );
  }, [firestore, user]);

  const { data: expenses, isLoading: areExpensesLoading } = useCollection<Expense>(expensesQuery);

  function handleDeleteExpense(expenseId: string) {
    if (!user || !firestore) return;
    const expenseRef = doc(firestore, `users/${user.uid}/expenses/${expenseId}`);
    deleteDocumentNonBlocking(expenseRef);
  }

  const isLoading = isUserLoading || areExpensesLoading;
  const currency = userProfile?.currency;

  return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Manage your expenses for the current month.
            </CardDescription>
          </div>
           <Button asChild>
            <Link href="/dashboard/expenses/add">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
           {/* Mobile View */}
          <div className="space-y-4 md:hidden">
            {isLoading && Array.from({ length: 4 }).map((_, i) => <MobileExpenseCardSkeleton key={i} />)}
            {!isLoading && expenses?.map(expense => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="grid gap-1 flex-1">
                      <p className="font-semibold">{expense.description}</p>
                       <div className="flex items-center text-sm text-muted-foreground gap-4">
                          <Badge variant="outline" className="gap-1.5 font-normal">
                            <CategoryIcon category={expense.category} className="h-3.5 w-3.5" />
                            <span>{expense.category}</span>
                          </Badge>
                         <span>{format(parseISO(expense.date), 'MMM d')}</span>
                      </div>
                    </div>
                    <div className="grid gap-1 text-right">
                       <p className="font-semibold">{formatCurrency(expense.amount, currency)}</p>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0 ml-auto">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/expenses/edit/${expense.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
             {!isLoading && expenses?.length === 0 && (
                <div className="h-24 text-center flex items-center justify-center text-muted-foreground">
                    No expenses found. Add one to get started!
                </div>
            )}
          </div>
          {/* Desktop View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px] text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                  </TableRow>
                ))}
                {!isLoading && expenses && expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1.5 font-normal">
                        <CategoryIcon category={expense.category} className="h-3.5 w-3.5" />
                        <span>{expense.category}</span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(parseISO(expense.date), 'PPP')}
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(expense.amount, currency)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/expenses/edit/${expense.id}`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteExpense(expense.id)} className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && expenses?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No expenses found. Add one to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
  );
}
