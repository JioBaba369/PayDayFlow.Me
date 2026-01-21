'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, cn } from '@/lib/utils';
import { differenceInDays, parseISO } from 'date-fns';
import { PlusCircle, Trash2, Pencil, MoreHorizontal, RotateCw } from 'lucide-react';
import { useUser, useCollection, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, Firestore } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { Skeleton } from '@/components/ui/skeleton';
import type { Bill } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';


export default function BillsPage() {
  const { user, userProfile, isUserLoading } = useUser();
  const firestore = useFirestore() as Firestore;

  const billsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `users/${user.uid}/bills`);
  }, [firestore, user]);

  const { data: bills, isLoading: areBillsLoading } = useCollection<Bill>(billsQuery);

  function handlePaidChange(bill: Bill) {
    if (!user || !firestore) return;
    const billRef = doc(firestore, `users/${user.uid}/bills/${bill.id}`);
    updateDocumentNonBlocking(billRef, { paid: !bill.paid });
  }

  function handleDeleteBill(billId: string) {
    if (!user || !firestore) return;
    const billRef = doc(firestore, `users/${user.uid}/bills/${billId}`);
    deleteDocumentNonBlocking(billRef);
  }

  function handleResetBills() {
    if (!user || !firestore || !bills) return;
    bills.forEach(bill => {
      if (bill.paid) {
        const billRef = doc(firestore, `users/${user.uid}/bills/${bill.id}`);
        updateDocumentNonBlocking(billRef, { paid: false });
      }
    });
  }

  const isLoading = isUserLoading || areBillsLoading;
  const currency = userProfile?.currency;

  const sortedBills = useMemo(() => {
    if (!bills) return [];
    return [...bills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [bills]);

  return (
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Bills & Subscriptions</CardTitle>
            <CardDescription>
              Manage all your recurring and upcoming payments.
            </CardDescription>
          </div>
           <div className="flex items-center gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <RotateCw className="mr-2 h-4 w-4" />
                  Reset Bills
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset All Bills?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will mark all your bills as unpaid. This is usually done at the start of a new month or billing cycle.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetBills}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button asChild>
              <Link href="/dashboard/bills/add">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Bill
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] text-center">Paid</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[50px] text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell className="text-center"><Skeleton className="h-4 w-4 mx-auto" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
                </TableRow>
              ))}
              {!isLoading && sortedBills && sortedBills.map((bill) => {
                const dueDate = parseISO(bill.dueDate);
                const daysUntilDue = differenceInDays(dueDate, new Date());
                const isOverdue = !bill.paid && daysUntilDue < 0;

                return (
                <TableRow key={bill.id} className={cn(bill.paid && 'text-muted-foreground bg-muted/50')}>
                  <TableCell className="text-center">
                    <Checkbox checked={bill.paid} onCheckedChange={() => handlePaidChange(bill)} aria-label={`Mark ${bill.name} as paid`} />
                  </TableCell>
                  <TableCell className="font-medium">{bill.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bill.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      {isOverdue ? (
                         <span className="text-xs text-destructive">{Math.abs(daysUntilDue)} days overdue</span>
                      ) : !bill.paid ? (
                         <span className="text-xs text-muted-foreground">{daysUntilDue} days left</span>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(bill.amount, currency)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                         <DropdownMenuItem asChild>
                           <Link href={`/dashboard/bills/edit/${bill.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                           </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteBill(bill.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )})}
              {!isLoading && sortedBills?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No bills found. Add one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
  );
}
