'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plane, TrendingUp, PiggyBank, Sparkles } from 'lucide-react';
import { UnauthenticatedAuthGuard } from '@/components/layout/auth-guard';

function LandingHeader() {
  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/95 backdrop-blur-sm fixed top-0 w-full z-50 border-b">
      <Link href="/" className="flex items-center justify-center font-headline font-semibold text-lg">
        <Plane className="h-6 w-6 mr-2" />
        <span>PayDayFlow.me</span>
      </Link>
      <nav className="ml-auto flex gap-2 sm:gap-4">
        <Button variant="ghost" asChild>
          <Link href="/login">
            Login
          </Link>
        </Button>
        <Button asChild>
          <Link href="/signup">
            Get Started
          </Link>
        </Button>
      </nav>
    </header>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4">
      <div className="mb-4 bg-primary/10 p-3 rounded-full">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-headline">{title}</h3>
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </div>
  );
}

function LandingPage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-background">
      <LandingHeader />
      <main className="flex-1">
        <section className="w-full pt-24 md:pt-32 lg:pt-40">
          <div className="px-4 md:px-6 space-y-10 xl:space-y-16">
            <div className="grid max-w-screen-xl mx-auto gap-8 px-4 sm:px-6 md:px-10 md:grid-cols-2 md:gap-16 items-center">
              <div>
                <h1 className="lg:leading-tighter text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl xl:text-[3.4rem] 2xl:text-[3.75rem] font-headline">
                  Gain Financial Clarity and Confidence
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-4">
                  PayDayFlow.me provides the tools you need to track spending, manage bills, and grow your net worth. All in one place.
                </p>
                <div className="space-x-4 mt-6">
                  <Button size="lg" asChild>
                    <Link href="/signup">
                      Get Started for Free
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="hidden md:flex justify-center">
                  <div className="w-96 h-96 bg-gradient-to-tr from-primary/20 to-accent/10 rounded-full flex items-center justify-center animate-pulse">
                     <Plane className="h-48 w-48 text-primary/80" />
                  </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40 mt-12 md:mt-24">
          <div className="container space-y-12 px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-card border px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Everything You Need to Succeed</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From budgeting to AI-powered insights, we've got you covered.
                </p>
              </div>
            </div>
            <div className="mx-auto grid items-start gap-8 sm:max-w-4xl sm:grid-cols-2 md:gap-12 lg:max-w-5xl lg:grid-cols-3">
              <FeatureCard 
                icon={<PiggyBank className="h-8 w-8 text-primary" />}
                title="Unified Dashboard"
                description="See your complete financial picture at a glance. Track cash flow, expenses, and savings goals in one place."
              />
              <FeatureCard 
                icon={<TrendingUp className="h-8 w-8 text-primary" />}
                title="Track Net Worth"
                description="Monitor your assets and liabilities over time to see your financial growth and make informed decisions."
              />
              <FeatureCard 
                icon={<Sparkles className="h-8 w-8 text-primary" />}
                title="AI-Powered Insights"
                description="Get personalized, actionable financial advice based on your live data to improve your financial health."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; 2024 PayDayFlow.me. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}


export default function RootPage() {
    return (
        <UnauthenticatedAuthGuard>
            <LandingPage />
        </UnauthenticatedAuthGuard>
    )
}
