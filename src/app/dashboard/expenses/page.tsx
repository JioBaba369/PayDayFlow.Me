'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
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
import { useUser, useCollection, updateDocumentNonBlocking, deleteDocumentNonBlocking, addDocumentNonBlocking } from '@/firebase';
import { collection, doc, Firestore, query, where, orderBy } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import type { Expense } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ExpenseForm, type ExpenseFormValues } from '@/components/dashboard/expenses/expense-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';


export default function ExpensesPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('action') === 'add-expense') {
      handleOpenDialog();
    }
  }, [searchParams]);

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setEditingExpense(null);
      router.replace(pathname, { scroll: false });
    }
    setDialogOpen(open);
  }

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

  function handleOpenDialog(expense: Expense | null = null) {
    setEditingExpense(expense);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: ExpenseFormValues) {
    if (!user || !firestore) return;
    setSubmitting(true);
    
    const expenseData = {
      ...values,
      date: values.date.toISOString(),
    };

    try {
      if (editingExpense) {
        const expenseRef = doc(firestore, `users/${user.uid}/expenses/${editingExpense.id}`);
        await updateDocumentNonBlocking(expenseRef, expenseData);
      } else {
        await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/expenses`), expenseData);
      }
      handleDialogChange(false);
    } catch (error) {
      console.error("Error submitting expense: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteExpense(expenseId: string) {
    if (!user || !firestore) return;
    const expenseRef = doc(firestore, `users/${user.uid}/expenses/${expenseId}`);
    deleteDocumentNonBlocking(expenseRef);
  }

  const isLoading = isUserLoading || areExpensesLoading;
  const currency = userProfile?.currency;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>
              Manage your expenses for the current month.
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <PlusCircle className="mr-2 h-4 w-4" />
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
                         <DropdownMenuItem onClick={() => handleOpenDialog(expense)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add a New Expense'}</DialogTitle>
          <DialogDescription>
           {editingExpense ? 'Update the details for this expense.' : 'Enter the details for a new expense.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingExpense} />
      </DialogContent>
    </Dialog>
  );
}
