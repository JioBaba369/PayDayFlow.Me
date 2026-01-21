import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wallet, Banknote, Target, TrendingUp } from "lucide-react";

export function OverviewCards() {
    const cashLeft = 4892.30;
    const upcomingBills = 1250.75;
    const savingsGoal = 10000;
    const savingsProgress = 7500;
    const savingsPercentage = (savingsProgress / savingsGoal) * 100;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Cash Left</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${cashLeft.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Available until next payday</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Bills</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${upcomingBills.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Due in the next 30 days</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Savings Progress</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">${savingsProgress.toLocaleString()} / ${savingsGoal.toLocaleString()}</div>
                    <Progress value={savingsPercentage} className="mt-2 h-2" />
                </CardContent>
            </Card>
        </div>
    );
}
