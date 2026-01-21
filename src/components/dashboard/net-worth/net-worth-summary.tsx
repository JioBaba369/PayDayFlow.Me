
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { getNetWorthSummaryAction } from '@/app/actions';
import type { Asset, Liability } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

interface NetWorthSummaryProps {
    assets: Asset[];
    liabilities: Liability[];
}

export function NetWorthSummary({ assets, liabilities }: NetWorthSummaryProps) {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const result = await getNetWorthSummaryAction({ assets, liabilities });
        if (result.success && result.data) {
          setSummary(result.data.summary);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch AI-powered net worth summary.',
        });
        setSummary('We encountered an issue generating your summary.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [assets, liabilities, toast]);

  return (
    <Card className="bg-secondary/50">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>AI Net Worth Analysis</CardTitle>
          <CardDescription>A summary of your financial standing.</CardDescription>
        </div>
        <TrendingUp className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-foreground/80">{summary}</p>
        )}
      </CardContent>
    </Card>
  );
}
