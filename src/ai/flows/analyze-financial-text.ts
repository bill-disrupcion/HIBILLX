import { generateText, defineFlow } from '@genkit-ai/flow';
import { geminiPro } from '@genkit-ai/vertexai'; // Assuming you are using Vertex AI with gemini-pro

export const analyzeFinancialTextFlow = defineFlow(
  {
    name: 'analyzeFinancialTextFlow',
    inputSchema: {
      type: 'string', // Input is the financial text
    },
    outputSchema: {
      type: 'string', // Output is the analysis from Gemini
    },
  },
  async (financialText) => {
    const geminiResponse = await generateText({
      model: geminiPro, // Use the configured Gemini model
      prompt: `Analyze the following financial text and provide key insights, potential market impacts, and any relevant trends. Focus on information relevant to investment decisions:\n\n${financialText}`,
      config: {
        maxOutputTokens: 512, // Adjust as needed
      },
    });

    // Extract and return the generated text
    return geminiResponse.text();
  }
);