'use server';

/**
 * @fileOverview AI-powered insights flow for personalized financial recommendations.
 *
 * - getFinancialInsights - A function that provides financial insights based on user data.
 * - FinancialInsightsInput - The input type for the getFinancialInsights function.
 * - FinancialInsightsOutput - The return type for the getFinancialInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialInsightsInputSchema = z.object({
  cashLeft: z.number().describe('The amount of cash the user has left.'),
  spendingPace: z.number().describe('The user\'s current spending pace.'),
  upcomingBills: z.array(z.object({
    name: z.string(),
    amount: z.number(),
    dueDate: z.string(),
  })).describe('A list of the user\'s upcoming bills.'),
  savingsProgress: z.number().describe('The user\'s savings progress.'),
  monthlyBudget: z.number().describe('The user\'s monthly budget.'),
  expenses: z.array(z.object({
    category: z.string(),
    amount: z.number(),
  })).describe('A list of the user\'s expenses by category.'),
});
export type FinancialInsightsInput = z.infer<typeof FinancialInsightsInputSchema>;

const FinancialInsightsOutputSchema = z.object({
  insights: z.array(z.string()).describe('A list of personalized financial insights and recommendations.'),
});
export type FinancialInsightsOutput = z.infer<typeof FinancialInsightsOutputSchema>;

export async function getFinancialInsights(input: FinancialInsightsInput): Promise<FinancialInsightsOutput> {
  return financialInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialInsightsPrompt',
  input: {schema: FinancialInsightsInputSchema},
  output: {schema: FinancialInsightsOutputSchema},
  prompt: `You are a personal finance advisor. Analyze the user's financial data and provide personalized insights and recommendations to improve their financial health.

Here is the user's financial data:

Cash Left: {{cashLeft}}
Spending Pace: {{spendingPace}}
Upcoming Bills: {{#each upcomingBills}}{{name}}: {{amount}} due on {{dueDate}}\n{{/each}}
Savings Progress: {{savingsProgress}}
Monthly Budget: {{monthlyBudget}}
Expenses by Category: {{#each expenses}}{{category}}: {{amount}}\n{{/each}}

Provide a list of insights and recommendations. Be specific and actionable.
`,
});

const financialInsightsFlow = ai.defineFlow(
  {
    name: 'financialInsightsFlow',
    inputSchema: FinancialInsightsInputSchema,
    outputSchema: FinancialInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
