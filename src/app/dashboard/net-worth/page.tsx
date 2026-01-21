import { NetWorthClient } from '@/components/dashboard/net-worth/net-worth-client';

export default function NetWorthPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-foreground">Net Worth Tracker</h1>
       <p className="text-muted-foreground">
        Monitor your assets and liabilities over time with historical snapshots and charts.
      </p>
      <NetWorthClient />
    </div>
  );
}
