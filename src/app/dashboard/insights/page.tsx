'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getFinancialInsights, type FinancialInsightsInput } from '@/ai/flows/ai-powered-insights';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useUser, useFirestore } from '@/firebase';
import type { Bill, SavingsGoal, Expense, Asset, BudgetDoc } from '@/lib/types';
import { collection, Firestore, query, where } from 'firebase/firestore';
import { startOfMonth } from 'date-fns';

export default function InsightsPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;
  const [insights, setInsights] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  // --- DATA QUERIES ---
  const billsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/bills`), [firestore, user]);
  const savingsGoalsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/savingsGoals`), [firestore, user]);
  const budgetsQuery = useMemo(() => !user ? null : collection(firestore, `users/${user.uid}/budgets`), [firestore, user]);
  const assetsQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/assets`), where('type', '==', 'Cash')), [firestore, user]);
  
  const monthStart = startOfMonth(new Date());
  const expensesQuery = useMemo(() => !user ? null : query(collection(firestore, `users/${user.uid}/expenses`), where('date', '>=', monthStart.toISOString())), [firestore, user]);

  // --- DATA FETCHING ---
  const { data: upcomingBills, isLoading: areBillsLoading } = useCollection<Bill>(billsQuery);
  const { data: savingsGoals, isLoading: areGoalsLoading } = useCollection<SavingsGoal>(savingsGoalsQuery);
  const { data: budgets, isLoading: areBudgetsLoading } = useCollection<BudgetDoc>(budgetsQuery);
  const { data: cashAssets, isLoading: areAssetsLoading } = useCollection<Asset>(assetsQuery);
  const { data: monthlyExpenses, isLoading: areExpensesLoading } = useCollection<Expense>(expensesQuery);

  const isDataLoading = isUserLoading || areBillsLoading || areGoalsLoading || areBudgetsLoading || areAssetsLoading || areExpensesLoading;

  const canGenerate = !isDataLoading && !!upcomingBills && !!savingsGoals && !!budgets && !!cashAssets && !!monthlyExpenses;

  const handleGetInsights = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setInsights(null);

    const cashLeft = cashAssets.reduce((sum, asset) => sum + asset.value, 0);
    const totalSpentThisMonth = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const spendingPace = totalSpentThisMonth / (new Date().getDate());
    const savingsProgress = savingsGoals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const monthlyBudget = budgets.reduce((sum, budget) => sum + budget.allocated, 0);

    const input: FinancialInsightsInput = {
      cashLeft: cashLeft,
      spendingPace: spendingPace,
      upcomingBills: upcomingBills.filter(b => !b.paid).map(bill => ({
        name: bill.name,
        amount: bill.amount,
        dueDate: bill.dueDate,
      })),
      savingsProgress: savingsProgress,
      monthlyBudget: monthlyBudget,
      expenses: monthlyExpenses.map(exp => ({
        category: exp.category,
        amount: exp.amount,
      })),
    };

    try {
      const result = await getFinancialInsights(input);
      setInsights(result.insights);
    } catch (error) {
      console.error("Failed to get financial insights:", error);
      setInsights(["Sorry, I couldn't generate insights at this time. Please try again later."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-4 text-center">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4">
             <Wand2 className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">AI-Powered Insights</CardTitle>
          <CardDescription>
            Get personalized, actionable financial advice based on your live data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!insights && !loading && (
             <div className="text-center p-8 space-y-4">
               <p className="text-muted-foreground">Click the button below to generate your financial insights.</p>
                <Button onClick={handleGetInsights} disabled={loading || isDataLoading} size="lg">
                  {loading || isDataLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate Insights
                </Button>
            </div>
          )}

          {loading && (
            <div className="space-y-4 p-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          )}

          {insights && (
            <div className="text-left space-y-4 p-4 bg-muted/50 rounded-lg">
                <ul className="space-y-3 list-disc pl-5">
                    {insights.map((insight, index) => (
                    <li key={index} className="text-sm">
                        {insight}
                    </li>
                    ))}
                </ul>
                <div className="text-center pt-4">
                   <Button onClick={handleGetInsights} disabled={loading || isDataLoading} variant="outline">
                    {loading || isDataLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Regenerate
                </Button>
                </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
