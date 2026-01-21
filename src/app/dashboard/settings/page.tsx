'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitch } from '@/components/dashboard/settings/theme-switch';


export default function SettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your application settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ThemeSwitch />
         <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Receive email notifications for important events. (Functionality coming soon)
                </span>
            </Label>
            <Switch id="notifications" disabled />
        </div>
      </CardContent>
    </Card>
  );
}
