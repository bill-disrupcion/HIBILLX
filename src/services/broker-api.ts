

/**
 * @fileoverview Interacts with brokerage and financial data APIs.
 * Enhanced with error handling, validation, and risk mitigation concepts.
 * Actual implementation requires API keys, SDKs, and robust backend infrastructure.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { z } from 'zod'; // Import zod for validation

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Custom Error Types ---
/** Base class for custom API errors */
export class ApiError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = this.constructor.name;
  }
}

/** Error related to broker connection or availability */
export class BrokerConnectionError extends ApiError {}

/** Error related to data validation (input or received) */
export class ValidationError extends ApiError {}

/** Error related to unexpected market conditions (e.g., halted) */
export class MarketConditionError extends ApiError {}

/** Error related to compliance or regulatory issues */
export class ComplianceError extends ApiError {}

/** Error related to insufficient permissions or authentication */
export class AuthorizationError extends ApiError {}

/** Error related to external data provider issues */
export class DataProviderError extends ApiError {}


// --- Constants ---
// Keep MOCK_API_ERROR_RATE low or zero for testing real integration points
const MOCK_API_ERROR_RATE = 0.0; // Set to 0 to disable simulated errors during development

/**
 * Represents a financial instrument.
 */
export interface Instrument {
  /** The ticker symbol of the instrument (e.g., AAPL, GOOGL, US10Y). */
  ticker: string;
  /** The name of the company or asset. */
  name: string;
  /** Optional: Current price (can be added when fetching movers). */
  price?: number;
  /** Optional: Price change percentage (can be added when fetching movers). */
  changePercent?: number;
  /** Optional: Asset type, crucial for governmental context. */
  asset_type?: AssetType;
  /** Optional: Country of issuance. */
  country?: string;
   /** Optional: Maturity date for bonds. */
  maturity_date?: Date;
}

/**
 * Represents market data for a financial instrument.
 */
export interface MarketData {
  /** The ticker symbol of the instrument. */
  ticker: string;
  /** The current price OR yield of the instrument. */
  price: number; // Can represent price or yield
  /** The timestamp of the market data. */
  timestamp: Date;
  /** Optional: Previous closing price/yield. */
  previousClose?: number;
   /** Optional: Calculated price/yield change value. */
   changeValue?: number;
   /** Optional: Calculated price/yield change percentage. */
   changePercent?: number;
   /** Optional: Bid price/yield. */
   bid?: number;
   /** Optional: Ask price/yield. */
   ask?: number;
   /** Optional: Trading volume. */
   volume?: number;
    /** Optional: Yield value (if price represents price). */
   yield_value?: number;
   /** Optional: Maturity date for bonds. */
   maturity_date?: Date;
    /** Optional: Bond duration. */
   duration?: number;
    /** Optional: Bond convexity. */
   convexity?: number;
}

// Zod schema for basic Order validation
const OrderSchema = z.object({
  ticker: z.string().min(1, "Ticker symbol is required."),
  quantity: z.number().positive("Quantity must be a positive number."),
  type: z.enum(['buy', 'sell']),
  orderPriceType: z.enum(['market', 'limit']).optional(),
  limitPrice: z.number().optional(),
  time_in_force: z.string().optional(),
  // Add other fields as needed
});

/**
 * Represents an order for buying or selling a financial instrument.
 */
export interface Order extends z.infer<typeof OrderSchema> {
  /** Optional unique ID for the order (assigned by broker). */
  id?: string;
  /** The status of the order (e.g., pending, filled, cancelled). */
  status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected' | 'accepted' | 'new';
  /** The timestamp when the order was created or submitted. */
  createdAt?: Date;
  /** The timestamp when the order was last updated (e.g., filled). */
  updatedAt?: Date;
   /** Optional: Identifier for the strategy that generated the order. */
  strategy_id?: string;
   /** Optional: Broker identifier if routing is needed. */
  broker_id?: string;
}

/**
 * Enumeration for Asset Types relevant to governmental trading.
 */
export enum AssetType {
    SOVEREIGN_BOND = "sovereign_bond",
    TREASURY_BILL = "treasury_bill",
    MUNICIPAL_BOND = "municipal_bond",
    AGENCY_BOND = "agency_bond",
    INFLATION_LINKED = "inflation_linked",
    STOCK_INDEX_ETF = "stock_index_etf", // For market context
    CURRENCY_PAIR = "currency_pair", // Forex if relevant
    OTHER = "other"
}

/**
 * Represents the current position of an instrument in the portfolio.
 */
export interface Position {
  /** The ticker symbol of the instrument. */
  ticker: string;
  /** The quantity held (shares, contracts, face value). */
  quantity: number;
  /** The average price/yield at which the position was acquired. */
  averagePrice: number; // Can be price or avg yield basis
   /** Optional: Current market price/yield. Added dynamically or from broker. */
  current_price?: number;
   /** Optional: Yield value if current_price is price. Added dynamically or from broker. */
   yield_value?: number;
   /** Optional: Current market value. Added dynamically or from broker. */
  market_value?: number;
   /** Optional: Unrealized profit or loss. Added dynamically or from broker. */
   unrealized_pnl?: number;
   /** Optional: Realized profit or loss (from closed portions). Provided by broker. */
  realized_pnl?: number;
  /** Optional: Type of the asset. */
  asset_type?: AssetType;
  /** Optional: Country of issuance for bonds. */
  country?: string;
   /** Optional: Maturity date for bonds. */
   maturity_date?: Date;
   /** Optional: Current duration for bonds. Added dynamically or from broker. */
   duration?: number;
}

// Zod schema for DepositDetails validation
const DepositDetailsSchema = z.object({
    amount: z.number().positive({ message: "Deposit amount must be positive." }).min(5, { message: "Minimum deposit is $5."}),
    method: z.enum(["bank_transfer", "card", "nequi", "daviplata", "paypal"]),
    currency: z.string().length(3, "Currency code must be 3 characters."), // Basic validation
    payment_token: z.string().optional(),
    reference_number: z.string().optional(),
    customer_identifier: z.string().optional(),
});

/**
 * Represents details for a deposit transaction (includes common consumer methods).
 */
 export interface DepositDetails extends z.infer<typeof DepositDetailsSchema> {}


/**
 * Represents details for a transfer transaction (institutional context).
 */
export interface TransferDetails {
    amount: number;
    recipient_account_id: string; // Identifier for destination account
    type: 'internal' | 'external_wire' | 'external_ach';
    currency: string;
    memo?: string;
    reference_number?: string;
}

/**
 * Represents details for a withdrawal transaction (institutional context).
 */
export interface WithdrawDetails {
    amount: number;
    destination_account_id: string; // Identifier for destination account (bank, etc.)
    method: 'wire_transfer' | 'ach';
    currency: string;
    reference_number?: string;
}

/**
 * Represents the status of a financial transaction (deposit, transfer, withdraw).
 */
export interface TransactionStatus {
    transactionId: string; // Should be the ID from the payment processor or backend system
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'requires_action';
    message?: string; // Optional message, e.g., reason for failure or action required
    timestamp: Date;
}

/**
 * Represents the institutional account balance.
 */
export interface AccountBalance {
    cash: number; // Available cash
    currency: string;
    buying_power?: number; // Total funds available for trading
    portfolio_value?: number; // Total market value of holdings + cash
    settled_cash?: number; // Cash available for withdrawal
    // Add other relevant fields like margin details if applicable
}

/**
 * Represents Government Bond Yield Data Point.
 */
export interface GovBondYield {
    maturity: string; // e.g., '1m', '3m', '1y', '10y', '30y'
    yield: number; // Current yield percentage
    change?: number; // Change from previous day (in percentage points)
    timestamp: Date; // Timestamp of the data
}


// --- Real API Configuration (Placeholders - Requires .env setup) ---
const REAL_BROKER_API_KEY = process.env.REAL_BROKER_API_KEY;
const REAL_BROKER_SECRET_KEY = process.env.REAL_BROKER_SECRET_KEY;
const REAL_BROKER_API_ENDPOINT = process.env.REAL_BROKER_API_ENDPOINT; // e.g., https://paper-api.alpaca.markets

const REAL_FINANCIAL_DATA_PROVIDER = process.env.REAL_FINANCIAL_DATA_PROVIDER || 'polygon';
const REAL_FINANCIAL_DATA_API_KEY = process.env.REAL_FINANCIAL_DATA_API_KEY;
const REAL_FINANCIAL_DATA_API_ENDPOINT = process.env.REAL_FINANCIAL_DATA_API_ENDPOINT; // e.g., https://api.polygon.io

const NEXT_PUBLIC_BACKEND_API_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT;

const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

// Helper function to simulate potential API errors when using mock data
const simulateError = (message: string): void => {
  if (USE_MOCK_API && MOCK_API_ERROR_RATE > 0 && Math.random() < MOCK_API_ERROR_RATE) {
    console.warn(`Simulating API Error: ${message}`);
    throw new Error(`Simulated API Error: ${message}`);
  }
};

// --- API Functions ---

// --- Financial Data Functions ---

/**
 * Asynchronously retrieves a list of relevant financial instruments.
 * Enhanced with basic validation and error handling.
 *
 * @returns A promise that resolves to an array of Instrument objects.
 * @throws {DataProviderError} If the external API call fails.
 * @throws {ApiError} For other unexpected errors.
 */
export async function getInstruments(): Promise<Instrument[]> {
    const operation = 'getInstruments';
    console.log(`API Call: ${operation}`);
    simulateError('Failed to fetch instruments list.');

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for ${operation}`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error(`${operation}: Real Financial Data API endpoint or key not configured in .env`);
            throw new DataProviderError("Financial Data API not configured.");
        }
        try {
             let apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v3/reference/tickers?active=true&market=stocks&limit=1000&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
             const response = await fetch(apiUrl);

             if (!response.ok) {
                 const errorText = await response.text().catch(() => response.statusText);
                 throw new DataProviderError(`API Error fetching stock tickers: ${response.status} ${errorText}`);
            }

             const stockData = await response.json();
             let instruments: Instrument[] = [];

             if (stockData && stockData.results) {
                 instruments = instruments.concat(stockData.results
                    .filter((asset: any) => ['CS', 'ETF'].includes(asset.type) || (asset.ticker?.startsWith('^') || ['SPY', 'QQQ', 'DIA', 'AGG', 'GOVT', 'BND', 'TIP'].includes(asset.ticker)) )
                    .map((asset: any) => ({
                        ticker: asset.ticker,
                        name: asset.name,
                        asset_type: asset.type === 'ETF' ? AssetType.STOCK_INDEX_ETF : asset.ticker === 'TIP' ? AssetType.INFLATION_LINKED : AssetType.OTHER,
                    })));
             }

            const manualYields = [
                 { ticker: '^FVX', name: '5-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
                 { ticker: '^TNX', name: '10-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
                 { ticker: '^TYX', name: '30-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
             ];
            instruments = instruments.concat(manualYields.filter(my => !instruments.some(i => i.ticker === my.ticker)));

            console.log(`${operation}: Fetched ${instruments.length} relevant instruments from REAL API.`);
            return instruments;

        } catch (error: any) {
            console.error(`Error in ${operation} from real API:`, error);
            if (error instanceof DataProviderError) throw error;
            throw new ApiError(`Failed to fetch instruments: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 300));
         return [
             { ticker: '^FVX', name: '5-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
             { ticker: '^TNX', name: '10-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
             { ticker: '^TYX', name: '30-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
             { ticker: 'AGG', name: 'US Aggregate Bond ETF', asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
             { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', asset_type: AssetType.STOCK_INDEX_ETF, country: 'US'},
             { ticker: 'GOVT', name: 'iShares US Treasury Bond ETF', asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
             { ticker: 'TIP', name: 'iShares TIPS Bond ETF', asset_type: AssetType.INFLATION_LINKED, country: 'US'},
             { ticker: 'SPY', name: 'S&P 500 ETF', asset_type: AssetType.STOCK_INDEX_ETF, country: 'US'},
             { ticker: 'QQQ', name: 'Nasdaq 100 ETF', asset_type: AssetType.STOCK_INDEX_ETF, country: 'US'},
         ];
    }
}

/**
 * Asynchronously retrieves real-time or near real-time market data for a given instrument.
 * Enhanced with basic validation and error handling.
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 * @throws {ValidationError} If the ticker is invalid.
 * @throws {DataProviderError} If the external API call fails.
 * @throws {ApiError} For other unexpected errors.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
    const operation = `getMarketData(${ticker})`;
    console.log(`API Call: ${operation}`);

    // Input validation
    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
        throw new ValidationError("Invalid ticker symbol provided.");
    }

    simulateError(`Failed to fetch market data for ${ticker}.`);

     if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for ${operation} (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error(`${operation}: Real Financial Data API endpoint or key not configured.`);
            throw new DataProviderError("Financial Data API not configured.");
        }
        try {
             const snapshotUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
             let currentPrice: number | undefined;
             let bid: number | undefined;
             let ask: number | undefined;
             let volume: number | undefined;
             let timestamp: Date | undefined;
             let previousClose: number | undefined;
             let changeValue: number | undefined;
             let changePercent: number | undefined;

             try {
                 const snapshotResponse = await fetch(snapshotUrl);
                 if (snapshotResponse.ok) {
                     const snapshotData = await snapshotResponse.json();
                     const tickerData = snapshotData.ticker;
                     if (tickerData) {
                        if (tickerData.lastTrade) {
                            currentPrice = tickerData.lastTrade.p;
                            timestamp = new Date(tickerData.lastTrade.t);
                        } else if (tickerData.lastQuote) {
                            currentPrice = (tickerData.lastQuote.bP + tickerData.lastQuote.aP) / 2;
                            bid = tickerData.lastQuote.bP;
                            ask = tickerData.lastQuote.aP;
                            timestamp = new Date(tickerData.lastQuote.t);
                        }
                        if (tickerData.day) {
                            volume = tickerData.day.v;
                            previousClose = tickerData.prevDay?.c;
                            changeValue = tickerData.todaysChange;
                            changePercent = tickerData.todaysChangePerc;
                        }
                        timestamp = timestamp || new Date(tickerData.updated);
                    }
                 } else {
                    // Log non-OK snapshot response but continue to fallback
                    console.warn(`${operation}: Snapshot API returned ${snapshotResponse.status}. Trying aggregates.`);
                 }
             } catch (snapError: any) {
                 console.warn(`${operation}: Snapshot API call failed, trying aggregates: ${snapError.message}`);
             }

             // Fallback to Previous Day Close if snapshot failed or incomplete
             if (currentPrice === undefined || previousClose === undefined) {
                 console.log(`${operation}: Snapshot insufficient, fetching previous close.`);
                 const prevCloseUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
                 try {
                     const prevCloseResponse = await fetch(prevCloseUrl);
                     if (prevCloseResponse.ok) {
                         const prevCloseData = await prevCloseResponse.json();
                         if (prevCloseData?.results?.length > 0) {
                             const prevAgg = prevCloseData.results[0];
                             if (previousClose === undefined) previousClose = prevAgg.c;
                             if (currentPrice === undefined) {
                                 currentPrice = prevAgg.c; // Use prev close as current price only if snapshot failed entirely
                                 timestamp = new Date(prevAgg.t);
                                 console.warn(`${operation}: Using previous close as current price due to snapshot failure.`);
                             }
                             if (changeValue === undefined && previousClose !== undefined && currentPrice !== undefined) changeValue = currentPrice - previousClose;
                             if (changePercent === undefined && previousClose !== undefined && previousClose !== 0 && changeValue !== undefined) changePercent = (changeValue / previousClose) * 100;
                             if (volume === undefined) volume = prevAgg.v;
                         } else {
                             console.warn(`${operation}: No results found in previous close response.`);
                         }
                     } else {
                         console.warn(`${operation}: Failed to get previous close - ${prevCloseResponse.status}.`);
                     }
                 } catch (aggError: any) {
                      console.warn(`${operation}: Previous close API call failed: ${aggError.message}`);
                 }
             }

             if (currentPrice === undefined) {
                 throw new DataProviderError(`No current price/value found for ${ticker} after multiple attempts.`);
             }

             const price = parseFloat(currentPrice.toFixed(4));
             const prevCloseNum = previousClose !== undefined ? parseFloat(previousClose.toFixed(4)) : undefined;
             const changeValNum = changeValue !== undefined ? parseFloat(changeValue.toFixed(4)) : undefined;
             const changePercNum = changePercent !== undefined ? parseFloat(changePercent.toFixed(2)) : undefined;

             return {
                 ticker: ticker,
                 price: price,
                 timestamp: timestamp || new Date(),
                 previousClose: prevCloseNum,
                 changeValue: changeValNum,
                 changePercent: changePercNum,
                 bid: bid,
                 ask: ask,
                 volume: volume,
             };

        } catch (error: any) {
            console.error(`Error in ${operation} from real API:`, error);
            if (error instanceof DataProviderError || error instanceof ValidationError) throw error;
            throw new ApiError(`Failed to fetch market data for ${ticker}: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 150));
         const isYieldIndex = ticker.startsWith('^');
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT' || ticker === 'TIP') ? 95 : ticker === 'SPY' ? 500 : ticker === 'QQQ' ? 400 : 100;
         const prevClose = baseValue + (Math.random() - 0.5) * (isYieldIndex ? 0.1 : baseValue * 0.01);
         const currentPrice = prevClose + (Math.random() - 0.5) * (isYieldIndex ? 0.05 : baseValue * 0.005);
         const changeValue = currentPrice - prevClose;
         const changePercent = prevClose !== 0 ? (changeValue / prevClose) * 100 : 0;
         return {
            ticker: ticker,
            price: parseFloat(currentPrice.toFixed(4)),
            timestamp: new Date(),
            previousClose: parseFloat(prevClose.toFixed(4)),
            changeValue: parseFloat(changeValue.toFixed(4)),
            changePercent: parseFloat(changePercent.toFixed(2)),
            bid: parseFloat((currentPrice - 0.01).toFixed(4)),
            ask: parseFloat((currentPrice + 0.01).toFixed(4)),
            volume: 100000 + Math.random() * 50000,
            yield_value: isYieldIndex ? parseFloat(currentPrice.toFixed(3)) : ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT' || ticker === 'TIP' ? 2.5 + (Math.random()-0.5)*0.2 : undefined,
         };
    }
}

/**
 * Fetch historical price/yield data for a given ticker and time range.
 * Enhanced with basic validation and error handling.
 *
 * @param ticker The ticker symbol.
 * @param range The time range ('1m', '6m', '1y').
 * @returns A promise resolving to an array of historical data points.
 * @throws {ValidationError} If ticker or range is invalid.
 * @throws {DataProviderError} If the external API call fails or returns no data.
 * @throws {ApiError} For other unexpected errors.
 */
 export async function getHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
    const operation = `getHistoricalData(${ticker}, ${range})`;
    console.log(`API Call: ${operation}`);

    // Input validation
    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
        throw new ValidationError("Invalid ticker symbol provided.");
    }
    const validRanges = ['1m', '6m', '1y'];
    if (!range || !validRanges.includes(range)) {
        throw new ValidationError(`Invalid range specified. Must be one of: ${validRanges.join(', ')}`);
    }

    simulateError(`Failed to fetch historical data for ${ticker}.`);

     if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for ${operation} (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
         if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error(`${operation}: Real Financial Data API endpoint or key not configured.`);
            throw new DataProviderError("Financial Data API not configured.");
        }
        try {
             const endDate = new Date();
             const startDate = new Date();
             let multiplier = 1;
             let timespan = 'day';
             let limit = 5000;
             switch (range) {
                 case '1m': startDate.setMonth(endDate.getMonth() - 1); limit = 31; break;
                 case '6m': startDate.setMonth(endDate.getMonth() - 6); limit = 180; break;
                 case '1y': startDate.setFullYear(endDate.getFullYear() - 1); limit = 366; break;
             }
             const formatAPIDate = (date: Date) => date.toISOString().split('T')[0];
             let apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${formatAPIDate(startDate)}/${formatAPIDate(endDate)}?adjusted=true&sort=asc&limit=${limit}&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;

             const response = await fetch(apiUrl);
             if (!response.ok) {
                 const errorText = await response.text().catch(() => response.statusText);
                 throw new DataProviderError(`API Error fetching historical data: ${response.status} ${errorText}`);
            }
             const data = await response.json();

             if (!data.results || data.results.length === 0) {
                 console.warn(`${operation}: No historical results found for ${ticker} in the specified range.`);
                 // Consider returning empty array instead of throwing error if it's acceptable
                 return [];
                 // throw new DataProviderError(`No results found for ${ticker} in historical data.`);
             }

             return data.results.map((bar: any) => ({
                 date: new Date(bar.t).toISOString().split('T')[0],
                 value: parseFloat(bar.c), // Use closing price 'c'
             }));

        } catch (error: any) {
            console.error(`Error in ${operation} from real API:`, error);
            if (error instanceof DataProviderError || error instanceof ValidationError) throw error;
            throw new ApiError(`Failed to fetch historical data for ${ticker}: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 500));
         const endDate = new Date();
         const startDate = new Date();
         let numPoints = 30;
         if (range === '6m') { numPoints = 126; startDate.setMonth(endDate.getMonth() - 6); }
         else if (range === '1y') { numPoints = 252; startDate.setFullYear(endDate.getFullYear() - 1); }
         else { startDate.setMonth(endDate.getMonth() - 1); }

         const isYieldIndex = ticker.startsWith('^');
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT' || ticker === 'TIP') ? 95 : ticker === 'SPY' ? 500 : ticker === 'QQQ' ? 400 : 100;
         const volatility = isYieldIndex ? 0.01 : 0.005;
         let currentValue = baseValue;
         const data: { date: string; value: number }[] = [];
         for (let i = 0; i < numPoints; i++) {
             const currentDate = new Date(startDate);
             currentDate.setDate(startDate.getDate() + i);
             // Add simple check for weekend (skip Sat/Sun) for slightly more realism
             if (currentDate.getDay() === 0 || currentDate.getDay() === 6) continue;
             currentValue *= (1 + (Math.random() - 0.48) * volatility);
             data.push({
                 date: currentDate.toISOString().split('T')[0],
                 value: parseFloat(currentValue.toFixed(4))
             });
         }
         return data;
    }
 }

/**
 * Asynchronously retrieves current government bond yields.
 * Enhanced with basic validation and error handling.
 *
 * @returns A promise resolving to an array of GovBondYield objects.
 * @throws {DataProviderError} If the external API calls fail or return no data.
 * @throws {ApiError} For other unexpected errors.
 */
export async function getGovBondYields(): Promise<GovBondYield[]> {
    const operation = 'getGovBondYields';
    console.log(`API Call: ${operation}`);
    simulateError('Failed to fetch bond yields.');

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for ${operation} (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error(`${operation}: Real Financial Data API endpoint or key not configured.`);
            throw new DataProviderError("Financial Data API not configured.");
        }
        try {
            const yieldTickers = [
                { maturity: '5y', ticker: '^FVX' },
                { maturity: '10y', ticker: '^TNX' },
                { maturity: '30y', ticker: '^TYX' },
                // { maturity: '2y', ticker: '^UST2Y' }, // Example - Check availability
                // { maturity: '1y', ticker: '^UST1Y' }, // Example - Check availability
            ];

            const yieldPromises = yieldTickers.map(async ({ maturity, ticker }) => {
                 try {
                    const marketData = await getMarketData(ticker); // Reuse getMarketData
                    if (marketData.price === undefined) return null;
                    return {
                        maturity: maturity,
                        yield: marketData.price,
                        change: marketData.changeValue,
                        timestamp: marketData.timestamp,
                    };
                 } catch (err: any) {
                    // Log individual failures but don't necessarily fail the whole function
                    console.warn(`Failed to fetch yield data for ${ticker} (${maturity}): ${err.message}`);
                    return null;
                 }
            });

            const results = await Promise.all(yieldPromises);
            const validYields = results.filter(y => y !== null) as GovBondYield[];

            if (validYields.length === 0) {
                // Throw error only if *all* attempts failed
                throw new DataProviderError("Could not retrieve any valid yield data from the API.");
            }

            console.log(`${operation}: Fetched ${validYields.length} yield points from REAL API.`);
            const maturityOrder = ['1m', '3m', '6m', '1y', '2y', '5y', '10y', '30y'];
            validYields.sort((a, b) => maturityOrder.indexOf(a.maturity) - maturityOrder.indexOf(b.maturity));

            return validYields;

        } catch (error: any) {
            console.error(`Error in ${operation} from real API:`, error);
            if (error instanceof DataProviderError) throw error;
            throw new ApiError(`Failed to fetch government bond yields: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 400));
        const maturities = ['1m', '3m', '6m', '1y', '2y', '5y', '10y', '30y'];
        const baseYields = [5.1, 5.0, 4.9, 4.7, 4.5, 4.3, 4.4, 4.6];
        const now = new Date();
        return maturities.map((mat, index) => {
            const change = (Math.random() - 0.5) * 0.05;
            return {
                maturity: mat,
                yield: parseFloat((baseYields[index] + Math.random() * 0.1 - 0.05).toFixed(3)),
                change: parseFloat(change.toFixed(4)),
                timestamp: now,
            };
        });
    }
}


// --- Broker API Functions ---

/**
 * Asynchronously submits an order using the Broker API.
 * Enhanced with input validation and specific error handling.
 *
 * @param order The order details to submit.
 * @returns A promise resolving to the submitted Order object, updated with ID and status.
 * @throws {ValidationError} If order details are invalid.
 * @throws {BrokerConnectionError} If the broker API is unavailable or authentication fails.
 * @throws {ComplianceError} If the order violates compliance rules (simulated).
 * @throws {MarketConditionError} If market conditions prevent execution (e.g., halted).
 * @throws {ApiError} For other unexpected broker errors.
 */
export async function submitOrder(order: Order): Promise<Order> {
    const operation = `submitOrder(${order.type} ${order.quantity} ${order.ticker})`;
    console.log(`BROKER API Call: ${operation}`);

    // 1. Input Validation
    try {
        OrderSchema.parse(order); // Validate basic structure and types
        if (order.orderPriceType === 'limit' && order.limitPrice === undefined) {
            throw new ValidationError("Limit price is required for limit orders.");
        }
        // Add more specific validations (e.g., max order size, valid ticker format)
    } catch (e: any) {
        if (e instanceof z.ZodError) {
            throw new ValidationError(`Invalid order details: ${e.errors.map(err => `${err.path.join('.')} ${err.message}`).join(', ')}`);
        }
        throw new ValidationError(`Order validation failed: ${e.message}`, e);
    }

    // 2. Pre-Execution Checks (Simulated - requires real-time data and rules engine)
    try {
        // await checkMarketOpen(order.ticker); // Throws MarketConditionError if closed/halted
        // await checkComplianceRules(order); // Throws ComplianceError if violation
        // await checkRiskLimits(order); // Throws Error if limits exceeded
        // await checkLiquidity(order); // Throws MarketConditionError if insufficient liquidity
    } catch(preCheckError: any) {
        console.error(`${operation}: Pre-execution check failed: ${preCheckError.message}`);
        throw preCheckError; // Re-throw the specific error
    }


    simulateError(`Failed to submit order for ${order.ticker}.`);

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL BROKER API call for ${operation}`);
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error(`${operation}: Real Broker API credentials or endpoint not configured.`);
            throw new BrokerConnectionError("Broker API not configured.");
        }
        try {
             const orderPayload: any = {
                 symbol: order.ticker,
                 qty: order.quantity.toString(),
                 side: order.type,
                 type: order.orderPriceType || 'market',
                 time_in_force: order.time_in_force || 'day',
             };
             if (order.orderPriceType === 'limit' && order.limitPrice !== undefined) {
                 orderPayload.limit_price = order.limitPrice.toString();
             }

             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/orders`, {
                 method: 'POST',
                 headers: {
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify(orderPayload),
             });

             if (!response.ok) {
                 let errorData;
                 try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
                 const errorMessage = errorData.message || response.statusText;
                 // Map broker errors to custom types
                 if (response.status === 401 || response.status === 403) {
                    throw new AuthorizationError(`Broker Authentication Error ${response.status}: ${errorMessage}`);
                 }
                 if (response.status === 422 && errorMessage.includes('market is closed')) {
                     throw new MarketConditionError(`Broker Error ${response.status}: Market is closed.`);
                 }
                 if (response.status === 422 && errorMessage.includes('compliance')) { // Example check
                     throw new ComplianceError(`Broker Compliance Error ${response.status}: ${errorMessage}`);
                 }
                 // General broker error
                 throw new BrokerConnectionError(`Broker API Error ${response.status}: ${errorMessage}`);
             }

             const submittedOrderData = await response.json();
             return {
                 id: submittedOrderData.id,
                 ticker: submittedOrderData.symbol,
                 quantity: parseFloat(submittedOrderData.qty || submittedOrderData.filled_qty || '0'),
                 type: submittedOrderData.side,
                 orderPriceType: submittedOrderData.type,
                 limitPrice: submittedOrderData.limit_price ? parseFloat(submittedOrderData.limit_price) : undefined,
                 status: submittedOrderData.status as Order['status'],
                 createdAt: new Date(submittedOrderData.created_at),
                 updatedAt: new Date(submittedOrderData.updated_at),
                 time_in_force: submittedOrderData.time_in_force,
             };

        } catch (error: any) {
            console.error(`Error in ${operation} with real Broker API:`, error);
            // Re-throw specific errors or wrap unknown errors
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Failed to submit order for ${order.ticker}: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 600));
         return {
            ...order,
            id: `mock_ord_${Date.now()}`,
            status: 'accepted',
            createdAt: new Date(),
            updatedAt: new Date(),
         };
    }
}

/**
 * Asynchronously retrieves the current portfolio positions from the Broker API.
 * Enhanced with specific error handling.
 *
 * @returns A promise that resolves to an array of Position objects.
 * @throws {BrokerConnectionError} If the broker API is unavailable or authentication fails.
 * @throws {ApiError} For other unexpected broker errors.
 */
export async function getPositions(): Promise<Position[]> {
    const operation = 'getPositions';
    console.log(`BROKER API Call: ${operation}`);
    simulateError('Failed to fetch portfolio positions.');

     if (!USE_MOCK_API) {
        console.log('Attempting REAL BROKER API call for getPositions');
         if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
            throw new BrokerConnectionError("Broker API not configured for getPositions."); // Throw specific error
        }
        try {
             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/positions`, {
                 headers: {
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Accept': 'application/json',
                 },
             });
             if (!response.ok) {
                 const errorText = await response.text().catch(() => response.statusText);
                 if (response.status === 401 || response.status === 403) {
                     throw new AuthorizationError(`Broker Authentication Error ${response.status}: ${errorText}`);
                 }
                 throw new BrokerConnectionError(`Broker API Error fetching positions: ${response.status} ${errorText}`);
            }
             const data = await response.json();

             const positions: Position[] = data.map((pos: any) => ({
                 ticker: pos.symbol,
                 quantity: parseFloat(pos.qty),
                 averagePrice: parseFloat(pos.avg_entry_price),
                 current_price: pos.current_price ? parseFloat(pos.current_price) : undefined,
                 market_value: pos.market_value ? parseFloat(pos.market_value) : undefined,
                 unrealized_pnl: pos.unrealized_pl ? parseFloat(pos.unrealized_pl) : undefined,
                 asset_type: pos.asset_class === 'us_equity' ? AssetType.STOCK_INDEX_ETF : AssetType.OTHER,
             }));
             console.log(`${operation}: Fetched ${positions.length} positions from REAL API.`);
             return positions;

        } catch (error: any) {
            console.error(`Error in ${operation} from real Broker API:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Failed to fetch positions: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 450));
         return [
            { ticker: 'GOVT', quantity: 1000, averagePrice: 23.50, current_price: 23.80, market_value: 23800, unrealized_pnl: 300, asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
            { ticker: 'AGG', quantity: 500, averagePrice: 98.20, current_price: 97.50, market_value: 48750, unrealized_pnl: -350, asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
            { ticker: 'TIP', quantity: 200, averagePrice: 108.90, current_price: 109.50, market_value: 21900, unrealized_pnl: 120, asset_type: AssetType.INFLATION_LINKED, country: 'US' },
            { ticker: 'SPY', quantity: 50, averagePrice: 490.00, current_price: 510.00, market_value: 25500, unrealized_pnl: 1000, asset_type: AssetType.STOCK_INDEX_ETF, country: 'US'},
         ];
    }
}

/**
 * Asynchronously retrieves the current account balance from the Broker API.
 * Enhanced with specific error handling.
 *
 * @returns A promise that resolves to an AccountBalance object.
 * @throws {BrokerConnectionError} If the broker API is unavailable or authentication fails.
 * @throws {ApiError} For other unexpected broker errors.
 */
export async function getAccountBalance(): Promise<AccountBalance> {
    const operation = 'getAccountBalance';
    console.log(`BROKER API Call: ${operation}`);
    simulateError('Failed to fetch account balance.');

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL BROKER API call for ${operation}`);
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error(`${operation}: Real Broker API credentials or endpoint not configured.`);
            throw new BrokerConnectionError("Broker API not configured for getAccountBalance.");
        }
        try {
             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/account`, {
                 headers: {
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Accept': 'application/json',
                 },
             });
             if (!response.ok) {
                 const errorText = await response.text().catch(() => response.statusText);
                 if (response.status === 401 || response.status === 403) {
                     throw new AuthorizationError(`Broker Authentication Error ${response.status}: ${errorText}`);
                 }
                 throw new BrokerConnectionError(`Broker API Error fetching account: ${response.status} ${errorText}`);
             }
             const data = await response.json();

             const balance: AccountBalance = {
                 cash: parseFloat(data.cash),
                 currency: data.currency,
                 buying_power: data.buying_power ? parseFloat(data.buying_power) : undefined,
                 portfolio_value: data.portfolio_value ? parseFloat(data.portfolio_value) : undefined,
                 settled_cash: data.non_marginable_buying_power ? parseFloat(data.non_marginable_buying_power) : parseFloat(data.cash), // Fallback
             };
             console.log(`${operation}: Fetched balance from REAL API. Cash: ${balance.cash} ${balance.currency}`);
             return balance;

        } catch (error: any) {
            console.error(`Error in ${operation} from real Broker API:`, error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Failed to fetch account balance: ${error.message}`, error);
        }
    } else {
        console.warn(`${operation}: Using MOCK data.`);
        await new Promise(resolve => setTimeout(resolve, 200));
        return { cash: 1000000.00, currency: 'USD', buying_power: 1500000.00, portfolio_value: 1250000.00, settled_cash: 950000.00 };
    }
}


// --- Functions for Deposit/Transfer/Withdraw (Requires Secure Backend) ---

/**
 * Initiates a deposit request by calling the backend.
 * Enhanced with input validation and specific error handling.
 *
 * @param details Deposit details including amount, method, currency.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {ValidationError} If deposit details are invalid.
 * @throws {ApiError} If the backend API endpoint is not configured or the call fails.
 */
 export async function initiateDeposit(details: DepositDetails): Promise<TransactionStatus> {
    const operation = 'initiateDeposit';
    console.log(`Calling Backend: ${operation}`, details);

    // 1. Input Validation
    try {
        DepositDetailsSchema.parse(details);
        // Add more specific validation if needed (e.g., currency supported)
    } catch (e: any) {
        if (e instanceof z.ZodError) {
            throw new ValidationError(`Invalid deposit details: ${e.errors.map(err => `${err.path.join('.')} ${err.message}`).join(', ')}`);
        }
        throw new ValidationError(`Deposit validation failed: ${e.message}`, e);
    }


    simulateError('Failed to initiate deposit via backend.');

    if (!NEXT_PUBLIC_BACKEND_API_ENDPOINT) {
        console.error(`${operation}: Backend API endpoint not configured (NEXT_PUBLIC_BACKEND_API_ENDPOINT).`);
        throw new ApiError("Backend API endpoint not configured. Cannot process deposits.");
    }

    // if (!USE_MOCK_API) { // Always call backend for deposits regardless of mock setting for other APIs
        console.log(`Attempting REAL backend call for ${operation}`);
        try {
            const response = await fetch(`${NEXT_PUBLIC_BACKEND_API_ENDPOINT}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${getAuthToken()}` // Add real auth
                },
                body: JSON.stringify(details),
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
                const userMessage = `Deposit failed: ${errorData.message || response.statusText}`;
                // Consider mapping backend errors to specific error types (e.g., InsufficientFundsError)
                throw new ApiError(userMessage); // Use general ApiError for backend issues
            }

            const result: TransactionStatus = await response.json();
            console.log(`${operation}: Received response from REAL backend:`, result);
            if (!result.transactionId || !result.status || !result.timestamp) {
                throw new ApiError("Invalid response received from backend deposit endpoint.");
            }
            result.timestamp = new Date(result.timestamp);
            return result;

        } catch (error: any) {
            console.error(`Error calling backend for ${operation}:`, error);
            if (error instanceof ApiError || error instanceof ValidationError) throw error;
            throw new ApiError(`Failed to initiate deposit: ${error.message}`, error);
        }
    // } else {
    //     console.warn(`${operation}: Using MOCK backend response.`);
    //     await new Promise(resolve => setTimeout(resolve, 700));
    //      const randomStatus = Math.random();
    //      let status: TransactionStatus['status'] = 'pending';
    //      let message = 'Deposit request received by mock backend.';
    //      if (randomStatus < 0.1) { status = 'failed'; message = 'Mock backend simulated payment failure.'; }
    //      else if (randomStatus < 0.3) { status = 'requires_action'; message = 'Mock backend requires additional verification.'; }

    //      return {
    //         transactionId: `mock_dep_${Date.now()}`,
    //         status: status,
    //         message: message,
    //         timestamp: new Date(),
    //      };
    // }
}

/**
 * Initiates a transfer request by calling the backend. (Conceptual - Requires Implementation)
 * @param details Transfer details.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {ApiError} If the backend call fails or is not implemented.
 * @throws {ValidationError} If details are invalid.
 */
export async function initiateTransfer(details: TransferDetails): Promise<TransactionStatus> {
    const operation = 'initiateTransfer';
    console.log(`Calling Backend: ${operation}`, details);
    // 1. Add validation using Zod for TransferDetails
    // 2. Implement backend call similar to initiateDeposit
    console.warn(`${operation}: Backend call not implemented. Needs backend endpoint.`);
    throw new ApiError("initiateTransfer requires a backend implementation.");
}

/**
 * Initiates a withdrawal request by calling the backend. (Conceptual - Requires Implementation)
 * @param details Withdraw details.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {ApiError} If the backend call fails or is not implemented.
 * @throws {ValidationError} If details are invalid.
 */
export async function initiateWithdraw(details: WithdrawDetails): Promise<TransactionStatus> {
    const operation = 'initiateWithdraw';
    console.log(`Calling Backend: ${operation}`, details);
    // 1. Add validation using Zod for WithdrawDetails
    // 2. Implement backend call similar to initiateDeposit
    console.warn(`${operation}: Backend call not implemented. Needs backend endpoint.`);
    throw new ApiError("initiateWithdraw requires a backend implementation.");
}

    

    
