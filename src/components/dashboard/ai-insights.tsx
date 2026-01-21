
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getFinancialAdviceAction } from '@/app/actions';
import { mockData } from '@/lib/data';

export function AiInsights() {
  const [advice, setAdvice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAdvice = async () => {
    setIsLoading(true);
    try {
      const netWorth = mockData.assets.reduce((acc, asset) => acc + asset.value, 0) - mockData.liabilities.reduce((acc, li) => acc + li.value, 0);
      const spendingCategories = mockData.transactions.reduce((acc, t) => {
        if (t.amount < 0) {
          acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        }
        return acc;
      }, {} as Record<string, number>);

      const input = {
        cashLeft: 5000,
        upcomingBills: 1200,
        savingsProgress: 75,
        monthlyBudget: 4000,
        netWorth: netWorth,
        runway: 12,
        burnRate: 3500,
        savingsVelocity: 500,
        spendingCategories,
      };

      const result = await getFinancialAdviceAction(input);
      if (result.success && result.data) {
        setAdvice(result.data.advice);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not fetch AI-powered insights. Please try again later.',
      });
      setAdvice('We encountered an issue generating your insights. Our team has been notified.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <Card className="bg-accent/30 border-accent/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium text-foreground/80 font-headline">AI-Powered Insights</CardTitle>
        <Lightbulb className="h-5 w-5 text-accent" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-foreground/80">{advice}</p>
        )}
      </CardContent>
    </Card>
  );
}
