'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useUser, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, Firestore, query, where, orderBy, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import type { Budget, BudgetDoc, Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BudgetForm, type BudgetFormValues } from '@/components/dashboard/budget/budget-form';
import { startOfMonth, endOfMonth } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function BudgetPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const budgetsQuery = useMemo(() => {
    if (!user || !firestore) return null;
    return collection(firestore, `users/${user.uid}/budgets`);
  }, [firestore, user]);

  const expensesQuery = useMemo(() => {
    if (!user || !firestore) return null;
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

  const { data: budgetDocs, isLoading: areBudgetsLoading } = useCollection<BudgetDoc>(budgetsQuery);
  const { data: expenses, isLoading: areExpensesLoading } = useCollection<Expense>(expensesQuery);

  const budgets: Budget[] = useMemo(() => {
    if (!budgetDocs) return [];
    return budgetDocs.map(doc => {
      const spent = expenses
        ?.filter(exp => exp.category === doc.category)
        .reduce((sum, exp) => sum + exp.amount, 0) || 0;
      return { ...doc, spent };
    });
  }, [budgetDocs, expenses]);

  function handleOpenDialog(budget: Budget | null = null) {
    setEditingBudget(budget);
    setDialogOpen(true);
  }

  async function handleFormSubmit(values: BudgetFormValues) {
    if (!user || !firestore) return;
    setSubmitting(true);
    
    const budgetData = {
      ...values,
      userProfileId: user.uid,
    };

    try {
      if (editingBudget) {
        const budgetRef = doc(firestore, `users/${user.uid}/budgets/${editingBudget.id}`);
        await updateDocumentNonBlocking(budgetRef, budgetData);
      } else {
        await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/budgets`), budgetData);
      }
      setDialogOpen(false);
      setEditingBudget(null);
    } catch (error) {
      console.error("Error submitting budget: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBudget(budgetId: string) {
    if (!user || !firestore) return;
    await deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/budgets/${budgetId}`));
  }

  const isLoading = isUserLoading || areBudgetsLoading || areExpensesLoading;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <div>
              <CardTitle>Budgeting</CardTitle>
              <CardDescription>Track your monthly spending against your budget.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog()}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Budget
            </Button>
          </CardHeader>
          <CardContent className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading && Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-24" />
                   <Skeleton className="h-5 w-5" />
                </div>
                 <Skeleton className="h-4 w-full" />
                 <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                 </div>
              </div>
            ))}
            {!isLoading && budgets.map((budget) => {
              const progress = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
              const isOverspent = progress > 100;
              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{budget.category}</span>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={() => handleOpenDialog(budget)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteBudget(budget.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <Progress
                    value={Math.min(progress, 100)}
                    className={cn(isOverspent && '[&>div]:bg-destructive', 'h-2')}
                    aria-label={`${budget.category} budget progress`}
                  />
                   <div className="flex justify-between">
                    <span className={cn('text-sm', isOverspent ? 'text-destructive font-medium' : 'text-muted-foreground')}>
                      {formatCurrency(budget.spent)} spent
                    </span>
                     <span className="text-sm text-muted-foreground">
                      {formatCurrency(budget.allocated)} budgeted
                    </span>
                  </div>
                </div>
              );
            })}
             {!isLoading && budgets.length === 0 && (
                <p className="text-muted-foreground col-span-full text-center py-10">No budgets set up yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingBudget ? 'Edit Budget' : 'Add a New Budget'}</DialogTitle>
          <DialogDescription>
            {editingBudget ? 'Update the details for this budget category.' : 'Create a spending limit for a new category.'}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm onSubmit={handleFormSubmit} isSubmitting={isSubmitting} initialData={editingBudget} />
      </DialogContent>
    </Dialog>
  );
}
