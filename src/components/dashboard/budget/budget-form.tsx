'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { Budget } from '@/lib/types';

const formSchema = z.object({
  category: z.string().min(2, {
    message: 'Category name must be at least 2 characters.',
  }),
  allocated: z.coerce.number().positive({
    message: 'Allocated amount must be a positive number.',
  }),
});

export type BudgetFormValues = z.infer<typeof formSchema>;

type BudgetFormProps = {
  onSubmit: (values: BudgetFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Budget | null;
};

export function BudgetForm({ onSubmit, isSubmitting, initialData }: BudgetFormProps) {
  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: initialData?.category || '',
      allocated: initialData?.allocated || 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Groceries" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="allocated"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Allocated Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Budget'}
        </Button>
      </form>
    </Form>
  );
}
