import Link from 'next/link';
import { Plane } from 'lucide-react';

type AuthLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden bg-muted lg:flex lg:flex-col lg:justify-between p-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg font-headline">
          <Plane className="h-6 w-6" />
          <span>PayDayFlow.me</span>
        </Link>
        <div className="mb-48">
          <h1 className="text-4xl font-bold font-headline">{title}</h1>
          <p className="text-muted-foreground mt-4 text-lg">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4">
        {children}
      </div>
    </div>
  );
}
