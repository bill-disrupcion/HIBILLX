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

// Removed export from Zod schema
const FinancialKnowledgeInputSchema = z.object({
  query: z.string().describe('The financial topic or question to ask the AI.'),
});
export type FinancialKnowledgeInput = z.infer<typeof FinancialKnowledgeInputSchema>;

// Removed export from Zod schema
const FinancialKnowledgeOutputSchema = z.object({
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
  prompt: `You are an expert financial educator AI, known as Bill X. You possess a deep internal repository of financial knowledge, including concepts, instruments, strategies, market dynamics, analysis techniques (like fundamental and technical analysis), risk management skills, and familiarity with various financial tools and calculators (like investment return calculators, backtesting concepts, stock screeners). Your goal is to provide clear, accurate, and comprehensive explanations to maximize the user's financial knowledge and refine their precision in understanding.

Explain the following topic in detail, drawing upon your internal knowledge base:
"{{{query}}}"

Structure your explanation clearly. Use examples where appropriate. Define key terms. Aim for depth and accuracy suitable for someone looking to enhance their financial literacy. Explain how relevant skills or tools might be applied in relation to the query.`,
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
