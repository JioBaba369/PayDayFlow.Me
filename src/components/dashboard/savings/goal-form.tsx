'use client';

import * as React from 'react';
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
import { Loader2, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import type { SavingsGoal } from '@/lib/types';
import { DatePickerPresets } from '@/components/ui/date-picker-presets';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Goal name must be at least 2 characters.',
  }),
  targetAmount: z.coerce.number().positive({
    message: 'Target amount must be a positive number.',
  }),
  targetDate: z.date().optional(),
});

export type GoalFormValues = z.infer<typeof formSchema>;

type GoalFormProps = {
  onSubmit: (values: GoalFormValues) => Promise<void>;
  isSubmitting: boolean;
  initialData?: SavingsGoal | null;
};

export function GoalForm({ onSubmit, isSubmitting, initialData }: GoalFormProps) {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const form = useForm<GoalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      targetAmount: initialData?.targetAmount || 0,
      targetDate: initialData?.targetDate ? parseISO(initialData.targetDate) : undefined,
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
              <FormLabel>Goal Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., New Car" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetAmount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 20000" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="targetDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Target Date (Optional)</FormLabel>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        field.onChange(date);
                        setDatePickerOpen(false);
                      }
                    }}
                    disabled={(date) =>
                      date < new Date()
                    }
                    fromDate={new Date()}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 20}
                    initialFocus
                  />
                  <DatePickerPresets
                    presets={['3-months', '6-months', '1-year']}
                    onSelect={(date) => {
                        field.onChange(date);
                        setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? 'Save Changes' : 'Add Goal'}
        </Button>
      </form>
    </Form>
  );
}
