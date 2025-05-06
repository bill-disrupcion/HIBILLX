'use server';
/**
 * @fileOverview Summarizes relevant market news and financial reports.
 *
 * - summarizeMarketNews - A function that handles the summarization of market news.
 * - SummarizeMarketNewsInput - The input type for the summarizeMarketNews function.
 * - SummarizeMarketNewsOutput - The return type for the summarizeMarketNews function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeMarketNewsInputSchema = z.object({
  newsArticles: z.array(z.string()).describe('An array of news articles to summarize.'),
});
export type SummarizeMarketNewsInput = z.infer<typeof SummarizeMarketNewsInputSchema>;

const SummarizeMarketNewsOutputSchema = z.object({
  summary: z.string().describe('A summary of the market news.'),
});
export type SummarizeMarketNewsOutput = z.infer<typeof SummarizeMarketNewsOutputSchema>;

export async function summarizeMarketNews(input: SummarizeMarketNewsInput): Promise<SummarizeMarketNewsOutput> {
  return summarizeMarketNewsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMarketNewsPrompt',
  input: {schema: SummarizeMarketNewsInputSchema},
  output: {schema: SummarizeMarketNewsOutputSchema},
  prompt: `Summarize the following news articles:

  {{#each newsArticles}}
  Article {{@index}}: {{{this}}}
  {{/each}}
  `,
});

const summarizeMarketNewsFlow = ai.defineFlow(
  {
    name: 'summarizeMarketNewsFlow',
    inputSchema: SummarizeMarketNewsInputSchema,
    outputSchema: SummarizeMarketNewsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
