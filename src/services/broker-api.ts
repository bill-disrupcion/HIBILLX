
/**
 * @fileoverview Simulates or interacts with a brokerage API for financial data and trading.
 * Use the NEXT_PUBLIC_USE_MOCK_API environment variable to switch between mock data and real API placeholders.
 * Set NEXT_PUBLIC_USE_MOCK_API=true in .env to use mock data.
 * Set NEXT_PUBLIC_USE_MOCK_API=false to use real API placeholders (requires implementation).
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
 * Represents the current position of an instrument.
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

// --- Configuration ---
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// --- Real API Configuration (Placeholders) ---
// Ensure these are set in your .env file when USE_MOCK_API is false
const REAL_API_KEY = process.env.REAL_BROKER_API_KEY;
const REAL_SECRET_KEY = process.env.REAL_BROKER_SECRET_KEY;
const REAL_API_ENDPOINT = process.env.REAL_BROKER_API_ENDPOINT;
const REAL_DATA_ENDPOINT = process.env.REAL_BROKER_DATA_ENDPOINT || REAL_API_ENDPOINT; // Some brokers use separate data endpoints

// Example: Initialize Broker SDK (replace with your chosen SDK)
// import BrokerSDK from 'some-broker-sdk';
// const brokerClient = USE_MOCK_API ? null : new BrokerSDK({
//   apiKey: REAL_API_KEY,
//   secretKey: REAL_SECRET_KEY,
//   baseApiUrl: REAL_API_ENDPOINT,
//   baseDataUrl: REAL_DATA_ENDPOINT,
//   // ... other config
// });

// --- Mock API Configuration ---
const MOCK_API_DELAY_MS = USE_MOCK_API ? {
    FAST: 300,
    MEDIUM: 600,
    SLOW: 900,
} : { FAST: 0, MEDIUM: 0, SLOW: 0 }; // No delay if using real API placeholders
const MOCK_API_ERROR_RATE = USE_MOCK_API ? 0.001 : 0; // Very low error rate for mock, no simulated errors for real placeholders

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
    throw new Error(`Simulated API Error: ${message}`);
  }
};

// --- API Functions ---

/**
 * Asynchronously retrieves a list of available financial instruments.
 * In a real app, this would fetch from a brokerage or financial data API.
 * Consider caching the results as this data changes infrequently.
 *
 * @returns A promise that resolves to an array of Instrument objects.
 */
export async function getInstruments(): Promise<Instrument[]> {
    console.log('API Call: getInstruments');
    await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
    simulateError('Failed to fetch instruments list.');

    if (USE_MOCK_API) {
        // Mock Data
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
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log('Using REAL API Placeholder for getInstruments');
        if (!REAL_API_ENDPOINT || !REAL_API_KEY) {
             console.error("Real API endpoint or key not configured in .env");
             throw new Error("Broker API not configured for getInstruments.");
        }
        try {
            // Example using fetch (replace with SDK call if available):
            // const response = await fetch(`${REAL_API_ENDPOINT}/v1/assets?status=active`, {
            //     headers: {
            //         'Authorization': `Bearer ${REAL_API_KEY}`, // Or your specific auth method
            //         'Accept': 'application/json',
            //     },
            // });
            // if (!response.ok) {
            //     throw new Error(`API Error: ${response.status} ${response.statusText}`);
            // }
            // const data = await response.json();
            // // Map the response data to the Instrument[] interface
            // return data.map((asset: any) => ({
            //     ticker: asset.symbol, // Adjust field names based on your API
            //     name: asset.name,
            // }));

            // Placeholder: Return empty array or throw error until implemented
            console.warn("getInstruments: Real API call not implemented. Returning empty array.");
            return [];

        } catch (error: any) {
            console.error("Error fetching instruments from real API:", error);
            throw new Error(`Failed to fetch instruments: ${error.message}`);
        }
    }
}

/**
 * Asynchronously retrieves real-time or near real-time market data for a given instrument.
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
    console.log(`API Call: getMarketData(${ticker})`);
    await simulateDelay(MOCK_API_DELAY_MS.FAST);
    simulateError(`Failed to fetch market data for ${ticker}.`);

    if (USE_MOCK_API) {
        // Mock Data
        return generateMockMarketData(ticker);
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log(`Using REAL API Placeholder for getMarketData(${ticker})`);
        if (!REAL_DATA_ENDPOINT || !REAL_API_KEY) {
             console.error("Real Data endpoint or key not configured in .env");
             throw new Error("Broker API not configured for getMarketData.");
        }
        try {
            // Example using fetch (replace with SDK call):
            // This often involves fetching the latest quote or trade.
            // const quoteResponse = await fetch(`${REAL_DATA_ENDPOINT}/v2/stocks/${ticker}/quotes/latest`, { // Example endpoint
            //     headers: { 'Authorization': `Bearer ${REAL_API_KEY}` },
            // });
            // if (!quoteResponse.ok) throw new Error(`API Error fetching quote: ${quoteResponse.status}`);
            // const quoteData = await quoteResponse.json();
            //
            // const snapshotResponse = await fetch(`${REAL_DATA_ENDPOINT}/v2/stocks/${ticker}/snapshots`, { // Example endpoint for previous close
            //      headers: { 'Authorization': `Bearer ${REAL_API_KEY}` },
            // });
            // if (!snapshotResponse.ok) throw new Error(`API Error fetching snapshot: ${snapshotResponse.status}`);
            // const snapshotData = await snapshotResponse.json();
            //
            // const price = quoteData.quote.ap; // Adjust based on API response (ask price, bid price, last price)
            // const previousClose = snapshotData.dailyBar.c; // Adjust based on API response
            // const changeValue = price - previousClose;
            // const changePercent = previousClose > 0 ? (changeValue / previousClose) * 100 : 0;
            //
            // return {
            //     ticker: ticker,
            //     price: parseFloat(price.toFixed(2)),
            //     timestamp: new Date(quoteData.quote.t), // Adjust based on API response
            //     previousClose: parseFloat(previousClose.toFixed(2)),
            //     changeValue: parseFloat(changeValue.toFixed(2)),
            //     changePercent: parseFloat(changePercent.toFixed(2)),
            // };

            // Placeholder: Return mock data or throw until implemented
            console.warn(`getMarketData(${ticker}): Real API call not implemented. Returning mock data.`);
            return generateMockMarketData(ticker); // Fallback to mock for placeholders

        } catch (error: any) {
            console.error(`Error fetching market data for ${ticker} from real API:`, error);
            throw new Error(`Failed to fetch market data for ${ticker}: ${error.message}`);
        }
    }
}

/**
 * Asynchronously submits an order for buying or selling a financial instrument.
 *
 * @param order The order details to submit.
 * @returns A promise that resolves to the submitted Order object, updated with ID and status.
 */
export async function submitOrder(order: Order): Promise<Order> {
    console.log(`API Call: submitOrder(${order.type} ${order.quantity} ${order.ticker})`);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);

    if (USE_MOCK_API) {
         // Simulate specific errors like insufficient funds before the general error simulation
        if (order.type === 'buy' && Math.random() < 0.03) { // 3% chance of insufficient funds
            console.warn(`Simulating API Error: Insufficient funds for ${order.ticker} order.`);
            throw new Error('Simulated API Error: Insufficient funds.');
        }
        simulateError(`Failed to submit order for ${order.ticker}.`);

        // Mock Response
        const submittedOrder: Order = {
            ...order,
            id: `mock_order_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
            status: 'pending', // Or 'filled' for simplicity in mock
            createdAt: new Date(),
            updatedAt: new Date(),
            orderPriceType: order.orderPriceType || 'market',
        };
        console.log(`Mock order ${submittedOrder.id} (${order.ticker}) accepted by broker. Status: ${submittedOrder.status}`);
        return submittedOrder;
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log(`Using REAL API Placeholder for submitOrder(${order.ticker})`);
        if (!REAL_API_ENDPOINT || !REAL_API_KEY || !REAL_SECRET_KEY) {
             console.error("Real API endpoint, key, or secret not configured in .env");
             throw new Error("Broker API not configured for submitOrder.");
        }
        try {
            // Example using fetch (replace with SDK call):
            // const orderPayload = {
            //     symbol: order.ticker,
            //     qty: order.quantity,
            //     side: order.type,
            //     type: order.orderPriceType || 'market', // e.g., 'market', 'limit'
            //     time_in_force: 'day', // e.g., 'day', 'gtc'
            //     limit_price: order.orderPriceType === 'limit' ? order.limitPrice : undefined,
            //     // ... other required parameters
            // };
            //
            // const response = await fetch(`${REAL_API_ENDPOINT}/v2/orders`, { // Example endpoint
            //     method: 'POST',
            //     headers: {
            //         'Authorization': `Bearer ${REAL_API_KEY}`, // Or your specific auth
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(orderPayload),
            // });
            //
            // if (!response.ok) {
            //     const errorData = await response.json();
            //     throw new Error(`API Error ${response.status}: ${errorData.message || response.statusText}`);
            // }
            //
            // const submittedOrderData = await response.json();
            //
            // // Map response back to Order interface
            // return {
            //     id: submittedOrderData.id,
            //     ticker: submittedOrderData.symbol,
            //     quantity: submittedOrderData.qty,
            //     type: submittedOrderData.side,
            //     orderPriceType: submittedOrderData.type,
            //     limitPrice: submittedOrderData.limit_price,
            //     status: submittedOrderData.status, // Map broker status to your interface statuses
            //     createdAt: new Date(submittedOrderData.created_at),
            //     updatedAt: new Date(submittedOrderData.updated_at),
            // };

            // Placeholder: Simulate success or throw error until implemented
            console.warn(`submitOrder(${order.ticker}): Real API call not implemented. Simulating success.`);
             // Simulate success response for placeholder
            const mockSubmittedOrder: Order = {
                ...order,
                id: `real_placeholder_${Date.now()}`,
                status: 'pending', // Simulate pending status
                createdAt: new Date(),
                updatedAt: new Date(),
                orderPriceType: order.orderPriceType || 'market',
            };
             return mockSubmittedOrder;

        } catch (error: any) {
            console.error(`Error submitting order for ${order.ticker} to real API:`, error);
            throw new Error(`Failed to submit order for ${order.ticker}: ${error.message}`);
        }
    }
}

/**
 * Asynchronously retrieves the current positions in the portfolio.
 *
 * @returns A promise that resolves to an array of Position objects.
 */
export async function getPositions(): Promise<Position[]> {
    console.log('API Call: getPositions');
    await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
    simulateError('Failed to fetch portfolio positions.');

    if (USE_MOCK_API) {
        // Mock Data
        return [
            { ticker: 'AAPL', quantity: 15, averagePrice: 165.50 },
            { ticker: 'MSFT', quantity: 10, averagePrice: 400.00 },
            { ticker: 'VOO', quantity: 30, averagePrice: 490.20 },
            { ticker: 'TSLA', quantity: 5, averagePrice: 190.75 },
            { ticker: 'AGG', quantity: 50, averagePrice: 97.10 },
            { ticker: 'XOM', quantity: 25, averagePrice: 110.00 },
            { ticker: 'NVDA', quantity: 2, averagePrice: 850.00 },
        ];
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log('Using REAL API Placeholder for getPositions');
         if (!REAL_API_ENDPOINT || !REAL_API_KEY || !REAL_SECRET_KEY) {
             console.error("Real API endpoint, key, or secret not configured in .env");
             throw new Error("Broker API not configured for getPositions.");
        }
        try {
            // Example using fetch (replace with SDK call):
            // const response = await fetch(`${REAL_API_ENDPOINT}/v2/positions`, { // Example endpoint
            //     headers: {
            //          'Authorization': `Bearer ${REAL_API_KEY}`, // Or your specific auth
            //          'Accept': 'application/json',
            //     },
            // });
            // if (!response.ok) {
            //      throw new Error(`API Error: ${response.status} ${response.statusText}`);
            // }
            // const data = await response.json();
            // // Map the response data to the Position[] interface
            // return data.map((pos: any) => ({
            //     ticker: pos.symbol, // Adjust field names
            //     quantity: parseFloat(pos.qty),
            //     averagePrice: parseFloat(pos.avg_entry_price),
            // }));

            // Placeholder: Return empty array or throw error until implemented
            console.warn("getPositions: Real API call not implemented. Returning empty array.");
            return [];

        } catch (error: any) {
            console.error("Error fetching positions from real API:", error);
            throw new Error(`Failed to fetch positions: ${error.message}`);
        }
    }
}

/**
 * Fetch historical price data for a given ticker and time range.
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
        // Mock Data Generation
        return generateMockHistoricalData(ticker, range);
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log(`Using REAL API Placeholder for getHistoricalData(${ticker}, ${range})`);
         if (!REAL_DATA_ENDPOINT || !REAL_API_KEY) {
             console.error("Real Data endpoint or key not configured in .env");
             throw new Error("Broker API not configured for getHistoricalData.");
        }
        try {
            // Example using fetch (replace with SDK call):
            // Determine start/end dates based on range
            // const endDate = new Date();
            // const startDate = new Date();
            // if (range === '1m') startDate.setMonth(endDate.getMonth() - 1);
            // else if (range === '6m') startDate.setMonth(endDate.getMonth() - 6);
            // else if (range === '1y') startDate.setFullYear(endDate.getFullYear() - 1);
            // else throw new Error("Invalid range specified");
            //
            // const timeframe = '1D'; // Daily bars
            //
            // const response = await fetch(`${REAL_DATA_ENDPOINT}/v2/stocks/${ticker}/bars?timeframe=${timeframe}&start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`, { // Example endpoint
            //     headers: { 'Authorization': `Bearer ${REAL_API_KEY}` },
            // });
            //
            // if (!response.ok) {
            //     throw new Error(`API Error fetching historical data: ${response.status}`);
            // }
            // const data = await response.json();
            //
            // // Map response to { date: string, value: number }[]
            // return data.bars.map((bar: any) => ({
            //     date: bar.t.split('T')[0], // Assuming timestamp 't' is in ISO format
            //     value: parseFloat(bar.c), // Closing price 'c'
            // }));

             // Placeholder: Return mock data or throw until implemented
            console.warn(`getHistoricalData(${ticker}, ${range}): Real API call not implemented. Returning mock data.`);
            return generateMockHistoricalData(ticker, range); // Fallback to mock for placeholders

        } catch (error: any) {
            console.error(`Error fetching historical data for ${ticker} from real API:`, error);
            throw new Error(`Failed to fetch historical data for ${ticker}: ${error.message}`);
        }
    }
 }

/**
 * Asynchronously retrieves the top market movers (gainers and losers).
 *
 * @param count The number of gainers/losers to retrieve (e.g., 5).
 * @returns A promise resolving to an object containing arrays of gainers and losers.
 */
export async function getTopMovers(count: number = 5): Promise<{ gainers: Instrument[], losers: Instrument[] }> {
    console.log(`API Call: getTopMovers(count=${count})`);
    await simulateDelay(MOCK_API_DELAY_MS.SLOW);
    simulateError('Failed to fetch top market movers.');

    if (USE_MOCK_API) {
        // Mock Data Generation
        const instruments = await getMockInstruments(); // Use mock generator
        const moversData = await Promise.all(
            instruments.map(async (inst) => {
                try {
                    // Use non-error throwing version for generating this list
                    const marketData = await getMarketDataNoError(inst.ticker);
                    return {
                        ...inst,
                        price: marketData.price,
                        changePercent: marketData.changePercent,
                    };
                } catch (e) {
                    return null; // Ignore instruments that fail to fetch data
                }
            })
        );
        const validMovers = moversData.filter(m => m && typeof m.changePercent === 'number') as (Instrument & { price: number; changePercent: number })[];
        validMovers.sort((a, b) => b.changePercent - a.changePercent);
        const gainers = validMovers.slice(0, count);
        const losers = validMovers.slice(-count).reverse();
        return { gainers, losers };
    } else {
        // ** REAL API INTEGRATION POINT **
        console.log(`Using REAL API Placeholder for getTopMovers(${count})`);
         if (!REAL_DATA_ENDPOINT || !REAL_API_KEY) {
             console.error("Real Data endpoint or key not configured in .env");
             throw new Error("Broker API not configured for getTopMovers.");
        }
        try {
            // Example using fetch (replace with SDK call):
            // Many APIs provide direct endpoints for gainers/losers.
            // Example: Fetching top gainers
            // const gainersResponse = await fetch(`${REAL_DATA_ENDPOINT}/v1/market/gainers?limit=${count}`, { // Example endpoint
            //     headers: { 'Authorization': `Bearer ${REAL_API_KEY}` },
            // });
            // if (!gainersResponse.ok) throw new Error(`API Error fetching gainers: ${gainersResponse.status}`);
            // const gainersData = await gainersResponse.json();
            //
            // // Example: Fetching top losers
            // const losersResponse = await fetch(`${REAL_DATA_ENDPOINT}/v1/market/losers?limit=${count}`, { // Example endpoint
            //     headers: { 'Authorization': `Bearer ${REAL_API_KEY}` },
            // });
            // if (!losersResponse.ok) throw new Error(`API Error fetching losers: ${losersResponse.status}`);
            // const losersData = await losersResponse.json();
            //
            // // Map responses to Instrument[] interface
            // const mapMover = (mover: any): Instrument => ({
            //     ticker: mover.symbol,
            //     name: mover.name, // May need separate call if name isn't included
            //     price: parseFloat(mover.price),
            //     changePercent: parseFloat(mover.changesPercentage),
            // });
            //
            // return {
            //     gainers: gainersData.map(mapMover),
            //     losers: losersData.map(mapMover),
            // };

             // Placeholder: Return mock data or throw until implemented
            console.warn(`getTopMovers(${count}): Real API call not implemented. Returning mock data.`);
            // Simulate fetching movers based on mock instruments for placeholder
            const mockInstruments = await getMockInstruments();
            const mockMoversData = await Promise.all(
                mockInstruments.map(async (inst) => {
                    const marketData = await getMarketDataNoError(inst.ticker); // Use no-error version
                    return { ...inst, price: marketData.price, changePercent: marketData.changePercent };
                })
            );
             const validMovers = mockMoversData.filter(m => m && typeof m.changePercent === 'number') as (Instrument & { price: number; changePercent: number })[];
            validMovers.sort((a, b) => b.changePercent - a.changePercent);
            return { gainers: validMovers.slice(0, count), losers: validMovers.slice(-count).reverse() };

        } catch (error: any) {
            console.error(`Error fetching top movers from real API:`, error);
            throw new Error(`Failed to fetch top movers: ${error.message}`);
        }
    }
}

// --- Mock Data Generation Functions (Internal) ---

/** Generates mock market data for a ticker. */
function generateMockMarketData(ticker: string): MarketData {
    const basePrice = getBasePriceForTicker(ticker);
    const previousClose = basePrice * (1 + (Math.random() - 0.5) * 0.02);
    const price = previousClose * (1 + (Math.random() - 0.45) * 0.03);
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
     // Use non-error-throwing variant for generating history base value
     currentMarketData = await getMarketDataNoError(ticker);
   } catch (err) {
      console.warn(`Could not fetch current market data for ${ticker} while generating history, using base price.`);
      currentMarketData = getBaseMarketData(ticker);
   }
   let currentValue = currentMarketData.price;

   const rangeFactor = { '1m': 0.05, '6m': 0.15, '1y': 0.25 }[range] || 0.05;
   currentValue *= (1 + (Math.random() - 0.6) * rangeFactor);

   const timeDiff = endDate.getTime() - startDate.getTime();
   const dailyVolatility = ['TSLA', 'NVDA', 'BTC-USD', 'ETH-USD'].includes(ticker) ? 0.04 : 0.025;
   const drift = 1.0001 + (Math.random() - 0.3) * 0.0005;

   for (let i = numPoints -1 ; i >= 0; i--) {
       const date = new Date(endDate.getTime() - (timeDiff * i) / numPoints);
       data.push({
           date: date.toISOString().split('T')[0],
           value: parseFloat(currentValue.toFixed(2)),
       });
       currentValue /= drift;
       currentValue /= (1 + (Math.random() - 0.5) * dailyVolatility);
       currentValue = Math.max(currentValue, 1);
   }
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

   if (data.length > 0 && currentMarketData) {
       data[data.length - 1].value = currentMarketData.price;
   }

   return data;
}

/** Returns the base price for mock data generation. */
function getBasePriceForTicker(ticker: string): number {
    return {
        'AAPL': 190, 'GOOGL': 175, 'MSFT': 430, 'AMZN': 185, 'TSLA': 180,
        'NVDA': 920, 'VOO': 510, 'AGG': 96, 'JPM': 195, 'XOM': 115,
        'VNQ': 85, 'GLD': 215, 'BTC-USD': 68000, 'ETH-USD': 3500,
        'SPY': 550, 'QQQ': 480, 'DIA': 400
      }[ticker] || 100; // Default base price
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

/** Internal helper: Gets base market data without delay or errors. */
function getBaseMarketData(ticker: string): MarketData {
    const price = getBasePriceForTicker(ticker);
    return { ticker, price, timestamp: new Date() };
}

/** Internal helper: Fetches market data without simulating errors or delay. */
 async function getMarketDataNoError(ticker: string): Promise<MarketData> {
    if (!USE_MOCK_API) {
        // Attempt real fetch if not using mock, but don't throw - fallback to mock
        try {
            // ** PASTE REAL API LOGIC HERE without delay/error simulation **
            // For now, just log and fallback
            console.log(`getMarketDataNoError: Attempting real API call placeholder for ${ticker}`);
             return generateMockMarketData(ticker); // Fallback
        } catch (realApiError) {
             console.warn(`getMarketDataNoError: Real API failed for ${ticker}, falling back to mock. Error: ${realApiError}`);
              return generateMockMarketData(ticker);
        }
    }
    // Always return mock data if USE_MOCK_API is true
    return generateMockMarketData(ticker);
}

// --- Potential Future Additions ---
// - Authentication management (OAuth 2.0 flows, token refresh)
// - WebSocket connection for real-time data streams
// - More specific error handling (rate limits, invalid ticker, auth errors)
// - Functions for:
//   - Fetching order status (getOrderStatus(orderId))
//   - Cancelling orders (cancelOrder(orderId))
//   - Fetching account balance/buying power (getAccountDetails())
//   - Managing watchlists
//   - Fetching company profiles, news, analyst ratings etc.
//   - Handling different asset types (options, crypto specifics)
