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
                    <Badge variant="outline">{expense.category}</Badge>
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
        </CardContent>
      </Card>
  );
}
