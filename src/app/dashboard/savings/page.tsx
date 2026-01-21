'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { PlusCircle, Target, MoreHorizontal, Coins, Trash2, Pencil } from 'lucide-react';
import { useUser, useCollection, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import type { SavingsGoal } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GoalForm, type GoalFormValues } from '@/components/dashboard/savings/goal-form';
import { AddFundsForm, type AddFundsFormValues } from '@/components/dashboard/savings/add-funds-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO } from 'date-fns';

export default function SavingsPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  
  const [dialogState, setDialogState] = useState<{ type: 'goal' | 'funds' | null; isOpen: boolean }>({ type: null, isOpen: false });
  const [isSubmitting, setSubmitting] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (searchParams.get('action') === 'add-goal') {
      handleOpenGoalDialog();
    }
  }, [searchParams]);

  const handleDialogChange = (open: boolean) => {
    setDialogState(prev => ({ ...prev, isOpen: open }));
    if (!open) {
      setSelectedGoal(null);
      setDialogState({ type: null, isOpen: false });
      router.replace(pathname, { scroll: false });
    }
  }

  const savingsGoalsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/savingsGoals`);
  }, [firestore, user]);

  const { data: savingsGoals, isLoading: areGoalsLoading } = useCollection<SavingsGoal>(savingsGoalsQuery);

  function handleOpenGoalDialog(goal: SavingsGoal | null = null) {
    setSelectedGoal(goal);
    setDialogState({ type: 'goal', isOpen: true });
  }
  
  function handleOpenFundsDialog(goal: SavingsGoal) {
    setSelectedGoal(goal);
    setDialogState({ type: 'funds', isOpen: true });
  }

  async function handleGoalFormSubmit(values: GoalFormValues) {
    if (!user || !firestore) return;
    setSubmitting(true);
    
    const goalData = {
      ...values,
      targetDate: values.targetDate ? values.targetDate.toISOString() : undefined,
    };

    try {
      if (selectedGoal && dialogState.type === 'goal') { // Editing existing goal
        const goalRef = doc(firestore, `users/${user.uid}/savingsGoals/${selectedGoal.id}`);
        await updateDocumentNonBlocking(goalRef, { ...goalData, currentAmount: selectedGoal.currentAmount });
      } else { // Adding new goal
        await addDocumentNonBlocking(collection(firestore, `users/${user.uid}/savingsGoals`), { ...goalData, currentAmount: 0 });
      }
      handleDialogChange(false);
    } catch (error) {
      console.error("Error submitting goal: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddFunds(values: AddFundsFormValues) {
    if (!user || !firestore || !selectedGoal) return;
    setSubmitting(true);
    const goalRef = doc(firestore, `users/${user.uid}/savingsGoals/${selectedGoal.id}`);
    const newCurrentAmount = selectedGoal.currentAmount + values.amount;

    try {
      await updateDocumentNonBlocking(goalRef, { currentAmount: newCurrentAmount });
      handleDialogChange(false);
    } catch (error) {
      console.error("Error updating document: ", error);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDeleteGoal(goalId: string) {
    if (!user || !firestore) return;
    deleteDocumentNonBlocking(doc(firestore, `users/${user.uid}/savingsGoals/${goalId}`));
  }

  const isLoading = isUserLoading || areGoalsLoading;
  const currency = userProfile?.currency;
  
  const currentDialog = dialogState.type === 'goal' ? (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedGoal ? 'Edit Savings Goal' : 'Add a New Savings Goal'}</DialogTitle>
            <DialogDescription>
              {selectedGoal ? 'Update the details of your savings goal.' : 'What are you saving for? Set a name, a target amount, and an optional date.'}
            </DialogDescription>
          </DialogHeader>
          <GoalForm onSubmit={handleGoalFormSubmit} isSubmitting={isSubmitting} initialData={selectedGoal} />
        </DialogContent>
  ) : dialogState.type === 'funds' ? (
       <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Funds to "{selectedGoal?.name}"</DialogTitle>
            <DialogDescription>
              How much would you like to add to this goal?
            </DialogDescription>
          </DialogHeader>
          <AddFundsForm onSubmit={handleAddFunds} isSubmitting={isSubmitting} />
        </DialogContent>
  ) : null;

  return (
      <Dialog open={dialogState.isOpen} onOpenChange={handleDialogChange}>
        <div className="grid gap-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold tracking-tight font-headline">Savings Goals</h1>
              <p className="text-muted-foreground">
                Track and manage your financial goals.
              </p>
            </div>
             <Button onClick={() => handleOpenGoalDialog()}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
          </div>

          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex justify-between mt-1">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-3 w-1/4" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && savingsGoals && savingsGoals.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {savingsGoals.map((goal) => {
                const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                const isComplete = progress >= 100;

                return (
                  <Card key={goal.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div className="grid gap-1">
                        <CardTitle>{goal.name}</CardTitle>
                        <CardDescription>
                          {isComplete ? "Goal achieved! 🎉" : `${formatCurrency(goal.targetAmount - goal.currentAmount, currency)} to go`}
                        </CardDescription>
                      </div>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                             <DropdownMenuItem onClick={() => handleOpenFundsDialog(goal)}>
                              <Coins className="h-4 w-4" />
                              Add Funds
                            </DropdownMenuItem>
                             <DropdownMenuItem onClick={() => handleOpenGoalDialog(goal)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteGoal(goal.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Progress value={progress} aria-label={`${goal.name} progress`} />
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-primary">
                            {formatCurrency(goal.currentAmount, currency)}
                          </span>
                          <span className="text-muted-foreground">
                            {formatCurrency(goal.targetAmount, currency)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                     <CardFooter className="flex-col items-start gap-1 pt-4">
                       <span className="text-xs text-muted-foreground">
                        {Math.round(progress)}% complete
                      </span>
                      {goal.targetDate && (
                         <span className="text-xs text-muted-foreground">
                            Target: {format(parseISO(goal.targetDate), "PPP")}
                         </span>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}

          {!isLoading && (!savingsGoals || savingsGoals.length === 0) && (
            <Card className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
              <CardHeader>
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>No Savings Goals Yet</CardTitle>
                <CardDescription>Get started by adding your first savings goal.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Button onClick={() => handleOpenGoalDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Goal
                  </Button>
              </CardContent>
            </Card>
          )}
        </div>
        {currentDialog}
      </Dialog>
  );
}
