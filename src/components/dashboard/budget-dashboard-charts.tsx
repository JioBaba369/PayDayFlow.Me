'use client';

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Pie,
  PieChart,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';
import type { CashFlowChartItem, AllocationItem } from '@/lib/types';
import { ChartTooltipContent, ChartContainer } from '@/components/ui/chart';

export function CashFlowBarChart({ data }: { data: CashFlowChartItem[] }) {
  const chartConfig = {
    budget: {
      label: 'Budget',
      color: 'hsl(var(--chart-4))',
    },
    actual: {
      label: 'Actual',
      color: 'hsl(var(--chart-1))',
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-[200px] w-full">
      <BarChart accessibilityLayer data={data} layout="vertical" margin={{ left: 10, right: 10 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12 }}
          tickMargin={5}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--muted))' }}
          content={
             <ChartTooltipContent
                formatter={(value) => formatCurrency(value as number)}
                indicator='dot'
             />
          }
        />
        <Legend
          iconSize={10}
          wrapperStyle={{ fontSize: '12px', padding: '0 10px' }}
        />
        <Bar dataKey="budget" fill="var(--color-budget)" radius={[4, 4, 4, 4]} />
        <Bar dataKey="actual" fill="var(--color-actual)" radius={[4, 4, 4, 4]} />
      </BarChart>
    </ChartContainer>
  );
}

export function AllocationPieChart({ data }: { data: AllocationItem[] }) {
  const chartConfig = {
    value: { label: 'Value' },
    ...data.reduce((acc, item) => {
        acc[item.name] = { label: item.name, color: item.fill };
        return acc;
    }, {})
  };

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
        <PieChart accessibilityLayer>
          <Tooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel indicator='dot' formatter={(value, name) => `${name}: ${formatCurrency(value as number)}`} />}
          />
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={60}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={`cell-${entry.name}`} fill={entry.fill} />
            ))}
          </Pie>
           <Legend
                iconSize={10}
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{ fontSize: '12px', paddingLeft: '20px' }}
                formatter={(value) => <span className="capitalize">{value}</span>}
            />
        </PieChart>
    </ChartContainer>
  );
}
