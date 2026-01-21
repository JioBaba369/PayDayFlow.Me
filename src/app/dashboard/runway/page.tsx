import { RunwayClient } from '@/components/dashboard/runway/runway-client';

export default function RunwayPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold text-foreground">Personal Runway</h1>
       <p className="text-muted-foreground">
        A founder-style dashboard to calculate your financial runway, burn rate, and savings velocity.
      </p>
      <RunwayClient />
    </div>
  );
}
