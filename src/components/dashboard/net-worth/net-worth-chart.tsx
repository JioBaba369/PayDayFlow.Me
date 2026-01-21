
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

interface NetWorthChartProps {
  data: {
    date: string;
    assets: number;
    liabilities: number;
    netWorth: number;
  }[];
}

const chartConfig = {
  assets: {
    label: 'Assets',
    color: 'hsl(var(--chart-1))',
  },
  liabilities: {
    label: 'Liabilities',
    color: 'hsl(var(--destructive))',
  },
  netWorth: {
    label: 'Net Worth',
    color: 'hsl(var(--chart-2))',
  },
};

export function NetWorthChart({ data }: NetWorthChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historical Net Worth</CardTitle>
        <CardDescription>Your net worth trend over the past months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer>
            <LineChart data={data}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
              />
              <YAxis
                tickFormatter={(value) => `$${(value / 1000)}k`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Line
                dataKey="assets"
                type="monotone"
                stroke="var(--color-assets)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="liabilities"
                type="monotone"
                stroke="var(--color-liabilities)"
                strokeWidth={2}
                dot={false}
              />
              <Line
                dataKey="netWorth"
                type="monotone"
                stroke="var(--color-netWorth)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
