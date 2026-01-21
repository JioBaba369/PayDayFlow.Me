'use client';

import { TrendingUp } from 'lucide-react';
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { formatCurrency } from '@/lib/utils';
import type { NetWorthHistoryPoint } from '@/lib/types';

type LineChartInteractiveProps = {
  data: NetWorthHistoryPoint[];
  currency?: string;
  title: string;
  description: string;
  footerText: string;
};

const CustomTooltip = ({ active, payload, label, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Date
            </span>
            <span className="font-bold text-muted-foreground">
              {label}
            </span>
          </div>
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Net Worth
            </span>
            <span className="font-bold">
              {formatCurrency(payload[0].value, currency)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};


export function LineChartInteractive({
  data,
  currency,
  title,
  description,
  footerText,
}: LineChartInteractiveProps) {
  const chartConfig = {
    netWorth: {
      label: 'Net Worth',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 10,
              left: 10,
              bottom: 0,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value, currency, {notation: 'compact'})}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<CustomTooltip currency={currency} />}
              wrapperStyle={{ outline: 'none' }}
            />
            <Line
              dataKey="netWorth"
              type="monotone"
              stroke="var(--color-netWorth)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
