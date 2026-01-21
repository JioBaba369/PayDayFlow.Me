import { BillsClient } from '@/components/dashboard/bills/bills-client';

export default function BillsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-foreground">Bills &amp; Subscriptions</h1>
      <p className="text-muted-foreground">
        Manage all your recurring payments and never miss a due date.
      </p>
      <BillsClient />
    </div>
  );
}
