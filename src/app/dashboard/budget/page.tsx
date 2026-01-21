import { BudgetClient } from '@/components/dashboard/budget/budget-client';

export default function BudgetPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-foreground">Budgeting</h1>
      <p className="text-muted-foreground">
        Set and track monthly budgets for different spending categories.
      </p>
      <BudgetClient />
    </div>
  );
}
