import { Workflow } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 text-foreground transition-colors hover:text-primary">
      <Workflow className="h-6 w-6 text-primary" />
      <span className="font-headline text-lg font-bold">PayDayFlow.me</span>
    </Link>
  );
}
