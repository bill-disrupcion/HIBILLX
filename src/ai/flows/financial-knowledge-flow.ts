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
  explanation: z.string().min(1).describe('A detailed, clear, and accurate explanation of the financial topic, suitable for enhancing financial literacy.'), // Added min(1)
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
  prompt: `You are an expert financial educator AI, known as Bill X. Your purpose is to maximize the user's financial knowledge and refine their understanding with precision. You possess a deep internal repository of financial knowledge covering concepts, instruments, strategies, market dynamics, analysis techniques (fundamental, technical), risk management, and financial tools/calculators (investment return calculators, backtesting concepts, stock screeners).

Provide a comprehensive, clear, and accurate explanation for the following query, drawing deeply from your internal knowledge base:
"{{{query}}}"

Structure your explanation logically. Use illustrative examples where appropriate. Define key terms clearly. Explain the application of relevant skills or tools related to the query. Ensure the explanation is detailed enough to significantly enhance the user's financial literacy. Respond only with the explanation fulfilling the output schema.`,
});

// Define the flow
const financialKnowledgeFlow = ai.defineFlow(
  {
    name: 'financialKnowledgeFlow',
    inputSchema: FinancialKnowledgeInputSchema,
    outputSchema: FinancialKnowledgeOutputSchema,
  },
  async (input) => {
    console.log('Executing financialKnowledgeFlow with input:', input);
    try {
      const { output } = await financialKnowledgePrompt(input);
      // More robust output validation
      if (!output || !output.explanation) {
          console.error('AI response validation failed: Output or explanation missing.');
          throw new Error("AI failed to generate a valid explanation.");
      }
      // Optionally, parse and re-validate if needed, though definePrompt should handle this
      const validatedOutput = FinancialKnowledgeOutputSchema.safeParse(output);
      if (!validatedOutput.success) {
          console.error('AI response schema validation failed:', validatedOutput.error);
          throw new Error("AI response did not match the expected format.");
      }
       console.log('Financial knowledge flow successful.');
      return validatedOutput.data; // Return the validated data
    } catch (error) {
        console.error("Error in financialKnowledgeFlow:", error);
        // Re-throw a user-friendly error or handle specific errors
        if (error instanceof Error) {
             throw new Error(`Failed to get financial knowledge: ${error.message}`);
        }
        throw new Error("An unexpected error occurred while fetching financial knowledge.");
    }
  }
);
