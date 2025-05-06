
/**
 * @fileoverview Interacts with brokerage and financial data APIs.
 * This version contains placeholders for real API integration.
 * Actual implementation requires API keys and potentially SDKs for the chosen broker and financial data provider.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Constants ---
// Introduce a small chance of simulated API errors for mock data
const MOCK_API_ERROR_RATE = 0.0; // Set to 0 to disable simulated errors during development

/**
 * Represents a financial instrument.
 */
export interface Instrument {
  /**
   * The ticker symbol of the instrument (e.g., AAPL, GOOGL, US10Y).
   */
  ticker: string;
  /**
   * The name of the company or asset.
   */
  name: string;
  /**
   * Optional: Current price (can be added when fetching movers).
   */
  price?: number;
  /**
   * Optional: Price change percentage (can be added when fetching movers).
   */
  changePercent?: number;
  /**
   * Optional: Asset type, crucial for governmental context.
   */
  asset_type?: AssetType;
  /**
    * Optional: Country of issuance.
    */
  country?: string;
   /**
   * Optional: Maturity date for bonds.
   */
  maturity_date?: Date;
}

/**
 * Represents market data for a financial instrument.
 */
export interface MarketData {
  /**
   * The ticker symbol of the instrument.
   */
  ticker: string;
  /**
   * The current price OR yield of the instrument.
   * For bonds/yields, this might represent the yield percentage.
   */
  price: number; // Can represent price or yield
  /**
   * The timestamp of the market data.
   */
  timestamp: Date;
  /**
   * Optional: Previous closing price/yield.
   */
  previousClose?: number;
   /**
   * Optional: Calculated price/yield change value.
   */
   changeValue?: number;
   /**
    * Optional: Calculated price/yield change percentage.
    */
   changePercent?: number;
   /**
    * Optional: Bid price/yield.
    */
   bid?: number;
   /**
    * Optional: Ask price/yield.
    */
   ask?: number;
   /**
    * Optional: Trading volume.
    */
   volume?: number;
    /**
    * Optional: Yield value (if price represents price).
    */
   yield_value?: number;
   /**
   * Optional: Maturity date for bonds.
   */
   maturity_date?: Date;
    /**
    * Optional: Bond duration.
    */
   duration?: number;
    /**
    * Optional: Bond convexity.
    */
   convexity?: number;

}

/**
 * Represents an order for buying or selling a financial instrument.
 */
export interface Order {
  /**
   * Optional unique ID for the order (assigned by broker).
   */
  id?: string;
  /**
   * The ticker symbol of the instrument.
   */
  ticker: string;
  /**
   * The quantity (shares, contracts, or face value for bonds).
   */
  quantity: number;
  /**
   * The order type (e.g., buy, sell).
   */
  type: 'buy' | 'sell';
  /**
   * The type of order (e.g., market, limit). Defaults to market.
   */
  orderPriceType?: 'market' | 'limit';
   /**
   * The limit price (or yield for some bond orders), if orderPriceType is 'limit'.
   */
  limitPrice?: number;
   /**
   * Optional: Broker identifier if routing is needed.
   */
  broker_id?: string;
  /**
   * The status of the order (e.g., pending, filled, cancelled).
   */
  status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected' | 'accepted' | 'new';
  /**
   * The timestamp when the order was created or submitted.
   */
  createdAt?: Date;
    /**
   * The timestamp when the order was last updated (e.g., filled).
   */
  updatedAt?: Date;
   /**
    * Optional: Identifier for the strategy that generated the order.
    */
  strategy_id?: string;
   /**
    * Time in force for the order (e.g., 'DAY', 'GTC').
    */
   time_in_force?: string;
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
  /**
   * The ticker symbol of the instrument.
   */
  ticker: string;
  /**
   * The quantity held (shares, contracts, face value).
   */
  quantity: number;
  /**
   * The average price/yield at which the position was acquired.
   */
  averagePrice: number; // Can be price or avg yield basis
   /**
   * Optional: Current market price/yield. Added dynamically or from broker.
   */
  current_price?: number;
   /**
    * Optional: Yield value if current_price is price. Added dynamically or from broker.
    */
   yield_value?: number;
   /**
   * Optional: Current market value. Added dynamically or from broker.
   */
  market_value?: number;
   /**
   * Optional: Unrealized profit or loss. Added dynamically or from broker.
   */
  unrealized_pnl?: number;
   /**
   * Optional: Realized profit or loss (from closed portions). Provided by broker.
   */
  realized_pnl?: number;
  /**
   * Optional: Type of the asset.
   */
  asset_type?: AssetType;
  /**
   * Optional: Country of issuance for bonds.
   */
  country?: string;
   /**
   * Optional: Maturity date for bonds.
   */
   maturity_date?: Date;
   /**
    * Optional: Current duration for bonds. Added dynamically or from broker.
    */
   duration?: number;
}

/**
 * Represents details for a deposit transaction (includes common consumer methods).
 */
 export interface DepositDetails {
    amount: number;
    method: 'bank_transfer' | 'card' | 'nequi' | 'daviplata' | 'paypal'; // Updated methods
    currency: string; // e.g., 'USD', 'EUR', 'COP'
    // Payment processor specific details (e.g., token, source ID) would be added by the frontend/backend interaction
    payment_token?: string; // e.g., Stripe token, PayPal order ID
    reference_number?: string; // Optional internal reference
    customer_identifier?: string; // e.g., phone number for Nequi/Daviplata
}


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
// These MUST be set in your environment variables (.env.local or server environment)
const REAL_BROKER_API_KEY = process.env.REAL_BROKER_API_KEY;
const REAL_BROKER_SECRET_KEY = process.env.REAL_BROKER_SECRET_KEY;
const REAL_BROKER_API_ENDPOINT = process.env.REAL_BROKER_API_ENDPOINT; // e.g., https://paper-api.alpaca.markets or https://api.alpaca.markets

const REAL_FINANCIAL_DATA_PROVIDER = process.env.REAL_FINANCIAL_DATA_PROVIDER || 'polygon'; // Example: polygon, alphavantage, etc.
const REAL_FINANCIAL_DATA_API_KEY = process.env.REAL_FINANCIAL_DATA_API_KEY;
const REAL_FINANCIAL_DATA_API_ENDPOINT = process.env.REAL_FINANCIAL_DATA_API_ENDPOINT; // e.g., https://api.polygon.io

// Backend endpoint for secure operations like payments
const NEXT_PUBLIC_BACKEND_API_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT; // e.g., Your Cloud Function URL

// Environment variable to force using mock data (e.g., for development without API keys)
// Set to 'false' in .env.local or environment to attempt real API calls.
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';


// Helper function to simulate potential API errors when using mock data
const simulateError = (message: string): void => {
  if (USE_MOCK_API && Math.random() < MOCK_API_ERROR_RATE) {
    console.warn(`Simulating API Error: ${message}`);
    throw new Error(`Simulated API Error: ${message}`);
  }
};


// --- API Functions ---

// --- Financial Data Functions ---

/**
 * Asynchronously retrieves a list of relevant financial instruments (gov bonds, indices).
 * In a real app, this should fetch from a financial data provider or the broker.
 *
 * @returns A promise that resolves to an array of Instrument objects.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function getInstruments(): Promise<Instrument[]> {
    console.log('API Call: getInstruments');
    simulateError('Failed to fetch instruments list.');

    if (!USE_MOCK_API) {
        console.log("Attempting REAL API call for getInstruments");
        // ** REAL API INTEGRATION POINT (Financial Data Provider or Broker) **
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getInstruments.");
        }
        try {
             // Example using fetch for Polygon.io reference tickers (adjust as needed)
             let apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v3/reference/tickers?active=true&market=stocks&limit=1000&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
              // Add bond/rates specific query params if provider supports it, or make separate calls
             // let bondApiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v3/reference/tickers?active=true&market=indices&type=CS&limit=100&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`; // Example for indices

             const response = await fetch(apiUrl);
             // const bondResponse = await fetch(bondApiUrl);

             if (!response.ok) throw new Error(`API Error fetching stock tickers: ${response.status} ${response.statusText}`);
             // if (!bondResponse.ok) console.warn(`API Error fetching bond tickers: ${bondResponse.status}`);

             const stockData = await response.json();
             // const bondData = bondResponse.ok ? await bondResponse.json() : { results: [] };

             let instruments: Instrument[] = [];

             if (stockData && stockData.results) {
                 instruments = instruments.concat(stockData.results
                    .filter((asset: any) => ['CS', 'ETF'].includes(asset.type) || (asset.ticker?.startsWith('^') || ['SPY', 'QQQ', 'DIA', 'AGG', 'GOVT', 'BND', 'TIP'].includes(asset.ticker)) ) // Filter for relevant indices/ETFs
                    .map((asset: any) => ({
                        ticker: asset.ticker,
                        name: asset.name,
                        asset_type: asset.type === 'ETF' ? AssetType.STOCK_INDEX_ETF : asset.ticker === 'TIP' ? AssetType.INFLATION_LINKED : AssetType.OTHER, // Basic type mapping
                    })));
             }

            // Manually add key treasury yield tickers if not returned by API easily
            const manualYields = [
                 { ticker: '^FVX', name: '5-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
                 { ticker: '^TNX', name: '10-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
                 { ticker: '^TYX', name: '30-Year Treasury Yield', asset_type: AssetType.OTHER, country: 'US' },
             ];
            instruments = instruments.concat(manualYields.filter(my => !instruments.some(i => i.ticker === my.ticker)));

             // TODO: Add logic to fetch actual sovereign bond tickers if needed/possible from provider
             // e.g., Search for CUSIPs or specific bond identifiers

             console.log(`getInstruments: Fetched ${instruments.length} relevant instruments from REAL API.`);
             return instruments;

        } catch (error: any) {
            console.error("Error fetching instruments from real API:", error);
            throw new Error(`Failed to fetch instruments: ${error.message}`);
        }
    } else {
        console.warn("getInstruments: Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.");
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
         // Return a mix of relevant mock instruments
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
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
    console.log(`API Call: getMarketData(${ticker})`);
    simulateError(`Failed to fetch market data for ${ticker}.`);

     if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for getMarketData(${ticker}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getMarketData.");
        }
        try {
             // Example using fetch for Polygon.io (adjust based on provider)
             const isYieldIndex = ticker.startsWith('^');
             let priceField = 'c'; // Default to close price from aggregates if quotes fail
             let priceMultiplier = 1;
             // For Polygon, index values are usually in the 'v' field of snapshot/aggregates
             // if (isYieldIndex) priceField = 'v';

             // 1. Try Snapshot endpoint first for most recent data (includes bid/ask)
             const snapshotUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/snapshot/locale/us/markets/stocks/tickers/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
             // Add equivalent snapshot for indices if provider has one
             // const indexSnapshotUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/snapshot/locale/global/markets/indices/tickers/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;

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
                     if (snapshotData.ticker && snapshotData.ticker.lastTrade) {
                         currentPrice = snapshotData.ticker.lastTrade.p;
                         timestamp = new Date(snapshotData.ticker.lastTrade.t);
                     } else if (snapshotData.ticker && snapshotData.ticker.lastQuote) {
                         // Fallback to quote if no trade data
                         currentPrice = (snapshotData.ticker.lastQuote.bP + snapshotData.ticker.lastQuote.aP) / 2; // Mid-price
                         bid = snapshotData.ticker.lastQuote.bP;
                         ask = snapshotData.ticker.lastQuote.aP;
                         timestamp = new Date(snapshotData.ticker.lastQuote.t);
                     }
                     if (snapshotData.ticker && snapshotData.ticker.day) {
                         volume = snapshotData.ticker.day.v;
                         // Use previous close from snapshot if available
                         previousClose = snapshotData.ticker.prevDay?.c;
                         changeValue = snapshotData.ticker.todaysChange;
                         changePercent = snapshotData.ticker.todaysChangePerc;
                     }
                     timestamp = timestamp || new Date(snapshotData.ticker.updated);

                 }
             } catch (snapError) {
                 console.warn(`Snapshot API failed for ${ticker}, trying aggregates: ${snapError}`);
             }


             // 2. Fallback to Previous Day Close + Daily Change if snapshot failed or incomplete
             if (currentPrice === undefined || previousClose === undefined) {
                 const prevCloseUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
                 const prevCloseResponse = await fetch(prevCloseUrl);
                 if (prevCloseResponse.ok) {
                     const prevCloseData = await prevCloseResponse.json();
                     if (prevCloseData?.results?.length > 0) {
                         const prevAgg = prevCloseData.results[0];
                         if (currentPrice === undefined) { // Only use previous close as current price if snapshot failed completely
                             currentPrice = prevAgg.c;
                             timestamp = new Date(prevAgg.t);
                         }
                         if (previousClose === undefined) {
                             previousClose = prevAgg.c; // Previous close
                         }
                         if (changeValue === undefined && previousClose !== undefined && currentPrice !== undefined) {
                            changeValue = currentPrice - previousClose;
                         }
                          if (changePercent === undefined && previousClose !== undefined && previousClose !== 0 && changeValue !== undefined) {
                             changePercent = (changeValue / previousClose) * 100;
                         }
                         if (volume === undefined) volume = prevAgg.v; // Use previous day volume if no daily available

                     }
                 } else {
                     console.warn(`Failed to get previous close for ${ticker}: ${prevCloseResponse.status}`);
                 }
             }


             if (currentPrice === undefined) {
                 throw new Error(`No current price/value found for ${ticker} after multiple attempts.`);
             }

             // Final formatting
             const price = parseFloat((currentPrice * priceMultiplier).toFixed(4));
             const prevCloseNum = previousClose !== undefined ? parseFloat((previousClose * priceMultiplier).toFixed(4)) : undefined;
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
            console.error(`Error fetching market data for ${ticker} from real API:`, error);
            throw new Error(`Failed to fetch market data for ${ticker}: ${error.message}`);
        }
    } else {
        console.warn(`getMarketData(${ticker}): Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.`);
        await new Promise(resolve => setTimeout(resolve, 150));
         const isYieldIndex = ticker.startsWith('^');
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT' || ticker === 'TIP') ? 95 : ticker === 'SPY' ? 500 : ticker === 'QQQ' ? 400 : 100;
         const prevClose = baseValue + (Math.random() - 0.5) * (isYieldIndex ? 0.1 : baseValue * 0.01); // 1% volatility
         const currentPrice = prevClose + (Math.random() - 0.5) * (isYieldIndex ? 0.05 : baseValue * 0.005); // 0.5% volatility
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
 *
 * @param ticker The ticker symbol.
 * @param range The time range ('1m', '6m', '1y').
 * @returns A promise resolving to an array of historical data points.
 * @throws {Error} If the API call fails or is not implemented.
 */
 export async function getHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
    console.log(`API Call: getHistoricalData(${ticker}, ${range})`);
    simulateError(`Failed to fetch historical data for ${ticker}.`);

     if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for getHistoricalData(${ticker}, ${range}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
         if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getHistoricalData.");
        }
        try {
             const endDate = new Date();
             const startDate = new Date();
             let multiplier = 1;
             let timespan = 'day';
             let limit = 5000; // Polygon limit
             switch (range) {
                 case '1m': startDate.setMonth(endDate.getMonth() - 1); limit = 31; break;
                 case '6m': startDate.setMonth(endDate.getMonth() - 6); limit = 180; break;
                 case '1y': startDate.setFullYear(endDate.getFullYear() - 1); limit = 366; break;
                 default: throw new Error("Invalid range specified");
             }
             const formatAPIDate = (date: Date) => date.toISOString().split('T')[0];
             let apiUrl = '';
             const isYieldIndex = ticker.startsWith('^');
             let valueField = 'c'; // Closing price/value

             // Use Polygon.io Aggregates (Bars) endpoint
             apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${formatAPIDate(startDate)}/${formatAPIDate(endDate)}?adjusted=true&sort=asc&limit=${limit}&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;

             const response = await fetch(apiUrl);
             if (!response.ok) {
                 let errorBody = '';
                 try { errorBody = await response.text(); } catch {}
                 throw new Error(`API Error fetching historical data: ${response.status} ${response.statusText} - ${errorBody}`);
            }
             const data = await response.json();

             if (!data.results || data.results.length === 0) {
                 console.warn(`No historical results found for ${ticker} in the specified range.`);
                 return []; // Return empty array if no data
                // throw new Error(`No results found for ${ticker} in historical data.`);
             }

             return data.results.map((bar: any) => ({
                 date: new Date(bar.t).toISOString().split('T')[0], // Ensure date is YYYY-MM-DD
                 value: parseFloat(bar[valueField]),
             }));

        } catch (error: any) {
            console.error(`Error fetching historical data for ${ticker} from real API:`, error);
            throw new Error(`Failed to fetch historical data for ${ticker}: ${error.message}`);
        }
    } else {
        console.warn(`getHistoricalData(${ticker}, ${range}): Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.`);
        await new Promise(resolve => setTimeout(resolve, 500));
         const endDate = new Date();
         const startDate = new Date();
         let numPoints = 30; // Approx for 1m
         if (range === '6m') { numPoints = 126; startDate.setMonth(endDate.getMonth() - 6); }
         else if (range === '1y') { numPoints = 252; startDate.setFullYear(endDate.getFullYear() - 1); }
         else { startDate.setMonth(endDate.getMonth() - 1); }

         const isYieldIndex = ticker.startsWith('^');
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT' || ticker === 'TIP') ? 95 : ticker === 'SPY' ? 500 : ticker === 'QQQ' ? 400 : 100;
         const volatility = isYieldIndex ? 0.01 : 0.005; // % daily volatility
         let currentValue = baseValue;
         const data: { date: string; value: number }[] = [];
         for (let i = 0; i < numPoints; i++) {
             const currentDate = new Date(startDate);
             currentDate.setDate(startDate.getDate() + i); // Simple linear date progression
             currentValue *= (1 + (Math.random() - 0.48) * volatility); // Simulate daily change %
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
 * Specific implementation depends heavily on the data provider.
 *
 * @returns A promise resolving to an array of GovBondYield objects.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function getGovBondYields(): Promise<GovBondYield[]> {
    console.log(`API Call: getGovBondYields`);
    simulateError('Failed to fetch bond yields.');

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL API call for getGovBondYields (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getGovBondYields.");
        }
        try {
            // ** REAL API INTEGRATION POINT **
            // This is tricky with free APIs. Polygon doesn't have a dedicated yield curve endpoint.
            // Often, you need to fetch individual bond futures or specific CBOE index tickers.
            // Example using known index tickers (limited coverage):
            const yieldTickers = [
                // Common CBOE Treasury Yield Indices
                { maturity: '5y', ticker: '^FVX' },
                { maturity: '10y', ticker: '^TNX' },
                { maturity: '30y', ticker: '^TYX' },
                // Other potential sources (might require different API calls or may not work)
                 { maturity: '2y', ticker: '^UST2Y' }, // Example, check provider
                 { maturity: '1y', ticker: '^UST1Y' }, // Example, check provider
            ];

            const yieldPromises = yieldTickers.map(async ({ maturity, ticker }) => {
                 try {
                    const marketData = await getMarketData(ticker); // Reuse getMarketData
                     if (marketData.price === undefined) return null; // Skip if price (yield) is missing
                    return {
                        maturity: maturity,
                        yield: marketData.price, // Assuming price holds the yield value
                        change: marketData.changeValue, // Assuming changeValue is the absolute change in yield % points
                        timestamp: marketData.timestamp,
                    };
                 } catch (err) {
                    console.warn(`Failed to fetch yield data for ${ticker} (${maturity}):`, err);
                    return null; // Return null if fetching fails for a specific maturity
                 }
            });

            const results = await Promise.all(yieldPromises);
            const validYields = results.filter(y => y !== null) as GovBondYield[];

            if (validYields.length === 0) {
                throw new Error("Could not retrieve any valid yield data from the API.");
            }

            console.log(`getGovBondYields: Fetched ${validYields.length} yield points from REAL API.`);
             // Sort by typical maturity order if needed
            const maturityOrder = ['1m', '3m', '6m', '1y', '2y', '5y', '10y', '30y'];
            validYields.sort((a, b) => maturityOrder.indexOf(a.maturity) - maturityOrder.indexOf(b.maturity));

            return validYields;

        } catch (error: any) {
            console.error(`Error fetching government bond yields from real API:`, error);
            throw new Error(`Failed to fetch government bond yields: ${error.message}`);
        }
    } else {
        console.warn("getGovBondYields: Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.");
        await new Promise(resolve => setTimeout(resolve, 400));
        // Simulate a typical yield curve
        const maturities = ['1m', '3m', '6m', '1y', '2y', '5y', '10y', '30y'];
        const baseYields = [5.1, 5.0, 4.9, 4.7, 4.5, 4.3, 4.4, 4.6]; // Example inverted/flat curve
        const now = new Date();
        return maturities.map((mat, index) => {
            const change = (Math.random() - 0.5) * 0.05; // Random change up to +/- 5 bps
            return {
                maturity: mat,
                yield: parseFloat((baseYields[index] + Math.random() * 0.1 - 0.05).toFixed(3)),
                change: parseFloat(change.toFixed(4)),
                timestamp: now,
            };
        });
    }
}


// Removed getTopMovers as it's less relevant for gov trading focus


// --- Broker API Functions ---

/**
 * Asynchronously submits an order using the Broker API.
 *
 * @param order The order details to submit.
 * @returns A promise resolving to the submitted Order object, updated with ID and status.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function submitOrder(order: Order): Promise<Order> {
    console.log(`BROKER API Call: submitOrder(${order.type} ${order.quantity} ${order.ticker})`);
    simulateError(`Failed to submit order for ${order.ticker}.`);

    if (!USE_MOCK_API) {
        console.log(`Attempting REAL BROKER API call for submitOrder(${order.ticker})`);
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
            throw new Error("Broker API not configured for submitOrder.");
        }
        try {
             // Example using fetch (replace with Broker SDK call - e.g., Alpaca)
             const orderPayload: any = {
                 symbol: order.ticker,
                 // Alpaca API uses 'qty' for share quantity, 'notional' for dollar amount
                 // Decide which one to use based on your strategy or order type
                 qty: order.quantity.toString(), // Assuming quantity represents shares/contracts
                 // notional: (order.type === 'buy' && order.orderPriceType === 'market') ? (order.quantity * estimatedPrice).toString() : undefined, // Example for notional buy
                 side: order.type,
                 type: order.orderPriceType || 'market',
                 time_in_force: order.time_in_force || 'day',
             };
             if (order.orderPriceType === 'limit' && order.limitPrice !== undefined) {
                 orderPayload.limit_price = order.limitPrice.toString();
             }
             // Add other broker-specific fields if needed (e.g., client_order_id)

             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/orders`, {
                 method: 'POST',
                 headers: {
                     // Replace with your Broker's specific authentication (e.g., Alpaca)
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Content-Type': 'application/json',
                 },
                 body: JSON.stringify(orderPayload),
             });

             if (!response.ok) {
                 let errorData;
                 try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
                 throw new Error(`Broker API Error ${response.status}: ${errorData.message || response.statusText}`);
             }

             const submittedOrderData = await response.json();
             // Map response back to Order interface (adjust fields based on broker response)
             return {
                 id: submittedOrderData.id,
                 ticker: submittedOrderData.symbol,
                 quantity: parseFloat(submittedOrderData.qty || submittedOrderData.filled_qty || '0'), // Use qty or filled_qty
                 type: submittedOrderData.side,
                 orderPriceType: submittedOrderData.type,
                 limitPrice: submittedOrderData.limit_price ? parseFloat(submittedOrderData.limit_price) : undefined,
                 status: submittedOrderData.status as Order['status'], // Cast to known statuses
                 createdAt: new Date(submittedOrderData.created_at),
                 updatedAt: new Date(submittedOrderData.updated_at),
                 time_in_force: submittedOrderData.time_in_force,
             };

        } catch (error: any) {
            console.error(`Error submitting order for ${order.ticker} to real Broker API:`, error);
            throw new Error(`Failed to submit order for ${order.ticker}: ${error.message}`);
        }
    } else {
        console.warn(`submitOrder(${order.ticker}): Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real action.`);
        await new Promise(resolve => setTimeout(resolve, 600));
         // Simulate order acceptance
         return {
            ...order,
            id: `mock_ord_${Date.now()}`,
            status: 'accepted', // Simulate acceptance, not immediate fill
            createdAt: new Date(),
            updatedAt: new Date(),
         };
    }
}

/**
 * Asynchronously retrieves the current portfolio positions from the Broker API.
 *
 * @returns A promise that resolves to an array of Position objects.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function getPositions(): Promise<Position[]> {
    console.log('BROKER API Call: getPositions');
    simulateError('Failed to fetch portfolio positions.');

     if (!USE_MOCK_API) {
        console.log('Attempting REAL BROKER API call for getPositions');
         if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
            throw new Error("Broker API not configured for getPositions.");
        }
        try {
             // Example using fetch (replace with Broker SDK call)
             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/positions`, {
                 headers: {
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Accept': 'application/json',
                 },
             });
             if (!response.ok) throw new Error(`Broker API Error fetching positions: ${response.status} ${response.statusText}`);
             const data = await response.json();

             // Map the response data to the Position[] interface (adjust fields based on broker)
             const positions: Position[] = data.map((pos: any) => ({
                 ticker: pos.symbol,
                 quantity: parseFloat(pos.qty), // Use parseFloat for safety
                 averagePrice: parseFloat(pos.avg_entry_price), // Can be price or yield basis
                 current_price: parseFloat(pos.current_price), // Broker often provides this
                 market_value: parseFloat(pos.market_value),
                 unrealized_pnl: parseFloat(pos.unrealized_pl),
                 // Infer asset type based on ticker or other data if available from broker
                 asset_type: pos.asset_class === 'us_equity' ? AssetType.STOCK_INDEX_ETF : AssetType.OTHER, // Example mapping
                 // Add country, maturity, etc. if provided by broker position data
             }));
             console.log(`getPositions: Fetched ${positions.length} positions from REAL API.`);
             return positions;

        } catch (error: any) {
            console.error("Error fetching positions from real Broker API:", error);
            throw new Error(`Failed to fetch positions: ${error.message}`);
        }
    } else {
        console.warn("getPositions: Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.");
        await new Promise(resolve => setTimeout(resolve, 450));
         // Simulate some government bond / ETF positions
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
 *
 * @returns A promise that resolves to an AccountBalance object.
 * @throws {Error} If the API call fails or is not implemented.
 */
export async function getAccountBalance(): Promise<AccountBalance> {
    console.log('BROKER API Call: getAccountBalance');
    simulateError('Failed to fetch account balance.');

    if (!USE_MOCK_API) {
        console.log('Attempting REAL BROKER API call for getAccountBalance');
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
            throw new Error("Broker API not configured for getAccountBalance.");
        }
        try {
             // Example using fetch (replace with Broker SDK call)
             const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/account`, {
                 headers: {
                     'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
                     'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
                     'Accept': 'application/json',
                 },
             });
             if (!response.ok) throw new Error(`Broker API Error fetching account: ${response.status} ${response.statusText}`);
             const data = await response.json();

             // Map response to AccountBalance interface (adjust fields based on broker)
             const balance: AccountBalance = {
                 cash: parseFloat(data.cash),
                 currency: data.currency,
                 buying_power: parseFloat(data.buying_power),
                 portfolio_value: parseFloat(data.portfolio_value),
                 // Alpaca: non_marginable_buying_power often represents settled cash for cash accounts
                 settled_cash: parseFloat(data.non_marginable_buying_power || data.cash), // Fallback to cash
             };
             console.log(`getAccountBalance: Fetched balance from REAL API. Cash: ${balance.cash} ${balance.currency}`);
             return balance;

        } catch (error: any) {
            console.error("Error fetching account balance from real Broker API:", error);
            throw new Error(`Failed to fetch account balance: ${error.message}`);
        }
    } else {
        console.warn("getAccountBalance: Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.");
        await new Promise(resolve => setTimeout(resolve, 200));
        return { cash: 1000000.00, currency: 'USD', buying_power: 1500000.00, portfolio_value: 1250000.00, settled_cash: 950000.00 }; // Mock institutional balance
    }
}


// --- Functions for Deposit/Transfer/Withdraw (Requires Secure Backend) ---

/**
 * Initiates a deposit request by calling the backend.
 * This function DOES NOT handle payment processing directly. It communicates
 * with a secure backend endpoint which integrates with the payment processor.
 *
 * @param details Deposit details including amount, method, currency. Frontend might add a payment token if required (e.g., from Stripe Elements).
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {Error} If the backend call fails or backend endpoint is not configured.
 */
 export async function initiateDeposit(details: DepositDetails): Promise<TransactionStatus> {
    console.log('Calling Backend: initiateDeposit', details);
    simulateError('Failed to initiate deposit via backend.');

    if (!NEXT_PUBLIC_BACKEND_API_ENDPOINT) {
        console.error("Backend API endpoint not configured (NEXT_PUBLIC_BACKEND_API_ENDPOINT).");
        throw new Error("Backend API endpoint not configured. Cannot process deposits.");
    }

    if (!USE_MOCK_API) {
        console.log("Attempting REAL backend call for initiateDeposit");
        try {
            // ** REAL BACKEND INTEGRATION POINT **
            // The backend endpoint '/deposit' must handle:
            // 1. Receiving the deposit details (amount, method, currency, potentially payment_token).
            // 2. Securely interacting with the chosen payment processor API (Stripe, PayPal, Nequi, etc.).
            // 3. Creating a charge, processing the payment, handling webhooks.
            // 4. If payment is successful, securely crediting the user's account balance (e.g., via Broker API or internal ledger).
            // 5. Returning a TransactionStatus object.
            const response = await fetch(`${NEXT_PUBLIC_BACKEND_API_ENDPOINT}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers (e.g., Authorization: Bearer <token>)
                    // 'Authorization': `Bearer ${getAuthToken()}` // Implement getAuthToken from your auth provider
                },
                body: JSON.stringify(details),
            });

            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
                // Provide a more user-friendly error based on status
                 let userMessage = `Deposit failed: ${errorData.message || response.statusText}`;
                 if (response.status === 400) userMessage = `Deposit failed: Invalid input. ${errorData.message || ''}`;
                 if (response.status === 402) userMessage = `Deposit failed: Payment declined. ${errorData.message || ''}`;
                 if (response.status === 500) userMessage = `Deposit failed: Server error. Please try again later.`;
                throw new Error(userMessage);
            }

            const result: TransactionStatus = await response.json();
            console.log("initiateDeposit: Received response from REAL backend:", result);
            // Ensure the backend returns a valid TransactionStatus object
            if (!result.transactionId || !result.status || !result.timestamp) {
                throw new Error("Invalid response received from backend deposit endpoint.");
            }
            result.timestamp = new Date(result.timestamp); // Ensure timestamp is a Date object
            return result;

        } catch (error: any) {
            console.error("Error calling backend for initiateDeposit:", error);
            // Re-throw the potentially user-friendly error from the try block
            throw new Error(`Failed to initiate deposit: ${error.message}`);
        }
    } else {
        console.warn("initiateDeposit: Using MOCK backend response. Set NEXT_PUBLIC_USE_MOCK_API=false for real calls.");
        await new Promise(resolve => setTimeout(resolve, 700));
         // Simulate backend processing - return a realistic status
         const randomStatus = Math.random();
         let status: TransactionStatus['status'] = 'pending';
         let message = 'Deposit request received by mock backend. Awaiting processing.';
         if (randomStatus < 0.1) {
             status = 'failed';
             message = 'Mock backend simulated payment failure.';
         } else if (randomStatus < 0.3) {
            status = 'requires_action';
            message = 'Mock backend requires additional verification (e.g., 3D Secure).';
         }
         // No 'completed' status here, as deposits often take time.
         // The backend would typically update the status via webhook or polling.

         return {
            transactionId: `mock_dep_${Date.now()}`,
            status: status,
            message: message,
            timestamp: new Date(),
         };
    }
}


/**
 * Initiates a transfer request by calling the backend. (Conceptual)
 * @param details Transfer details.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {Error} If the backend call fails or is not implemented.
 */
export async function initiateTransfer(details: TransferDetails): Promise<TransactionStatus> {
    console.log('Calling Backend: initiateTransfer', details);
     // Similar implementation to initiateDeposit, calling a '/transfer' backend endpoint
     // Requires backend logic for moving funds between accounts or initiating external transfers.
    console.warn("initiateTransfer: Backend call not implemented. Needs backend endpoint.");
    throw new Error("initiateTransfer requires a backend implementation.");
}

/**
 * Initiates a withdrawal request by calling the backend. (Conceptual)
 * @param details Withdraw details.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {Error} If the backend call fails or is not implemented.
 */
export async function initiateWithdraw(details: WithdrawDetails): Promise<TransactionStatus> {
    console.log('Calling Backend: initiateWithdraw', details);
     // Similar implementation to initiateDeposit, calling a '/withdraw' backend endpoint
     // Requires backend logic for verifying funds and initiating payout via Broker API or payment processor.
    console.warn("initiateWithdraw: Backend call not implemented. Needs backend endpoint.");
    throw new Error("initiateWithdraw requires a backend implementation.");
}


// --- Other Potential Functions ---
// - getOrderStatus(orderId)
// - cancelOrder(orderId)
// - getAccountActivity()
// - getBondDetails(cusipOrSymbol)
// - getEconomicCalendar()
