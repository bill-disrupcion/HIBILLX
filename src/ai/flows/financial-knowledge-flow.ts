'use server';
/**
 * @fileOverview Provides financial explanations using an AI model.
 *
 * - getFinancialKnowledge - Function to query the AI about financial topics.
 * - FinancialKnowledgeInput - Input schema for the query.
 * - FinancialKnowledgeOutput - Output schema for the explanation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export const FinancialKnowledgeInputSchema = z.object({
  query: z.string().describe('The financial topic or question to ask the AI.'),
});
export type FinancialKnowledgeInput = z.infer<typeof FinancialKnowledgeInputSchema>;

export const FinancialKnowledgeOutputSchema = z.object({
  explanation: z.string().describe('A detailed explanation of the financial topic.'),
});
export type FinancialKnowledgeOutput = z.infer<typeof FinancialKnowledgeOutputSchema>;

// Exported function wrapper
export async function getFinancialKnowledge(input: FinancialKnowledgeInput): Promise<FinancialKnowledgeOutput> {
  return financialKnowledgeFlow(input);
}

// Define the prompt
const financialKnowledgePrompt = ai.definePrompt({
  name: 'financialKnowledgePrompt',
  input: { schema: FinancialKnowledgeInputSchema },
  output: { schema: FinancialKnowledgeOutputSchema },
  prompt: `You are an expert financial educator AI, known as Bill X. Your goal is to provide clear, accurate, and comprehensive explanations of financial concepts, instruments, strategies, and market dynamics. Maximize the user's financial knowledge and refine their precision in understanding.

Explain the following topic in detail:
"{{{query}}}"

Structure your explanation clearly. Use examples where appropriate. Define key terms. Aim for depth and accuracy suitable for someone looking to enhance their financial literacy.`,
});

// Define the flow
const financialKnowledgeFlow = ai.defineFlow(
  {
    name: 'financialKnowledgeFlow',
    inputSchema: FinancialKnowledgeInputSchema,
    outputSchema: FinancialKnowledgeOutputSchema,
  },
  async (input) => {
    const { output } = await financialKnowledgePrompt(input);
    // Basic output validation (ensure output exists)
    if (!output) {
        throw new Error("AI failed to generate a response.");
    }
    return output; // Directly return the structured output
  }
);
