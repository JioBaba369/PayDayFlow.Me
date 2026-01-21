
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle } from 'lucide-react';
import { mockData } from '@/lib/data';
import type { SavingsGoal } from '@/lib/types';
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

export function SavingsClient() {
  const [goals, setGoals] = useState<SavingsGoal[]>(mockData.savingsGoals);

  return (
    <div>
        <div className="flex justify-end mb-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Goal
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create a New Savings Goal</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="goal-name" className="text-right">Goal Name</Label>
                        <Input id="goal-name" placeholder="e.g. Vacation to Japan" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="target-amount" className="text-right">Target Amount</Label>
                        <Input id="target-amount" type="number" placeholder="5000" className="col-span-3" />
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="current-amount" className="text-right">Current Amount</Label>
                        <Input id="current-amount" type="number" placeholder="500" className="col-span-3" />
                    </div>
                    </div>
                    <DialogFooter>
                    <DialogClose asChild>
                        <Button type="submit">Save Goal</Button>
                    </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
            <Card key={goal.id}>
                <CardHeader>
                <CardTitle>{goal.name}</CardTitle>
                <CardDescription>Target: ${goal.targetAmount.toLocaleString()}</CardDescription>
                </CardHeader>
                <CardContent>
                <div className="space-y-2">
                    <Progress value={progress} />
                    <p className="text-sm text-muted-foreground">
                    ${goal.currentAmount.toLocaleString()} saved ({Math.round(progress)}%)
                    </p>
                </div>
                </CardContent>
                <CardFooter>
                    <Button variant="secondary" className="w-full">Contribute</Button>
                </CardFooter>
            </Card>
            );
        })}
        </div>
    </div>
  );
}
