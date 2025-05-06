// use server'
'use server';

/**
 * @fileOverview AI agent to suggest advanced trading strategies based on market trends and historical data.
 *
 * - suggestTradingStrategies - A function that handles the suggestion of trading strategies.
 * - SuggestTradingStrategiesInput - The input type for the suggestTradingStrategies function.
 * - SuggestTradingStrategiesOutput - The return type for the suggestTradingStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {getInstruments, getMarketData} from '@/services/broker-api';

const SuggestTradingStrategiesInputSchema = z.object({
  investmentAmount: z.number().describe('The total investment amount available.'),
  riskTolerance: z
    .enum(['low', 'medium', 'high'])
    .describe('The risk tolerance level of the investor.'),
  preferredInstruments: z
    .array(z.string())
    .optional()
    .describe('Optional list of preferred instrument tickers.'),
});
export type SuggestTradingStrategiesInput = z.infer<
  typeof SuggestTradingStrategiesInputSchema
>;

const InstrumentAllocationSchema = z.object({
  ticker: z.string().describe("The ticker symbol of the instrument."),
  percentage: z.number().positive().describe("The percentage of the strategy's capital allocated to this instrument.")
});

const TradingStrategySchema = z.object({
  name: z.string().describe('The name of the trading strategy.'),
  description: z.string().describe('A detailed description of the strategy.'),
  instruments: z
    .array(z.string())
    .describe('List of instrument tickers relevant to this strategy.'),
  allocation: z
    .array(InstrumentAllocationSchema)
    .describe('The allocation of investment amount for each instrument within this specific strategy.'),
  expectedReturn: z.number().describe('The estimated expected return of the strategy (annualized percentage).'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The assessed risk level of the strategy.'),
});

const SuggestTradingStrategiesOutputSchema = z.object({
  strategies: z.array(TradingStrategySchema).describe('A list of suggested trading strategies.'),
  summary: z.string().describe('A summary of the suggested strategies and their rationale.'),
});
export type SuggestTradingStrategiesOutput = z.infer<
  typeof SuggestTradingStrategiesOutputSchema
>;

export async function suggestTradingStrategies(
  input: SuggestTradingStrategiesInput
): Promise<SuggestTradingStrategiesOutput> {
  return suggestTradingStrategiesFlow(input);
}

const tradingStrategyPrompt = ai.definePrompt({
  name: 'tradingStrategyPrompt',
  input: {schema: SuggestTradingStrategiesInputSchema},
  output: {schema: SuggestTradingStrategiesOutputSchema},
  prompt: `You are an expert financial advisor AI, skilled in crafting advanced trading strategies for governmental instruments and related markets.

  Based on the investor's profile and current market conditions, suggest specific, actionable trading strategies that align with their investment goals.

  Consider the investment amount, risk tolerance ({{riskTolerance}}), and preferred instruments ({{#if preferredInstruments}}using these preferred: {{{preferredInstruments}}}{{else}}consider all available{{/if}}).

  **Available Instruments & Data:**
  Provide context on available instruments and their recent performance trends if possible (outside of this basic prompt). This data should be fetched and included in a real implementation.

  **Example Governmental Trading Strategies (Adapt and Expand):**
  1.  **Yield Curve Steepener:** Based on analysis suggesting a steepening curve, allocate to short-term government bonds and short positions in long-term government bonds (or ETFs). Define allocation percentages.
  2.  **Inflation Protection:** Allocate to inflation-linked bonds (e.g., TIPS) and potentially commodities or related ETFs if inflation expectations are rising. Specify allocation percentages.
  3.  **Sovereign Spread Convergence:** If analysis indicates a spread between two sovereign bonds (e.g., US vs. Germany 10-year) is likely to narrow, long the higher-yielding bond and short the lower-yielding one. Detail the allocation.
  4.  **Duration Hedging:** Construct a portfolio with a target duration, potentially using bond futures or ETFs to adjust duration based on interest rate forecasts.
  5.  **Carry Trade (FX Hedged):** Borrow in a low-yield currency (e.g., JPY) to invest in higher-yielding government bonds (e.g., US Treasuries), hedging the currency risk. Define the allocation and hedge ratio.

  **Task:**
  Generate a list of 2-3 concrete trading strategies based on the provided input:
  Investment Amount: {{{investmentAmount}}}
  Risk Tolerance: {{{riskTolerance}}}
  {{#if preferredInstruments}}Preferred Instruments: {{{preferredInstruments}}}{{/if}}

  For each strategy, provide:
  - A clear name.
  - A detailed description including the market rationale.
  - The specific instruments (tickers) involved.
  - A specific percentage allocation for each instrument within the strategy (using the defined array structure for 'allocation').
  - An estimated expected return (annualized %).
  - The assessed risk level (low, medium, high).

  Provide a final summary explaining the rationale for the selected strategies.

  Return the output as a valid JSON object conforming to the SuggestTradingStrategiesOutput schema.
  `,
});


const suggestTradingStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestTradingStrategiesFlow',
    inputSchema: SuggestTradingStrategiesInputSchema,
    outputSchema: SuggestTradingStrategiesOutputSchema,
  },
  async input => {
    // Fetch available instruments (Consider enhancing this with market data)
    const instruments = await getInstruments();
    const availableTickers = instruments.map(instrument => instrument.ticker);

    // Optionally filter instruments based on user preference - ensure preferred are valid
    const preferredInstruments = input.preferredInstruments
        ?.map(ticker => ticker.trim().toUpperCase()) // Normalize
        .filter(ticker => availableTickers.includes(ticker));

    // Log input being sent to the prompt
     console.log("Input for tradingStrategyPrompt:", {
        ...input,
        // Provide relevant tickers to the prompt, preferring user input if valid, otherwise all available
        preferredInstruments: (preferredInstruments && preferredInstruments.length > 0) ? preferredInstruments : availableTickers,
     });


    // Call the prompt to generate trading strategies
    try {
        const {output} = await tradingStrategyPrompt({
          ...input,
          preferredInstruments: (preferredInstruments && preferredInstruments.length > 0) ? preferredInstruments : availableTickers,
        });

         // Add validation for the output structure before returning
         if (!output || !output.strategies || !Array.isArray(output.strategies)) {
             console.error("AI response validation failed: Invalid strategies array.", output);
             throw new Error("AI failed to generate valid trading strategies.");
         }
         output.strategies.forEach((strat, index) => {
            if (!strat.allocation || !Array.isArray(strat.allocation)) {
                 console.error(`AI response validation failed: Strategy ${index} has invalid allocation.`, strat);
                 throw new Error(`AI failed to generate valid allocation for strategy: ${strat.name || 'Unnamed'}`);
            }
            // Further validation on allocation items if needed
         });


        console.log("Successfully generated trading strategies:", output);
        return output!;

    } catch(error) {
         console.error("Error calling tradingStrategyPrompt or processing output:", error);
         // Re-throw or handle the error appropriately
         throw error;
    }
  }
);
