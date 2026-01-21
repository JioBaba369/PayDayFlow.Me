'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Liability } from '@/lib/types';

const liabilityTypes = ['Loan', 'Credit Card', 'Mortgage', 'Other'] as const;

const formSchema = z.object({
  name: z.string().min(2, { message: 'Liability name must be at least 2 characters.' }),
  value: z.coerce.number().positive({ message: 'Value must be a positive number.' }),
  type: z.enum(liabilityTypes),
});

export type LiabilityFormValues = z.infer<typeof formSchema>;

type LiabilityFormProps = {
  onSubmit: (values: LiabilityFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialData?: Liability | null;
};

export function LiabilityForm({ onSubmit, isSubmitting, initialData }: LiabilityFormProps) {
  const form = useForm<LiabilityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      value: initialData?.value || 0,
      type: initialData?.type
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Liability Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Student Loan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount Owed</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 10000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a liability type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {liabilityTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Liability'}
        </Button>
      </form>
    </Form>
  );
}
