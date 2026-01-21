'use server';

/**
 * @fileOverview Provides a GenAI-powered summary of user spending habits.
 *
 * - summarizeSpending -  A function that takes monthly spending data and returns a summary of spending habits.
 * - SummarizeSpendingInput - The input type for the summarizeSpending function.
 * - SummarizeSpendingOutput - The return type for the summarizeSpending function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSpendingInputSchema = z.object({
  monthlySpendingData: z.record(z.number()).describe('A record of spending data for the month, with categories as keys and amounts as values.'),
});
export type SummarizeSpendingInput = z.infer<typeof SummarizeSpendingInputSchema>;

const SummarizeSpendingOutputSchema = z.object({
  summary: z.string().describe('A summary of the users spending habits for the month, highlighting key trends and areas for optimization.'),
});
export type SummarizeSpendingOutput = z.infer<typeof SummarizeSpendingOutputSchema>;

export async function summarizeSpending(input: SummarizeSpendingInput): Promise<SummarizeSpendingOutput> {
  return summarizeSpendingFlow(input);
}

const summarizeSpendingPrompt = ai.definePrompt({
  name: 'summarizeSpendingPrompt',
  input: {schema: SummarizeSpendingInputSchema},
  output: {schema: SummarizeSpendingOutputSchema},
  prompt: `You are a personal finance advisor. Please analyze the following monthly spending data and provide a concise summary of the user's spending habits, highlighting key trends and areas where they can optimize their expenses.\n\nSpending Data: {{{monthlySpendingData}}}`, // Handlebars syntax
});

const summarizeSpendingFlow = ai.defineFlow(
  {
    name: 'summarizeSpendingFlow',
    inputSchema: SummarizeSpendingInputSchema,
    outputSchema: SummarizeSpendingOutputSchema,
  },
  async input => {
    const {output} = await summarizeSpendingPrompt(input);
    return output!;
  }
);
