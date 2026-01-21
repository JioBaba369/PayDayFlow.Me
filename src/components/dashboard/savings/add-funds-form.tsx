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

const formSchema = z.object({
  amount: z.coerce.number().positive({
    message: 'Amount must be a positive number.',
  }),
});

export type AddFundsFormValues = z.infer<typeof formSchema>;

type AddFundsFormProps = {
  onSubmit: (values: AddFundsFormValues) => Promise<void>;
  isSubmitting: boolean;
};

export function AddFundsForm({ onSubmit, isSubmitting }: AddFundsFormProps) {
  const form = useForm<AddFundsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Add</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 50.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Add Funds
        </Button>
      </form>
    </Form>
  );
}
