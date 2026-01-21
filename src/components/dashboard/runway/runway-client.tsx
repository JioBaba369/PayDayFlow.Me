
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Rocket, Flame, ArrowUpCircle } from 'lucide-react';
import { mockData } from '@/lib/data';

export function RunwayClient() {
    const [runwayData, setRunwayData] = useState(mockData.runway);

    return (
        <div className="grid gap-8">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Personal Runway</CardTitle>
                        <Rocket className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{runwayData.runway} months</div>
                        <p className="text-xs text-muted-foreground">
                            Time until your savings run out
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Monthly Burn Rate</CardTitle>
                        <Flame className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${runwayData.burnRate.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">
                            Average monthly expenses
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Savings Velocity</CardTitle>
                        <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${runwayData.savingsVelocity.toLocaleString()} / mo</div>
                        <p className="text-xs text-muted-foreground">
                            How fast you're saving
                        </p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Runway Details</CardTitle>
                    <CardDescription>
                        Based on your average income and expenses over the last 6 months.
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    <p>Your personal runway is a crucial metric for financial independence. It tells you how long you could maintain your current lifestyle without any income. Increasing your runway can be achieved by either reducing your burn rate (monthly expenses) or increasing your savings velocity (how much you save each month). Tracking this gives you a clear indicator of your financial resilience.</p>
                </CardContent>
            </Card>
        </div>
    );
}
