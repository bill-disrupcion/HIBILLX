'use server';
/**
 * @fileOverview An AI agent for analyzing investment options based on user risk profile and financial goals.
 *
 * - analyzeInvestmentOptions - A function that analyzes investment options.
 * - AnalyzeInvestmentOptionsInput - The input type for the analyzeInvestmentOptions function.
 * - AnalyzeInvestmentOptionsOutput - The return type for the analyzeInvestmentOptions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getInstruments, getMarketData} from '@/services/broker-api';

const AnalyzeInvestmentOptionsInputSchema = z.object({
  riskProfile: z
    .string()
    .describe("The user's risk profile (e.g., 'conservative', 'moderate', 'aggressive')."),
  financialGoals: z
    .string()
    .describe("The user's financial goals (e.g., 'retirement', 'saving for a home', 'short-term gains')."),
  investmentAmount: z.number().describe('The amount of money the user wants to invest.'),
});
export type AnalyzeInvestmentOptionsInput = z.infer<
  typeof AnalyzeInvestmentOptionsInputSchema
>;

const InvestmentOptionSchema = z.object({
  ticker: z.string().describe('The ticker symbol of the investment option.'),
  name: z.string().describe('The name of the investment option.'),
  percentage: z
    .number()
    .describe('The percentage of the investment amount to allocate to this option.'),
  reason: z.string().describe('The rationale for including this investment option.'),
});

const AnalyzeInvestmentOptionsOutputSchema = z.object({
  investmentOptions: z.array(InvestmentOptionSchema).describe('The recommended investment options.'),
  summary: z.string().describe('A summary of the investment analysis.'),
});
export type AnalyzeInvestmentOptionsOutput = z.infer<
  typeof AnalyzeInvestmentOptionsOutputSchema
>;

export async function analyzeInvestmentOptions(
  input: AnalyzeInvestmentOptionsInput
): Promise<AnalyzeInvestmentOptionsOutput> {
  return analyzeInvestmentOptionsFlow(input);
}

const analyzeInvestmentOptionsPrompt = ai.definePrompt({
  name: 'analyzeInvestmentOptionsPrompt',
  input: {schema: AnalyzeInvestmentOptionsInputSchema},
  output: {schema: AnalyzeInvestmentOptionsOutputSchema},
  prompt: `You are an expert financial advisor. Analyze the following investment options based on the user's risk profile and financial goals.

Risk Profile: {{{riskProfile}}}
Financial Goals: {{{financialGoals}}}
Investment Amount: {{{investmentAmount}}}

Consider various investment options, such as stocks, bonds, and ETFs. Provide a rationale for each investment option.

Format the output as a JSON object with investmentOptions (array of ticker, name, percentage, and reason) and summary fields.

Here are some available instruments:
{{#each instruments}}
- {{ticker}}: {{name}}
{{/each}}
`,
});

const analyzeInvestmentOptionsFlow = ai.defineFlow(
  {
    name: 'analyzeInvestmentOptionsFlow',
    inputSchema: AnalyzeInvestmentOptionsInputSchema,
    outputSchema: AnalyzeInvestmentOptionsOutputSchema,
  },
  async input => {
    const instruments = await getInstruments();
    const instrumentsWithMarketData = await Promise.all(
      instruments.map(async instrument => {
        const marketData = await getMarketData(instrument.ticker);
        return {...instrument, price: marketData.price};
      })
    );

    const {output} = await analyzeInvestmentOptionsPrompt({
      ...input,
      instruments: instrumentsWithMarketData,
    });
    return output!;
  }
);
