
/**
 * @fileoverview Interacts with brokerage and financial data APIs.
 * This version contains placeholders for real API integration.
 * Actual implementation requires API keys and potentially SDKs for the chosen broker and financial data provider.
 */

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
   * Optional: Current market price/yield. Added dynamically.
   */
  current_price?: number;
   /**
   * Optional: Current market value. Added dynamically.
   */
  market_value?: number;
   /**
   * Optional: Unrealized profit or loss. Added dynamically.
   */
  unrealized_pnl?: number;
   /**
   * Optional: Realized profit or loss (from closed portions).
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
    * Optional: Current duration for bonds. Added dynamically.
    */
   duration?: number;
   /**
    * Optional: Current yield for bonds. Added dynamically.
    */
   yield_value?: number;
}

/**
 * Represents details for a deposit transaction (institutional context).
 */
export interface DepositDetails {
    amount: number;
    method: 'wire_transfer' | 'ach' | 'internal_transfer' | 'other'; // Institutional methods
    currency: string; // e.g., 'USD', 'EUR'
    originating_account_id?: string; // Identifier for source account
    reference_number?: string; // Transaction reference
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
    transactionId: string;
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


// --- Real API Configuration (Placeholders) ---
const REAL_BROKER_API_KEY = process.env.REAL_BROKER_API_KEY;
const REAL_BROKER_SECRET_KEY = process.env.REAL_BROKER_SECRET_KEY;
const REAL_BROKER_API_ENDPOINT = process.env.REAL_BROKER_API_ENDPOINT;

const REAL_FINANCIAL_DATA_PROVIDER = process.env.REAL_FINANCIAL_DATA_PROVIDER || 'polygon';
const REAL_FINANCIAL_DATA_API_KEY = process.env.REAL_FINANCIAL_DATA_API_KEY;
const REAL_FINANCIAL_DATA_API_ENDPOINT = process.env.REAL_FINANCIAL_DATA_API_ENDPOINT;

// Environment variable to disable simulated errors for testing real integration
const DISABLE_SIMULATED_ERRORS = process.env.NEXT_PUBLIC_USE_MOCK_API === 'false';


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
    if (DISABLE_SIMULATED_ERRORS) {
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
                    .filter((asset: any) => ['CS', 'ETF'].includes(asset.type) || (asset.ticker?.startsWith('^') || ['SPY', 'QQQ', 'DIA', 'AGG'].includes(asset.ticker)) ) // Filter for relevant indices/ETFs
                    .map((asset: any) => ({
                        ticker: asset.ticker,
                        name: asset.name,
                        asset_type: asset.type === 'ETF' ? AssetType.STOCK_INDEX_ETF : AssetType.OTHER, // Basic type mapping
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
             // Add more mock examples if needed
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

     if (DISABLE_SIMULATED_ERRORS) {
        console.log(`Attempting REAL API call for getMarketData(${ticker}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getMarketData.");
        }
        try {
             // Example using fetch for Polygon.io (adjust based on provider)
             const isYieldIndex = ticker.startsWith('^');
             let priceField = 'p'; // Price for stocks/ETFs
             let priceMultiplier = 1;
             if (isYieldIndex) {
                 priceField = 'v'; // Use 'v' (value) for indices which often represent yields/rates
                 priceMultiplier = 1; // Yields are usually direct percentages
             }

             // Use v3 quotes for broader coverage, fallback to v2 trades or prev close if needed
             const quoteUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v3/quotes/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
             const prevCloseUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;

             const [quoteResponse, prevCloseResponse] = await Promise.all([fetch(quoteUrl), fetch(prevCloseUrl)]);

             let currentPrice: number | undefined;
             let bid: number | undefined;
             let ask: number | undefined;
             let timestamp: Date | undefined;

             if (quoteResponse.ok) {
                 const quoteData = await quoteResponse.json();
                 if (quoteData.results && quoteData.results.length > 0) {
                     const quote = quoteData.results[0];
                     // Polygon v3 quotes use 'p' (trade price), 'bp' (bid price), 'ap' (ask price), 't' (timestamp)
                     currentPrice = quote.p ?? quote.bp; // Use trade price, fallback to bid
                     bid = quote.bp;
                     ask = quote.ap;
                     timestamp = quote.t ? new Date(quote.t) : new Date();
                 }
             }

              if (currentPrice === undefined) {
                  // Fallback: Try v2 last trade if v3 quote failed or lacked price
                  const tradeUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/last/trade/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
                  const tradeResponse = await fetch(tradeUrl);
                  if (tradeResponse.ok) {
                      const tradeData = await tradeResponse.json();
                      if (tradeData.results && tradeData.results.p) {
                          currentPrice = tradeData.results.p;
                          timestamp = tradeData.results.t ? new Date(tradeData.results.t) : new Date();
                      }
                  }
              }

             if (currentPrice === undefined) {
                 throw new Error(`No current price/value found for ${ticker}`);
             }

             let previousClose: number | undefined;
             if (prevCloseResponse.ok) {
                 const prevCloseData = await prevCloseResponse.json();
                 if (prevCloseData?.results?.length > 0) {
                     previousClose = prevCloseData.results[0].c; // Closing price
                     if (isYieldIndex) {
                        previousClose = previousClose; // Adjust if API returns yield differently for previous close
                     }
                 }
             } else {
                 console.warn(`Failed to get previous close for ${ticker}: ${prevCloseResponse.status}`);
             }

             const price = parseFloat((currentPrice * priceMultiplier).toFixed(4));
             const prevCloseNum = previousClose !== undefined ? parseFloat((previousClose * priceMultiplier).toFixed(4)) : undefined;
             const changeValue = (prevCloseNum !== undefined) ? price - prevCloseNum : undefined;
             const changePercent = (prevCloseNum !== undefined && prevCloseNum !== 0 && changeValue !== undefined) ? (changeValue / prevCloseNum) * 100 : undefined;

             return {
                 ticker: ticker,
                 price: price,
                 timestamp: timestamp || new Date(),
                 previousClose: prevCloseNum,
                 changeValue: changeValue !== undefined ? parseFloat(changeValue.toFixed(4)) : undefined,
                 changePercent: changePercent !== undefined ? parseFloat(changePercent.toFixed(2)) : undefined,
                 bid: bid,
                 ask: ask,
                 // Volume might need another API call for indices/bonds depending on provider
             };

        } catch (error: any) {
            console.error(`Error fetching market data for ${ticker} from real API:`, error);
            throw new Error(`Failed to fetch market data for ${ticker}: ${error.message}`);
        }
    } else {
        console.warn(`getMarketData(${ticker}): Using MOCK data. Set NEXT_PUBLIC_USE_MOCK_API=false in .env for real data.`);
        await new Promise(resolve => setTimeout(resolve, 150));
         const isYieldIndex = ticker.startsWith('^');
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT') ? 95 : 100;
         const prevClose = baseValue + (Math.random() - 0.5) * (isYieldIndex ? 0.1 : 1);
         const currentPrice = prevClose + (Math.random() - 0.5) * (isYieldIndex ? 0.05 : 0.5);
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

     if (DISABLE_SIMULATED_ERRORS) {
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
             switch (range) {
                 case '1m': startDate.setMonth(endDate.getMonth() - 1); break;
                 case '6m': startDate.setMonth(endDate.getMonth() - 6); break;
                 case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
                 default: throw new Error("Invalid range specified");
             }
             const formatAPIDate = (date: Date) => date.toISOString().split('T')[0];
             let apiUrl = '';
             const isYieldIndex = ticker.startsWith('^');
             let valueField = 'c'; // Closing price for stocks/ETFs

             // Use Polygon.io Aggregates (Bars) endpoint
             apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${formatAPIDate(startDate)}/${formatAPIDate(endDate)}?adjusted=true&sort=asc&limit=5000&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
             // For indices (yields), the 'c' (close) value often represents the yield/rate value directly

             const response = await fetch(apiUrl);
             if (!response.ok) throw new Error(`API Error fetching historical data: ${response.status} ${response.statusText}`);
             const data = await response.json();

             if (!data.results) throw new Error(`No results found for ${ticker} in historical data.`);

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
         const baseValue = isYieldIndex ? 3.5 : (ticker === 'AGG' || ticker === 'BND' || ticker === 'GOVT') ? 95 : 100;
         const volatility = isYieldIndex ? 0.01 : 0.2;
         let currentValue = baseValue;
         const data: { date: string; value: number }[] = [];
         for (let i = 0; i < numPoints; i++) {
             const currentDate = new Date(startDate);
             currentDate.setDate(startDate.getDate() + i); // Simple linear date progression
             currentValue += (Math.random() - 0.48) * volatility; // Simulate daily change
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

    if (DISABLE_SIMULATED_ERRORS) {
        console.log(`Attempting REAL API call for getGovBondYields (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
            console.error("Real Financial Data API endpoint or key not configured in .env");
            throw new Error("Financial Data API not configured for getGovBondYields.");
        }
        try {
            // ** REAL API INTEGRATION POINT **
            // Example: Fetching multiple treasury yields using getMarketData in parallel
            const yieldTickers = [
                // US Treasury Yields (often represented by indices)
                { maturity: '1m', ticker: '^IRX' }, // 13 Week Treasury Bill (^IRX is often used, but verify with provider) - Or use a direct API if available
                { maturity: '3m', ticker: '^IRX' }, // Placeholder - needs specific ticker or API endpoint
                { maturity: '6m', ticker: '^FVX' }, // Placeholder - ^FVX is 5Y, need 6M
                { maturity: '1y', ticker: '^FVX' }, // Placeholder - ^FVX is 5Y, need 1Y
                { maturity: '2y', ticker: '^TNX' }, // Placeholder - ^TNX is 10Y, need 2Y
                { maturity: '5y', ticker: '^FVX' },
                { maturity: '10y', ticker: '^TNX' },
                { maturity: '30y', ticker: '^TYX' },
            ];

             // Note: Free APIs might not provide all maturities easily via simple tickers.
             // A dedicated bond yield API endpoint might be required from the provider.
             // This implementation attempts to use getMarketData, which might only work for ^FVX, ^TNX, ^TYX.

            const yieldPromises = yieldTickers.map(async ({ maturity, ticker }) => {
                 try {
                    // Fetch current and previous close data for the yield ticker
                    const marketData = await getMarketData(ticker);
                    return {
                        maturity: maturity,
                        yield: marketData.price, // Assuming price holds the yield value for these indices
                        change: marketData.changeValue, // Assuming changeValue is the absolute change in yield % points
                        timestamp: marketData.timestamp,
                    };
                 } catch (err) {
                    console.warn(`Failed to fetch yield data for ${ticker} (${maturity}):`, err);
                    return null; // Return null if fetching fails for a specific maturity
                 }
            });

            const results = await Promise.all(yieldPromises);
            const validYields = results.filter(y => y !== null && y.yield !== undefined) as GovBondYield[];

            if (validYields.length === 0) {
                throw new Error("Could not retrieve any valid yield data from the API.");
            }
            // Crude deduplication if multiple maturities map to the same ticker
            const finalYields: GovBondYield[] = [];
            const seenTickers = new Set<string>();
            validYields.forEach(y => {
                const ticker = yieldTickers.find(t => t.maturity === y.maturity)?.ticker;
                if (ticker && !seenTickers.has(ticker)) {
                    finalYields.push(y);
                    seenTickers.add(ticker);
                } else if (!ticker) {
                    finalYields.push(y); // Add if no ticker mapping found (shouldn't happen)
                }
            });


            console.log(`getGovBondYields: Fetched ${finalYields.length} yield points from REAL API.`);
             // Sort by typical maturity order if needed
            const maturityOrder = ['1m', '3m', '6m', '1y', '2y', '5y', '10y', '30y'];
            finalYields.sort((a, b) => maturityOrder.indexOf(a.maturity) - maturityOrder.indexOf(b.maturity));

            return finalYields;

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

    if (DISABLE_SIMULATED_ERRORS) {
        console.log(`Attempting REAL BROKER API call for submitOrder(${order.ticker})`);
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
            throw new Error("Broker API not configured for submitOrder.");
        }
        try {
             // Example using fetch (replace with Broker SDK call - e.g., Alpaca)
             const orderPayload: any = {
                 symbol: order.ticker,
                 qty: order.quantity.toString(), // Qty usually as string for precision/large numbers
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
                 quantity: parseFloat(submittedOrderData.qty) || parseFloat(submittedOrderData.filled_qty || '0'),
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

     if (DISABLE_SIMULATED_ERRORS) {
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
            { ticker: 'GOVT', quantity: 1000, averagePrice: 23.50, asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
            { ticker: 'AGG', quantity: 500, averagePrice: 98.20, asset_type: AssetType.STOCK_INDEX_ETF, country: 'US' },
            { ticker: 'TIP', quantity: 200, averagePrice: 108.90, asset_type: AssetType.INFLATION_LINKED, country: 'US' }, // Inflation-linked bond ETF
            // { ticker: 'US10Y-FAKE', quantity: 100000, averagePrice: 4.5, asset_type: AssetType.SOVEREIGN_BOND, country: 'US', maturity_date: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000) }, // Example direct bond
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

    if (DISABLE_SIMULATED_ERRORS) {
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
                 settled_cash: parseFloat(data.non_marginable_buying_power), // Example mapping, check broker docs
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
 * @param details Deposit details.
 * @returns A promise resolving to the transaction status from the backend.
 * @throws {Error} If the backend call fails.
 */
export async function initiateDeposit(details: DepositDetails): Promise<TransactionStatus> {
    console.log('Calling Backend: initiateDeposit', details);

    if (DISABLE_SIMULATED_ERRORS) {
        console.log("Attempting REAL backend call for initiateDeposit");
        // ** REAL BACKEND INTEGRATION POINT **
        // Replace with your actual backend API endpoint (e.g., a Cloud Function URL)
        const BACKEND_API_ENDPOINT = process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT;
        if (!BACKEND_API_ENDPOINT) {
            throw new Error("Backend API endpoint not configured (NEXT_PUBLIC_BACKEND_API_ENDPOINT).");
        }
        try {
            const response = await fetch(`${BACKEND_API_ENDPOINT}/deposit`, { // Your backend endpoint
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers (e.g., Authorization: Bearer <token>)
                    // 'Authorization': `Bearer ${getAuthToken()}` // Implement getAuthToken
                },
                body: JSON.stringify(details),
            });
            if (!response.ok) {
                let errorData;
                try { errorData = await response.json(); } catch { errorData = { message: response.statusText }; }
                throw new Error(`Backend Deposit Error: ${response.status} ${errorData.message || response.statusText}`);
            }
            const result: TransactionStatus = await response.json();
             console.log("initiateDeposit: Received response from REAL backend:", result);
            return result;
        } catch (error: any) {
            console.error("Error calling backend for initiateDeposit:", error);
            throw new Error(`Failed to initiate deposit via backend: ${error.message}`);
        }
    } else {
        console.warn("initiateDeposit: Using MOCK backend response. Set NEXT_PUBLIC_USE_MOCK_API=false for real calls.");
        await new Promise(resolve => setTimeout(resolve, 700));
         // Simulate backend processing
         return {
            transactionId: `mock_dep_${Date.now()}`,
            status: Math.random() < 0.9 ? 'pending' : 'failed', // Simulate occasional failure
            message: 'Deposit request received by mock backend.',
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
    console.warn("initiateWithdraw: Backend call not implemented. Needs backend endpoint.");
    throw new Error("initiateWithdraw requires a backend implementation.");
}


// --- Other Potential Functions ---
// - getOrderStatus(orderId)
// - cancelOrder(orderId)
// - getAccountActivity()
// - getBondDetails(cusipOrSymbol)
// - getEconomicCalendar()
