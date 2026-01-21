import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  description?: React.ReactNode;
  icon: React.ReactNode;
  children?: React.ReactNode;
};

export function StatCard({ title, value, description, icon, children }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {children && <div className="h-[80px] pt-4">{children}</div>}
      </CardContent>
    </Card>
  );
}
