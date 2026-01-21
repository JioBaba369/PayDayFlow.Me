
'use client';

import { useState } from 'react';
import { mockData } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BudgetClient() {
  const [budgets, setBudgets] = useState(mockData.budgets);

  const getSpendingForCategory = (category: string) => {
    return mockData.transactions
      .filter(t => t.category === category && t.amount < 0)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  };
  
  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + getSpendingForCategory(b.category), 0);

  return (
    <div className="grid gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            You've spent ${totalSpent.toFixed(2)} of your ${totalBudgeted.toFixed(2)} budget.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(totalSpent / totalBudgeted) * 100} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Category Budgets</CardTitle>
            <CardDescription>Your spending breakdown for this month.</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Budget Category</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">Category</Label>
                  <Input id="category" placeholder="e.g. Groceries" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Amount</Label>
                  <Input id="amount" type="number" placeholder="400" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="submit">Save Category</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-6">
          {budgets.map(budget => {
            const spent = getSpendingForCategory(budget.category);
            const progress = (spent / budget.amount) * 100;
            return (
              <div key={budget.category}>
                <div className="flex justify-between mb-1 text-sm font-medium">
                  <span>{budget.category}</span>
                  <span>${spent.toFixed(2)} / ${budget.amount.toFixed(2)}</span>
                </div>
                <Progress value={progress} />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
