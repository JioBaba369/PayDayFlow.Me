import { SavingsClient } from '@/components/dashboard/savings/savings-client';

export default function SavingsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-foreground">Savings Goals</h1>
      <p className="text-muted-foreground">
        Define your financial goals and track your progress towards achieving them.
      </p>
      <SavingsClient />
    </div>
  );
}
