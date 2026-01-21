'use server';
/**
 * @fileOverview Provides personalized financial advice and insights based on user financial data.
 *
 * - getFinancialAdvice - A function to retrieve financial advice.
 * - FinancialAdviceInput - The input type for the getFinancialAdvice function.
 * - FinancialAdviceOutput - The return type for the getFinancialAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FinancialAdviceInputSchema = z.object({
  cashLeft: z.number().describe('The amount of cash left.'),
  upcomingBills: z.number().describe('The total amount of upcoming bills.'),
  savingsProgress: z.number().describe('The progress towards savings goals (0-100).'),
  monthlyBudget: z.number().describe('The total monthly budget.'),
  spendingCategories: z
    .record(z.number())
    .describe('A record of spending categories and their amounts.'),
  netWorth: z.number().describe('The net worth of the user.'),
  runway: z.number().describe('The personal runway in months.'),
  burnRate: z.number().describe('The monthly burn rate.'),
  savingsVelocity: z.number().describe('The savings velocity.'),
});
export type FinancialAdviceInput = z.infer<typeof FinancialAdviceInputSchema>;

const FinancialAdviceOutputSchema = z.object({
  advice: z.string().describe('Personalized financial advice and insights.'),
});
export type FinancialAdviceOutput = z.infer<typeof FinancialAdviceOutputSchema>;

export async function getFinancialAdvice(input: FinancialAdviceInput): Promise<FinancialAdviceOutput> {
  return financialAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'financialAdvicePrompt',
  input: {schema: FinancialAdviceInputSchema},
  output: {schema: FinancialAdviceOutputSchema},
  prompt: `You are a personal finance advisor. Based on the following financial data, provide personalized advice and insights to the user.

Cash Left: {{{cashLeft}}}
Upcoming Bills: {{{upcomingBills}}}
Savings Progress: {{{savingsProgress}}}%
Monthly Budget: {{{monthlyBudget}}}
Spending Categories: {{#each spendingCategories}}{{{@key}}}: {{{this}}}, {{/each}}
Net Worth: {{{netWorth}}}
Personal Runway: {{{runway}}} months
Burn Rate: {{{burnRate}}}
Savings Velocity: {{{savingsVelocity}}} 

Give specific and actionable advice to improve their financial health, considering all the provided information.`,
});

const financialAdviceFlow = ai.defineFlow(
  {
    name: 'financialAdviceFlow',
    inputSchema: FinancialAdviceInputSchema,
    outputSchema: FinancialAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
