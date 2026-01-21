
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockData } from '@/lib/data';
import type { Asset, Liability } from '@/lib/types';
import { NetWorthChart } from './net-worth-chart';
import { NetWorthSummary } from './net-worth-summary';

export function NetWorthClient() {
  const [assets, setAssets] = useState<Asset[]>(mockData.assets);
  const [liabilities, setLiabilities] = useState<Liability[]>(mockData.liabilities);
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
  const netWorth = totalAssets - totalLiabilities;
  
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <NetWorthChart data={mockData.netWorthHistory} />
        <NetWorthSummary assets={assets} liabilities={liabilities} />
      </div>
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Assets</CardTitle>
              <CardDescription>${totalAssets.toLocaleString()}</CardDescription>
            </div>
            <Button size="icon" variant="ghost"><PlusCircle className="h-5 w-5"/></Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {assets.map(asset => (
                  <TableRow key={asset.name}>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell className="text-right">${asset.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Liabilities</CardTitle>
              <CardDescription>${totalLiabilities.toLocaleString()}</CardDescription>
            </div>
             <Button size="icon" variant="ghost"><PlusCircle className="h-5 w-5"/></Button>
          </CardHeader>
          <CardContent>
             <Table>
              <TableBody>
                {liabilities.map(liability => (
                  <TableRow key={liability.name}>
                    <TableCell>{liability.name}</TableCell>
                    <TableCell className="text-right">${liability.value.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card className="bg-primary text-primary-foreground">
            <CardHeader>
                <CardTitle>Total Net Worth</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-3xl font-bold">${netWorth.toLocaleString()}</p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
