
/**
 * @fileoverview Simulates or interacts with brokerage and financial data APIs.
 * Use the NEXT_PUBLIC_USE_MOCK_API environment variable to switch between mock data and real API placeholders.
 * Set NEXT_PUBLIC_USE_MOCK_API=true in .env to use mock data.
 * Set NEXT_PUBLIC_USE_MOCK_API=false to use real API placeholders (requires implementation and API keys).
 */

/**
 * Represents a financial instrument.
 */
export interface Instrument {
  /**
   * The ticker symbol of the instrument (e.g., AAPL, GOOGL).
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
   * The current price of the instrument.
   */
  price: number;
  /**
   * The timestamp of the market data.
   */
  timestamp: Date;
  /**
   * Optional: Previous closing price for calculating change.
   */
  previousClose?: number;
   /**
   * Optional: Calculated price change value.
   */
   changeValue?: number;
   /**
    * Optional: Calculated price change percentage.
    */
   changePercent?: number;
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
   * The quantity of shares to buy or sell.
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
   * The limit price, if orderPriceType is 'limit'.
   */
  limitPrice?: number;
  /**
   * The status of the order (e.g., pending, filled, cancelled).
   */
  status?: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'rejected';
  /**
   * The timestamp when the order was created or submitted.
   */
  createdAt?: Date;
    /**
   * The timestamp when the order was last updated (e.g., filled).
   */
  updatedAt?: Date;
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
   * The quantity of shares held.
   */
  quantity: number;
  /**
   * The average price at which the shares were acquired.
   */
  averagePrice: number;
}

/**
 * Represents details for a deposit transaction.
 */
export interface DepositDetails {
    amount: number;
    method: 'card' | 'crypto' | 'bank_transfer'; // Example methods
    currency: string; // e.g., 'USD'
    // Add other relevant details like card info hash, crypto address, etc.
}

/**
 * Represents details for a transfer transaction.
 */
export interface TransferDetails {
    amount: number;
    recipientId: string; // Could be user ID, bank account identifier, crypto address
    type: 'internal' | 'external_bank' | 'external_crypto';
    currency: string;
    memo?: string;
}

/**
 * Represents details for a withdrawal transaction.
 */
export interface WithdrawDetails {
    amount: number;
    destinationId: string; // Bank account identifier, crypto address
    method: 'bank_transfer' | 'crypto';
    currency: string;
}

/**
 * Represents the status of a financial transaction (deposit, transfer, withdraw).
 */
export interface TransactionStatus {
    transactionId: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    message?: string; // Optional message, e.g., reason for failure
    timestamp: Date;
}

/**
 * Represents the user's account balance.
 */
export interface AccountBalance {
    cash: number;
    currency: string;
    // Could also include buying power, margin details, etc.
}


// --- Configuration ---
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// --- Real API Configuration (Placeholders) ---
// Broker API (for trading, positions, account management)
const REAL_BROKER_API_KEY = process.env.REAL_BROKER_API_KEY;
const REAL_BROKER_SECRET_KEY = process.env.REAL_BROKER_SECRET_KEY;
const REAL_BROKER_API_ENDPOINT = process.env.REAL_BROKER_API_ENDPOINT;
// Financial Data API (for market data, historical data, news - can be different from broker)
// Examples: Alpha Vantage, Polygon.io, IEX Cloud, FinancialModelingPrep
const REAL_FINANCIAL_DATA_PROVIDER = process.env.REAL_FINANCIAL_DATA_PROVIDER || 'polygon'; // e.g., 'alpha_vantage', 'polygon'
const REAL_FINANCIAL_DATA_API_KEY = process.env.REAL_FINANCIAL_DATA_API_KEY;
const REAL_FINANCIAL_DATA_API_ENDPOINT = process.env.REAL_FINANCIAL_DATA_API_ENDPOINT; // Specific endpoint for the chosen provider


// --- Mock API Configuration ---
const MOCK_API_DELAY_MS = USE_MOCK_API ? {
    FAST: 200, // Slightly faster mock delays
    MEDIUM: 450,
    SLOW: 700,
} : { FAST: 0, MEDIUM: 0, SLOW: 0 }; // No delay if using real API placeholders
const MOCK_API_ERROR_RATE = USE_MOCK_API ? 0.005 : 0; // Slightly increased mock error rate for testing

// --- Helper Functions ---
/** Simulates network delay (only if using mock API) */
const simulateDelay = (ms: number) => {
    if (USE_MOCK_API) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    return Promise.resolve();
}

/** Simulates potential API errors (only if using mock API) */
const simulateError = (message: string) => {
  if (USE_MOCK_API && Math.random() < MOCK_API_ERROR_RATE) {
    console.warn(`Simulating API Error: ${message}`);
    // Avoid throwing errors for data fetching in mock mode to prevent UI crashes during dev
    // throw new Error(`Simulated API Error: ${message}`);
  }
};

/** Simulates potential API errors for critical actions (like trading) (only if using mock API) */
const simulateCriticalError = (message: string) => {
    if (USE_MOCK_API && Math.random() < MOCK_API_ERROR_RATE * 2) { // Higher chance for critical actions
        console.warn(`Simulating Critical API Error: ${message}`);
        throw new Error(`Simulated API Error: ${message}`);
    }
};


// --- API Functions ---

// --- Financial Data Functions (Market Data, History, Movers, Instruments List) ---

/**
 * Asynchronously retrieves a list of available financial instruments.
 * In a real app, this could fetch from a financial data provider or the broker.
 * Financial data providers often have more comprehensive lists.
 *
 * @returns A promise that resolves to an array of Instrument objects.
 */
export async function getInstruments(): Promise<Instrument[]> {
    console.log('API Call: getInstruments');
    await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
    simulateError('Failed to fetch instruments list.');

    if (USE_MOCK_API) {
        return getMockInstruments();
    } else {
        // ** REAL API INTEGRATION POINT (Financial Data Provider or Broker) **
        console.log(`Using REAL API Placeholder for getInstruments (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
             console.error("Real Financial Data API endpoint or key not configured in .env");
             // Fallback to mock data if real API is not configured but mock is disabled
             if (!USE_MOCK_API) return getMockInstruments();
             throw new Error("Financial Data API not configured for getInstruments.");
        }
        try {
            // Example using fetch (replace with SDK or specific provider logic):
            // let apiUrl = '';
            // let headers: HeadersInit = {};
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //     apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v3/reference/tickers?active=true&limit=1000&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //     apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/query?function=LISTING_STATUS&apikey=${REAL_FINANCIAL_DATA_API_KEY}`;
            //     // Alpha Vantage might require CSV parsing or specific handling
            // } else {
            //      throw new Error(`Unsupported financial data provider: ${REAL_FINANCIAL_DATA_PROVIDER}`);
            // }
            //
            // const response = await fetch(apiUrl, { headers });
            // if (!response.ok) throw new Error(`API Error: ${response.status} ${response.statusText}`);
            // const data = await response.json(); // Or parse CSV for Alpha Vantage
            //
            // // Map the response data to the Instrument[] interface based on the provider
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //     return data.results.map((asset: any) => ({
            //         ticker: asset.ticker,
            //         name: asset.name,
            //     }));
            // } else {
                 // Add mapping logic for other providers
                 console.warn("getInstruments: Real API mapping not implemented for this provider. Returning empty array.");
                 return [];
            // }

            console.warn("getInstruments: Real API call not implemented. Returning empty array.");
            return [];

        } catch (error: any) {
            console.error("Error fetching instruments from real API:", error);
            // Fallback to mock data on error if mock mode is disabled (graceful degradation)
             if (!USE_MOCK_API) return getMockInstruments();
            throw new Error(`Failed to fetch instruments: ${error.message}`);
        }
    }
}

/**
 * Asynchronously retrieves real-time or near real-time market data for a given instrument.
 * Uses the configured Financial Data Provider.
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
    console.log(`API Call: getMarketData(${ticker})`);
    await simulateDelay(MOCK_API_DELAY_MS.FAST);
    simulateError(`Failed to fetch market data for ${ticker}.`);

    if (USE_MOCK_API) {
        return generateMockMarketData(ticker);
    } else {
        // ** REAL API INTEGRATION POINT (Financial Data Provider) **
        console.log(`Using REAL API Placeholder for getMarketData(${ticker}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
        if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
             console.error("Real Financial Data API endpoint or key not configured in .env");
              if (!USE_MOCK_API) return generateMockMarketData(ticker);
             throw new Error("Financial Data API not configured for getMarketData.");
        }
        try {
            // Example using fetch (replace with SDK or specific provider logic):
            // let apiUrl = '';
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //      // Get previous day close and latest quote/trade
            //     const prevCloseUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
            //     const quoteUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/last/trade/${ticker}?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`; // Or /v2/last/quote/
            //
            //     const [prevCloseResponse, quoteResponse] = await Promise.all([fetch(prevCloseUrl), fetch(quoteUrl)]);
            //
            //     if (!prevCloseResponse.ok) console.warn(`Failed to get previous close for ${ticker}`); // Handle gracefully
            //     if (!quoteResponse.ok) throw new Error(`API Error fetching quote: ${quoteResponse.status}`);
            //
            //     const prevCloseData = prevCloseResponse.ok ? await prevCloseResponse.json() : null;
            //     const quoteData = await quoteResponse.json();
            //
            //     const price = quoteData.results.p; // Last trade price
            //     const previousClose = prevCloseData?.results?.[0]?.c; // Previous close price
            //     const changeValue = previousClose !== undefined ? price - previousClose : undefined;
            //     const changePercent = (previousClose !== undefined && previousClose > 0 && changeValue !== undefined) ? (changeValue / previousClose) * 100 : undefined;
            //
            //     return {
            //         ticker: ticker,
            //         price: parseFloat(price.toFixed(2)),
            //         timestamp: new Date(quoteData.results.t), // Trade timestamp
            //         previousClose: previousClose !== undefined ? parseFloat(previousClose.toFixed(2)) : undefined,
            //         changeValue: changeValue !== undefined ? parseFloat(changeValue.toFixed(2)) : undefined,
            //         changePercent: changePercent !== undefined ? parseFloat(changePercent.toFixed(2)) : undefined,
            //     };
            //
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //     apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${REAL_FINANCIAL_DATA_API_KEY}`;
            //     const response = await fetch(apiUrl);
            //     if (!response.ok) throw new Error(`API Error: ${response.status}`);
            //     const data = await response.json();
            //     const quote = data['Global Quote'];
            //     if (!quote || Object.keys(quote).length === 0) throw new Error(`No data found for ${ticker}`);
            //
            //     const price = parseFloat(quote['05. price']);
            //     const previousClose = parseFloat(quote['08. previous close']);
            //     const changeValue = parseFloat(quote['09. change']);
            //     const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));
            //
            //      return {
            //         ticker: ticker,
            //         price: price,
            //         timestamp: new Date(), // Alpha Vantage GLOBAL_QUOTE doesn't always give a precise timestamp
            //         previousClose: previousClose,
            //         changeValue: changeValue,
            //         changePercent: changePercent,
            //      };
            // } else {
            //     throw new Error(`Unsupported financial data provider: ${REAL_FINANCIAL_DATA_PROVIDER}`);
            // }


            console.warn(`getMarketData(${ticker}): Real API call not implemented. Returning mock data.`);
            return generateMockMarketData(ticker); // Fallback to mock for placeholders

        } catch (error: any) {
            console.error(`Error fetching market data for ${ticker} from real API:`, error);
             if (!USE_MOCK_API) return generateMockMarketData(ticker);
            throw new Error(`Failed to fetch market data for ${ticker}: ${error.message}`);
        }
    }
}

/**
 * Fetch historical price data for a given ticker and time range.
 * Uses the configured Financial Data Provider.
 *
 * @param ticker The ticker symbol.
 * @param range The time range ('1m', '6m', '1y').
 * @returns A promise resolving to an array of historical data points.
 */
 export async function getHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
    console.log(`API Call: getHistoricalData(${ticker}, ${range})`);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);
    simulateError(`Failed to fetch historical data for ${ticker} (${range}).`);

    if (USE_MOCK_API) {
        return generateMockHistoricalData(ticker, range);
    } else {
        // ** REAL API INTEGRATION POINT (Financial Data Provider) **
        console.log(`Using REAL API Placeholder for getHistoricalData(${ticker}, ${range}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
         if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
             console.error("Real Financial Data API endpoint or key not configured in .env");
              if (!USE_MOCK_API) return generateMockHistoricalData(ticker, range);
             throw new Error("Financial Data API not configured for getHistoricalData.");
        }
        try {
            // Example using fetch (replace with SDK or specific provider logic):
            // const endDate = new Date();
            // const startDate = new Date();
            // let multiplier = 1;
            // let timespan = 'day';
            //
            // switch (range) {
            //     case '1m': startDate.setMonth(endDate.getMonth() - 1); break;
            //     case '6m': startDate.setMonth(endDate.getMonth() - 6); break;
            //     case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
            //     default: throw new Error("Invalid range specified");
            // }
            //
            // const formatAPIDate = (date: Date) => date.toISOString().split('T')[0];
            //
            // let apiUrl = '';
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //      apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${formatAPIDate(startDate)}/${formatAPIDate(endDate)}?adjusted=true&sort=asc&limit=5000&apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //      const avFunction = (range === '1m' || range === '6m') ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_DAILY_ADJUSTED';
            //      const outputSize = (range === '1y') ? 'full' : 'compact'; // Compact is 100 data points
            //      apiUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/query?function=${avFunction}&symbol=${ticker}&outputsize=${outputSize}&apikey=${REAL_FINANCIAL_DATA_API_KEY}`;
            // } else {
            //      throw new Error(`Unsupported financial data provider: ${REAL_FINANCIAL_DATA_PROVIDER}`);
            // }
            //
            // const response = await fetch(apiUrl);
            // if (!response.ok) throw new Error(`API Error fetching historical data: ${response.status}`);
            // const data = await response.json();
            //
            // // Map response to { date: string, value: number }[] based on provider
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //     if (!data.results) throw new Error("No results found in Polygon response.");
            //      return data.results.map((bar: any) => ({
            //         date: new Date(bar.t).toISOString().split('T')[0],
            //         value: parseFloat(bar.c), // Closing price
            //     }));
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //     const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
            //     if (!timeSeriesKey || !data[timeSeriesKey]) throw new Error("No time series data found in Alpha Vantage response.");
            //     const timeSeries = data[timeSeriesKey];
            //     // Filter data to match the requested range (Alpha Vantage compact/full might return more)
            //     const filteredDates = Object.keys(timeSeries).filter(dateStr => new Date(dateStr) >= startDate);
            //     return filteredDates.map(dateStr => ({
            //         date: dateStr,
            //         value: parseFloat(timeSeries[dateStr]['4. close'] || timeSeries[dateStr]['5. adjusted close']) // Get close or adjusted close
            //     })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Ensure ascending order
            // } else {
                console.warn("getHistoricalData: Real API mapping not implemented for this provider. Returning empty array.");
                return [];
            // }

            console.warn(`getHistoricalData(${ticker}, ${range}): Real API call not implemented. Returning mock data.`);
            return generateMockHistoricalData(ticker, range); // Fallback to mock for placeholders

        } catch (error: any) {
            console.error(`Error fetching historical data for ${ticker} from real API:`, error);
             if (!USE_MOCK_API) return generateMockHistoricalData(ticker, range);
            throw new Error(`Failed to fetch historical data for ${ticker}: ${error.message}`);
        }
    }
 }

/**
 * Asynchronously retrieves the top market movers (gainers and losers).
 * Uses the configured Financial Data Provider.
 *
 * @param count The number of gainers/losers to retrieve (e.g., 5).
 * @returns A promise resolving to an object containing arrays of gainers and losers.
 */
export async function getTopMovers(count: number = 5): Promise<{ gainers: Instrument[], losers: Instrument[] }> {
    console.log(`API Call: getTopMovers(count=${count})`);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);
    simulateError('Failed to fetch top market movers.');

    if (USE_MOCK_API) {
        const instruments = await getMockInstruments();
        const moversData = await Promise.all(
            instruments.map(async (inst) => {
                try {
                    const marketData = await getMarketDataNoError(inst.ticker);
                    return {
                        ...inst,
                        price: marketData.price,
                        changePercent: marketData.changePercent,
                    };
                } catch (e) { return null; }
            })
        );
        const validMovers = moversData.filter(m => m && typeof m.changePercent === 'number') as (Instrument & { price: number; changePercent: number })[];
        validMovers.sort((a, b) => b.changePercent - a.changePercent);
        const gainers = validMovers.slice(0, count);
        const losers = validMovers.slice(-count).reverse();
        return { gainers, losers };
    } else {
        // ** REAL API INTEGRATION POINT (Financial Data Provider) **
        console.log(`Using REAL API Placeholder for getTopMovers(${count}) (Provider: ${REAL_FINANCIAL_DATA_PROVIDER})`);
         if (!REAL_FINANCIAL_DATA_API_ENDPOINT || !REAL_FINANCIAL_DATA_API_KEY) {
             console.error("Real Financial Data API endpoint or key not configured in .env");
              if (!USE_MOCK_API) { // Fallback if not configured
                  const instruments = await getMockInstruments();
                  // ... (rest of mock logic from above)
                   const moversData = await Promise.all(instruments.map(async inst => {/*...*/ try {const md = await getMarketDataNoError(inst.ticker); return {...inst, price: md.price, changePercent: md.changePercent};} catch{return null;} }));
                   const validMovers = moversData.filter(m => m && typeof m.changePercent === 'number') as any[]; validMovers.sort((a,b)=>b.changePercent-a.changePercent);
                   return {gainers: validMovers.slice(0, count), losers: validMovers.slice(-count).reverse()};
               }
             throw new Error("Financial Data API not configured for getTopMovers.");
        }
        try {
            // Example using fetch (replace with SDK or specific provider logic):
            // let gainersUrl = '';
            // let losersUrl = '';
            // let headers: HeadersInit = {};
            //
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //     gainersUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/snapshot/locale/us/markets/stocks/gainers?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
            //     losersUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/v2/snapshot/locale/us/markets/stocks/losers?apiKey=${REAL_FINANCIAL_DATA_API_KEY}`;
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //     // Alpha Vantage might require multiple calls or have a specific endpoint for this
            //     console.warn("getTopMovers: Alpha Vantage implementation might be complex or unavailable.");
            //      gainersUrl = `${REAL_FINANCIAL_DATA_API_ENDPOINT}/query?function=TOP_GAINERS_LOSERS&apikey=${REAL_FINANCIAL_DATA_API_KEY}`; // This endpoint combines both
            //      losersUrl = gainersUrl; // Fetch once
            // } else {
            //     throw new Error(`Unsupported financial data provider: ${REAL_FINANCIAL_DATA_PROVIDER}`);
            // }
            //
            // const [gainersResponse, losersResponse] = await Promise.all([fetch(gainersUrl, {headers}), fetch(losersUrl, {headers})]);
            //
            // if (!gainersResponse.ok) throw new Error(`API Error fetching gainers: ${gainersResponse.status}`);
            // if (!losersResponse.ok && losersUrl !== gainersUrl) throw new Error(`API Error fetching losers: ${losersResponse.status}`);
            //
            // const gainersData = await gainersResponse.json();
            // const losersData = losersUrl === gainersUrl ? gainersData : await losersResponse.json();
            //
            // // Map responses to Instrument[] interface based on provider
            // const mapMover = (mover: any, provider: string): Instrument | null => {
            //      if (provider === 'polygon') {
            //         return {
            //             ticker: mover.ticker,
            //             name: mover.ticker, // Polygon snapshot might not include name, may need separate lookup
            //             price: mover.day.c, // Closing price of the day
            //             changePercent: mover.todaysChangePerc,
            //         };
            //     } else if (provider === 'alpha_vantage') {
            //          return {
            //              ticker: mover.ticker,
            //              name: mover.ticker, // Alpha Vantage might not include name
            //              price: parseFloat(mover.price),
            //              changePercent: parseFloat(mover.change_percentage.replace('%','')),
            //          };
            //     }
            //     return null;
            // };
            //
            // let gainers: Instrument[] = [];
            // let losers: Instrument[] = [];
            //
            // if (REAL_FINANCIAL_DATA_PROVIDER === 'polygon') {
            //     gainers = gainersData.tickers?.slice(0, count).map((m: any) => mapMover(m, 'polygon')).filter((g: Instrument | null) => g) ?? [];
            //     losers = losersData.tickers?.slice(0, count).map((m: any) => mapMover(m, 'polygon')).filter((l: Instrument | null) => l) ?? []; // Polygon losers endpoint gives actual losers
            // } else if (REAL_FINANCIAL_DATA_PROVIDER === 'alpha_vantage') {
            //      gainers = gainersData.top_gainers?.slice(0, count).map((m: any) => mapMover(m, 'alpha_vantage')).filter((g: Instrument | null) => g) ?? [];
            //      losers = gainersData.top_losers?.slice(0, count).map((m: any) => mapMover(m, 'alpha_vantage')).filter((l: Instrument | null) => l) ?? [];
            // }
            //
            // return { gainers, losers };

            console.warn(`getTopMovers(${count}): Real API call not implemented. Returning mock data.`);
            // Fallback mock logic
             const instruments = await getMockInstruments();
             const moversData = await Promise.all(instruments.map(async inst => { try {const md=await getMarketDataNoError(inst.ticker); return {...inst, price:md.price, changePercent:md.changePercent}; } catch{return null;} }));
             const validMovers = moversData.filter(m => m && typeof m.changePercent === 'number') as any[]; validMovers.sort((a,b)=>b.changePercent-a.changePercent);
             return {gainers: validMovers.slice(0, count), losers: validMovers.slice(-count).reverse()};

        } catch (error: any) {
            console.error(`Error fetching top movers from real API:`, error);
             if (!USE_MOCK_API) { // Fallback if not configured
                 const instruments = await getMockInstruments();
                 const moversData = await Promise.all(instruments.map(async inst => {/*...*/ try {const md = await getMarketDataNoError(inst.ticker); return {...inst, price: md.price, changePercent: md.changePercent};} catch{return null;} }));
                 const validMovers = moversData.filter(m => m && typeof m.changePercent === 'number') as any[]; validMovers.sort((a,b)=>b.changePercent-a.changePercent);
                 return {gainers: validMovers.slice(0, count), losers: validMovers.slice(-count).reverse()};
             }
            throw new Error(`Failed to fetch top movers: ${error.message}`);
        }
    }
}


// --- Broker API Functions (Trading, Positions, Account) ---

/**
 * Asynchronously submits an order for buying or selling a financial instrument using the Broker API.
 *
 * @param order The order details to submit.
 * @returns A promise that resolves to the submitted Order object, updated with ID and status.
 */
export async function submitOrder(order: Order): Promise<Order> {
    console.log(`BROKER API Call: submitOrder(${order.type} ${order.quantity} ${order.ticker})`);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);

    if (USE_MOCK_API) {
        if (order.type === 'buy' && Math.random() < 0.03) {
            console.warn(`Simulating Broker Error: Insufficient funds for ${order.ticker} order.`);
            throw new Error('Simulated Broker Error: Insufficient funds.');
        }
        simulateCriticalError(`Failed to submit order for ${order.ticker}.`); // Use critical error simulation

        const submittedOrder: Order = {
            ...order,
            id: `mock_order_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
            status: Math.random() > 0.1 ? 'filled' : 'pending', // Mostly filled in mock
            createdAt: new Date(),
            updatedAt: new Date(),
            orderPriceType: order.orderPriceType || 'market',
        };
        console.log(`Mock order ${submittedOrder.id} (${order.ticker}) status: ${submittedOrder.status}`);
        return submittedOrder;
    } else {
        // ** REAL BROKER API INTEGRATION POINT **
        console.log(`Using REAL BROKER API Placeholder for submitOrder(${order.ticker})`);
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
             console.error("Real Broker API endpoint, key, or secret not configured in .env");
             throw new Error("Broker API not configured for submitOrder.");
        }
        try {
            // Example using fetch (replace with Broker SDK call):
            // const orderPayload = {
            //     symbol: order.ticker,
            //     qty: order.quantity,
            //     side: order.type,
            //     type: order.orderPriceType || 'market',
            //     time_in_force: 'day',
            //     limit_price: order.orderPriceType === 'limit' ? order.limitPrice?.toString() : undefined,
            // };
            //
            // const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/orders`, {
            //     method: 'POST',
            //     headers: {
            //         // Replace with your Broker's specific authentication (e.g., Alpaca)
            //         'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
            //         'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(orderPayload),
            // });
            //
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(`Broker API Error ${response.status}: ${errorData.message || response.statusText}`);
            // }
            //
            // const submittedOrderData = await response.json();
            //
            // // Map response back to Order interface (adjust fields based on broker response)
            // return {
            //     id: submittedOrderData.id,
            //     ticker: submittedOrderData.symbol,
            //     quantity: parseFloat(submittedOrderData.qty) || parseFloat(submittedOrderData.filled_qty),
            //     type: submittedOrderData.side,
            //     orderPriceType: submittedOrderData.type,
            //     limitPrice: submittedOrderData.limit_price ? parseFloat(submittedOrderData.limit_price) : undefined,
            //     status: submittedOrderData.status, // Map broker status ('accepted', 'new', 'filled', etc.)
            //     createdAt: new Date(submittedOrderData.created_at),
            //     updatedAt: new Date(submittedOrderData.updated_at),
            // };

            console.warn(`submitOrder(${order.ticker}): Real Broker API call not implemented. Simulating success.`);
             const mockSubmittedOrder: Order = {
                ...order,
                id: `real_broker_placeholder_${Date.now()}`,
                status: 'pending',
                createdAt: new Date(),
                updatedAt: new Date(),
                orderPriceType: order.orderPriceType || 'market',
            };
             return mockSubmittedOrder;

        } catch (error: any) {
            console.error(`Error submitting order for ${order.ticker} to real Broker API:`, error);
            throw new Error(`Failed to submit order for ${order.ticker}: ${error.message}`);
        }
    }
}

/**
 * Asynchronously retrieves the current positions in the portfolio from the Broker API.
 *
 * @returns A promise that resolves to an array of Position objects.
 */
export async function getPositions(): Promise<Position[]> {
    console.log('BROKER API Call: getPositions');
    await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
    simulateError('Failed to fetch portfolio positions.'); // Use non-critical error simulation

    if (USE_MOCK_API) {
        return getMockPositions();
    } else {
        // ** REAL BROKER API INTEGRATION POINT **
        console.log('Using REAL BROKER API Placeholder for getPositions');
         if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
             console.error("Real Broker API endpoint, key, or secret not configured in .env");
              if (!USE_MOCK_API) return getMockPositions();
             throw new Error("Broker API not configured for getPositions.");
        }
        try {
            // Example using fetch (replace with Broker SDK call):
            // const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/positions`, {
            //     headers: {
            //         'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
            //         'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
            //         'Accept': 'application/json',
            //     },
            // });
            // if (!response.ok) throw new Error(`Broker API Error: ${response.status} ${response.statusText}`);
            // const data = await response.json();
            //
            // // Map the response data to the Position[] interface (adjust fields)
            // return data.map((pos: any) => ({
            //     ticker: pos.symbol,
            //     quantity: parseFloat(pos.qty),
            //     averagePrice: parseFloat(pos.avg_entry_price),
            // }));

            console.warn("getPositions: Real Broker API call not implemented. Returning empty array.");
            return [];

        } catch (error: any) {
            console.error("Error fetching positions from real Broker API:", error);
             if (!USE_MOCK_API) return getMockPositions();
            throw new Error(`Failed to fetch positions: ${error.message}`);
        }
    }
}

/**
 * Asynchronously retrieves the current account balance from the Broker API.
 *
 * @returns A promise that resolves to an AccountBalance object.
 */
export async function getAccountBalance(): Promise<AccountBalance> {
    console.log('BROKER API Call: getAccountBalance');
    await simulateDelay(MOCK_API_DELAY_MS.FAST);
    simulateError('Failed to fetch account balance.'); // Use non-critical error simulation

    if (USE_MOCK_API) {
        // Mock Data
        return { cash: 15000.75, currency: 'USD' };
    } else {
        // ** REAL BROKER API INTEGRATION POINT **
        console.log('Using REAL BROKER API Placeholder for getAccountBalance');
        if (!REAL_BROKER_API_ENDPOINT || !REAL_BROKER_API_KEY || !REAL_BROKER_SECRET_KEY) {
            console.error("Real Broker API endpoint, key, or secret not configured in .env");
             if (!USE_MOCK_API) return { cash: 0, currency: 'USD' }; // Fallback
            throw new Error("Broker API not configured for getAccountBalance.");
        }
        try {
            // Example using fetch (replace with Broker SDK call):
            // const response = await fetch(`${REAL_BROKER_API_ENDPOINT}/v2/account`, {
            //     headers: {
            //         'APCA-API-KEY-ID': REAL_BROKER_API_KEY,
            //         'APCA-API-SECRET-KEY': REAL_BROKER_SECRET_KEY,
            //         'Accept': 'application/json',
            //     },
            // });
            // if (!response.ok) throw new Error(`Broker API Error: ${response.status} ${response.statusText}`);
            // const data = await response.json();
            //
            // return {
            //     cash: parseFloat(data.cash), // Adjust field based on broker response ('cash', 'equity', 'buying_power')
            //     currency: data.currency,
            // };

            console.warn("getAccountBalance: Real Broker API call not implemented. Returning zero balance.");
            return { cash: 0, currency: 'USD' };

        } catch (error: any) {
            console.error("Error fetching account balance from real Broker API:", error);
             if (!USE_MOCK_API) return { cash: 0, currency: 'USD' }; // Fallback
            throw new Error(`Failed to fetch account balance: ${error.message}`);
        }
    }
}


// --- Conceptual Functions for Deposit/Transfer/Withdraw (Requires Backend Implementation) ---
// These functions would typically call your backend (e.g., Cloud Functions) which then interact
// with payment processors, banks, or the broker's funding APIs.

/**
 * Initiates a deposit request. (Conceptual)
 * @param details Deposit details.
 * @returns A promise resolving to the transaction status.
 */
export async function initiateDeposit(details: DepositDetails): Promise<TransactionStatus> {
    console.log('SERVICE Call: initiateDeposit', details);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);
    // Simulate API error before returning success
    simulateCriticalError(`Failed to initiate deposit of ${details.amount} ${details.currency}.`);

    // In a real app, this would send a request to your secure backend endpoint.
    // Your backend would handle the actual payment processing logic.
    console.log(`Initiating deposit of ${details.amount} ${details.currency} via ${details.method}...`);

    // Simulate immediate pending status
    return {
        transactionId: `dep_${Date.now()}`,
        status: 'pending',
        message: 'Deposit initiated, awaiting confirmation.',
        timestamp: new Date(),
    };
}

/**
 * Initiates a transfer request. (Conceptual)
 * @param details Transfer details.
 * @returns A promise resolving to the transaction status.
 */
export async function initiateTransfer(details: TransferDetails): Promise<TransactionStatus> {
    console.log('SERVICE Call: initiateTransfer', details);
    await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
    simulateCriticalError(`Failed to initiate transfer of ${details.amount} ${details.currency}.`);

    console.log(`Initiating transfer of ${details.amount} ${details.currency} to ${details.recipientId}...`);

    // Simulate immediate pending status
    return {
        transactionId: `txf_${Date.now()}`,
        status: 'pending',
        message: 'Transfer initiated.',
        timestamp: new Date(),
    };
}

/**
 * Initiates a withdrawal request. (Conceptual)
 * @param details Withdraw details.
 * @returns A promise resolving to the transaction status.
 */
export async function initiateWithdraw(details: WithdrawDetails): Promise<TransactionStatus> {
    console.log('SERVICE Call: initiateWithdraw', details);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);
    simulateCriticalError(`Failed to initiate withdrawal of ${details.amount} ${details.currency}.`);

    console.log(`Initiating withdrawal of ${details.amount} ${details.currency} to ${details.destinationId}...`);

     // Simulate immediate pending status
     return {
         transactionId: `wdl_${Date.now()}`,
         status: 'pending',
         message: 'Withdrawal request submitted.',
         timestamp: new Date(),
     };
}


// --- Mock Data Generation Functions (Internal) ---

/** Generates mock market data for a ticker. */
function generateMockMarketData(ticker: string): MarketData {
    const basePrice = getBasePriceForTicker(ticker);
    // Reduce volatility slightly for mock data consistency
    const previousClose = basePrice * (1 + (Math.random() - 0.5) * 0.015);
    const price = previousClose * (1 + (Math.random() - 0.48) * 0.025); // Slightly biased upward trend
    const changeValue = price - previousClose;
    const changePercent = previousClose > 0 ? (changeValue / previousClose) * 100 : 0;

    return {
        ticker: ticker,
        price: parseFloat(price.toFixed(2)),
        timestamp: new Date(),
        previousClose: parseFloat(previousClose.toFixed(2)),
        changeValue: parseFloat(changeValue.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
    };
}

/** Generates mock historical data. */
async function generateMockHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
   const endDate = new Date();
   let startDate = new Date();
   let numPoints = 30;

   switch (range) {
     case '1m': startDate.setMonth(endDate.getMonth() - 1); numPoints = 22; break;
     case '6m': startDate.setMonth(endDate.getMonth() - 6); numPoints = 126; break;
     case '1y': startDate.setFullYear(endDate.getFullYear() - 1); numPoints = 252; break;
     default: startDate.setMonth(endDate.getMonth() - 1); numPoints = 22;
   }

   const data = [];
   let currentMarketData: MarketData | null = null;
   try {
     currentMarketData = await getMarketDataNoError(ticker);
   } catch (err) {
      console.warn(`Could not fetch current market data for ${ticker} while generating history, using base price.`);
      currentMarketData = getBaseMarketData(ticker);
   }
   let currentValue = currentMarketData.price;

   const rangeFactor = { '1m': 0.04, '6m': 0.12, '1y': 0.20 }[range] || 0.04; // Slightly reduced range factor
   // Start history slightly below current price to show upward trend
   currentValue /= (1 + (Math.random()) * rangeFactor * 0.5); // Start lower

   const timeDiff = endDate.getTime() - startDate.getTime();
   const dailyVolatility = ['TSLA', 'NVDA', 'BTC-USD', 'ETH-USD'].includes(ticker) ? 0.03 : 0.018; // Reduced volatility
   const drift = 1.0002 + (Math.random() - 0.4) * 0.0006; // Stronger upward drift

   for (let i = numPoints -1 ; i >= 0; i--) {
       const date = new Date(startDate.getTime() + (timeDiff * (numPoints - 1 - i)) / (numPoints - 1 || 1));
       data.push({
           date: date.toISOString().split('T')[0],
           value: parseFloat(currentValue.toFixed(2)),
       });
       currentValue *= drift; // Apply drift first
       currentValue *= (1 + (Math.random() - 0.5) * dailyVolatility); // Then volatility
       currentValue = Math.max(currentValue, 1); // Floor at 1
   }
    // data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Already sorted by loop

   // Ensure the last point matches the most recent "current" price
   if (data.length > 0 && currentMarketData) {
       data[data.length - 1].value = currentMarketData.price;
   }

   return data;
}


/** Returns the base price for mock data generation. */
function getBasePriceForTicker(ticker: string): number {
    // Slightly updated base prices
    return {
        'AAPL': 195, 'GOOGL': 178, 'MSFT': 435, 'AMZN': 188, 'TSLA': 175,
        'NVDA': 940, 'VOO': 515, 'AGG': 97, 'JPM': 198, 'XOM': 118,
        'VNQ': 86, 'GLD': 218, 'BTC-USD': 69500, 'ETH-USD': 3600,
        'SPY': 555, 'QQQ': 485, 'DIA': 405
      }[ticker] || 110; // Slightly increased default
}

/** Returns the list of mock instruments. */
function getMockInstruments(): Instrument[] {
     return [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
        { ticker: 'MSFT', name: 'Microsoft Corp.'},
        { ticker: 'AMZN', name: 'Amazon.com, Inc.'},
        { ticker: 'TSLA', name: 'Tesla, Inc.'},
        { ticker: 'NVDA', name: 'NVIDIA Corporation'},
        { ticker: 'VOO', name: 'Vanguard S&P 500 ETF'},
        { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF'},
        { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
        { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
        { ticker: 'VNQ', name: 'Vanguard Real Estate ETF' },
        { ticker: 'GLD', name: 'SPDR Gold Shares' },
        { ticker: 'BTC-USD', name: 'Bitcoin USD'},
        { ticker: 'ETH-USD', name: 'Ethereum USD'},
        { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust'},
        { ticker: 'QQQ', name: 'Invesco QQQ Trust'},
        { ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF Trust'},
    ];
}

/** Returns mock portfolio positions */
function getMockPositions(): Position[] {
    return [
            { ticker: 'AAPL', quantity: 15, averagePrice: 165.50 },
            { ticker: 'MSFT', quantity: 10, averagePrice: 400.00 },
            { ticker: 'VOO', quantity: 30, averagePrice: 490.20 },
            { ticker: 'TSLA', quantity: 5, averagePrice: 190.75 },
            { ticker: 'AGG', quantity: 50, averagePrice: 97.10 },
            { ticker: 'XOM', quantity: 25, averagePrice: 110.00 },
            { ticker: 'NVDA', quantity: 2, averagePrice: 850.00 },
    ];
}

/** Internal helper: Gets base market data without delay or errors. */
function getBaseMarketData(ticker: string): MarketData {
    const price = getBasePriceForTicker(ticker);
    return { ticker, price, timestamp: new Date() };
}

/** Internal helper: Fetches market data without simulating errors or delay. */
 async function getMarketDataNoError(ticker: string): Promise<MarketData> {
    if (!USE_MOCK_API) {
        try {
            // Paste REAL API LOGIC HERE without delay/error simulation
            // console.log(`getMarketDataNoError: Attempting real API call placeholder for ${ticker}`);
            // If real API logic is implemented here, return its result.
             // For now, fallback to mock if real is intended but not implemented.
             return generateMockMarketData(ticker);
        } catch (realApiError) {
             console.warn(`getMarketDataNoError: Real API failed for ${ticker}, falling back to mock. Error: ${realApiError}`);
              return generateMockMarketData(ticker);
        }
    }
    // Always return mock data if USE_MOCK_API is true
    return generateMockMarketData(ticker);
}

// --- Potential Future Additions ---
// - News API integration (e.g., NewsAPI, Marketaux)
// - Sentiment analysis integration
// - More detailed account information (order history, transaction history)
// - WebSocket connection for real-time data streams
// - More specific error handling (rate limits, invalid ticker, auth errors)
// - Functions for:
//   - Fetching order status (getOrderStatus(orderId))
//   - Cancelling orders (cancelOrder(orderId))
//   - Managing watchlists
//   - Fetching company profiles, analyst ratings etc.
//   - Handling different asset types (options, crypto specifics)
//   - More robust deposit/transfer/withdraw status polling
