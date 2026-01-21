import Link from 'next/link';
import Image from 'next/image';
import { Plane } from 'lucide-react';

type AuthLayoutProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="hidden bg-sidebar lg:flex lg:flex-col justify-between p-8 relative overflow-hidden">
         <div className="absolute inset-0 z-0">
             <Image
                alt="Financial planning"
                src="https://picsum.photos/seed/authpage/1200/1800"
                fill
                style={{ objectFit: 'cover' }}
                className="opacity-10"
                data-ai-hint="finance planning"
            />
        </div>
        <Link href="/" className="relative z-10 flex items-center gap-2 font-semibold text-lg font-headline text-sidebar-foreground">
          <Plane className="h-6 w-6" />
          <span>PayDayFlow.me</span>
        </Link>
        <div className="relative z-10 mb-48">
          <h1 className="text-4xl font-bold font-headline text-sidebar-foreground">{title}</h1>
          <p className="text-sidebar-foreground/80 mt-4 text-lg">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 bg-background">
        {children}
      </div>
    </div>
  );
}
