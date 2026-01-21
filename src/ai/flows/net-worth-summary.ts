'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing a user's net worth.
 *
 * It takes in a list of assets and liabilities and returns a summary of the user's net worth.
 * - netWorthSummary - A function that summarizes the user's net worth.
 * - NetWorthSummaryInput - The input type for the netWorthSummary function.
 * - NetWorthSummaryOutput - The return type for the NetWorthSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NetWorthSummaryInputSchema = z.object({
  assets: z.array(
    z.object({
      name: z.string().describe('Name of the asset'),
      value: z.number().describe('Value of the asset'),
    })
  ).describe('A list of assets.'),
  liabilities: z.array(
    z.object({
      name: z.string().describe('Name of the liability'),
      value: z.number().describe('Value of the liability'),
    })
  ).describe('A list of liabilities.'),
});

export type NetWorthSummaryInput = z.infer<typeof NetWorthSummaryInputSchema>;

const NetWorthSummaryOutputSchema = z.object({
  netWorth: z.number().describe('The calculated net worth.'),
  summary: z.string().describe('A summary of the user\'s net worth.'),
});

export type NetWorthSummaryOutput = z.infer<typeof NetWorthSummaryOutputSchema>;

export async function netWorthSummary(input: NetWorthSummaryInput): Promise<NetWorthSummaryOutput> {
  return netWorthSummaryFlow(input);
}

const netWorthSummaryPrompt = ai.definePrompt({
  name: 'netWorthSummaryPrompt',
  input: {schema: NetWorthSummaryInputSchema},
  output: {schema: NetWorthSummaryOutputSchema},
  prompt: `You are a financial advisor. Calculate the net worth (assets minus liabilities) and provide a concise summary of the user\'s net worth.

  Assets:
  {{#each assets}}
  - {{name}}: {{value}}
  {{/each}}

  Liabilities:
  {{#each liabilities}}
  - {{name}}: {{value}}
  {{/each}}

  Calculate the net worth and provide a short summary.
  `,
});

const netWorthSummaryFlow = ai.defineFlow(
  {
    name: 'netWorthSummaryFlow',
    inputSchema: NetWorthSummaryInputSchema,
    outputSchema: NetWorthSummaryOutputSchema,
  },
  async input => {
    const totalAssets = input.assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = input.liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const netWorth = totalAssets - totalLiabilities;

    const {output} = await netWorthSummaryPrompt({
      ...input,
    });

    return {
      ...output,
      netWorth: netWorth,
    };
  }
);

