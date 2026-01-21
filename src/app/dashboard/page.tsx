import { OverviewCards } from "@/components/dashboard/overview-cards";
import { AiInsights } from "@/components/dashboard/ai-insights";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold text-foreground">Confidence Dashboard</h1>
            <Suspense fallback={<Skeleton className="h-24 w-full" />}>
                <OverviewCards />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <AiInsights />
            </Suspense>
        </div>
    );
}
