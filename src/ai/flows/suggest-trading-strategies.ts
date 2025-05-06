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

const TradingStrategySchema = z.object({
  name: z.string().describe('The name of the trading strategy.'),
  description: z.string().describe('A detailed description of the strategy.'),
  instruments: z
    .array(z.string())
    .describe('List of instrument tickers to be used in this strategy.'),
  allocation: z
    .record(z.number())
    .describe('The allocation of investment amount for each instrument.'),
  expectedReturn: z.number().describe('The expected return of the strategy.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The risk level of the strategy.'),
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
  prompt: `You are an expert financial advisor AI, skilled in crafting advanced trading strategies.

  Based on the investor's profile and current market conditions, suggest trading strategies that align with their investment goals.

  Consider the investment amount, risk tolerance ({{riskTolerance}}), and preferred instruments ({{preferredInstruments}} if provided).

  Here are example trading strategies:
  1.  **Diversified Portfolio with ETFs**: Invest in a mix of ETFs covering various sectors (e.g., technology, healthcare, energy) to diversify risk and capture broad market returns. Allocate based on market trends and sector outlook.
  2.  **Growth Stock Strategy**: Invest in growth stocks with high potential for capital appreciation. Select companies with strong revenue growth, innovative products, and competitive advantages.
  3.  **Value Investing Strategy**: Invest in undervalued stocks with strong fundamentals. Identify companies with low price-to-earnings ratios, high dividend yields, and solid balance sheets.

  Based on the input:
investmentAmount: {{{investmentAmount}}}
riskTolerance: {{{riskTolerance}}}
preferredInstruments: {{{preferredInstruments}}}

Return JSON:`,
});

const suggestTradingStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestTradingStrategiesFlow',
    inputSchema: SuggestTradingStrategiesInputSchema,
    outputSchema: SuggestTradingStrategiesOutputSchema,
  },
  async input => {
    // Fetch available instruments
    const instruments = await getInstruments();

    // Optionally filter instruments based on user preference
    const availableTickers = instruments.map(instrument => instrument.ticker);
    const preferredInstruments = input.preferredInstruments?.filter(ticker =>
      availableTickers.includes(ticker)
    );

    // Fetch market data for instruments
    const marketDataPromises = instruments.map(instrument =>
      getMarketData(instrument.ticker)
    );
    const marketData = await Promise.all(marketDataPromises);

    // Call the prompt to generate trading strategies
    const {output} = await tradingStrategyPrompt({
      ...input,
      preferredInstruments: preferredInstruments ?? availableTickers,
    });
    return output!;
  }
);
