
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
const MOCK_API_DELAY_MS = {
    FAST: 250, // Increased delay
    MEDIUM: 500, // Increased delay
    SLOW: 800, // Increased delay
};
const MOCK_API_ERROR_RATE = 0.05; // 5% chance of simulated API error

// --- Helper Functions ---
/** Simulates network delay */
const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Simulates potential API errors */
const simulateError = (message: string) => {
  if (Math.random() < MOCK_API_ERROR_RATE) {
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
 * @throws Simulated API Error occasionally.
 */
export async function getInstruments(): Promise<Instrument[]> {
  console.log('API Call: getInstruments');
  await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
  simulateError('Failed to fetch instruments list.');

  // ** REAL API INTEGRATION POINT **
  // Replace with:
  // const response = await fetch('YOUR_INSTRUMENT_API_ENDPOINT');
  // if (!response.ok) throw new Error('Failed to fetch instruments');
  // const data = await response.json();
  // return data.map(item => ({ ticker: item.symbol, name: item.companyName }));

  // Mock Data:
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
  ];
}

/**
 * Asynchronously retrieves real-time or near real-time market data for a given instrument.
 * In a real app, this would fetch from a market data provider (REST or WebSocket).
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 * @throws Simulated API Error occasionally.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
  console.log(`API Call: getMarketData(${ticker})`);
  await simulateDelay(MOCK_API_DELAY_MS.FAST);
  simulateError(`Failed to fetch market data for ${ticker}.`);

  // ** REAL API INTEGRATION POINT **
  // Replace with:
  // const response = await fetch(`YOUR_MARKET_DATA_API_ENDPOINT?symbol=${ticker}`);
  // if (!response.ok) throw new Error(`Failed to fetch market data for ${ticker}`);
  // const data = await response.json();
  // return { ticker: data.symbol, price: data.latestPrice, timestamp: new Date(data.latestUpdate) };

  // Mock Data:
  const basePrice = {
    'AAPL': 190, 'GOOGL': 175, 'MSFT': 430, 'AMZN': 185, 'TSLA': 180,
    'NVDA': 120, 'VOO': 510, 'AGG': 96, 'JPM': 195, 'XOM': 115,
    'VNQ': 85, 'GLD': 215
  }[ticker] || 100;
  const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.03);

  return {
    ticker: ticker,
    price: parseFloat(price.toFixed(2)),
    timestamp: new Date(),
  };
}

/**
 * Asynchronously submits an order for buying or selling a financial instrument.
 * Interacts with a broker's API. Requires authentication and error handling.
 *
 * @param order The order details to submit.
 * @returns A promise that resolves to the submitted Order object, updated with ID and status.
 * @throws Simulated API Error occasionally, or specific errors like 'Insufficient Funds'.
 */
export async function submitOrder(order: Order): Promise<Order> {
  console.log(`API Call: submitOrder(${order.type} ${order.quantity} ${order.ticker})`);
  await simulateDelay(MOCK_API_DELAY_MS.SLOW);

  // Simulate specific errors like insufficient funds before the general error simulation
  if (order.type === 'buy' && Math.random() < 0.03) { // 3% chance of insufficient funds
      console.warn(`Simulating API Error: Insufficient funds for ${order.ticker} order.`);
      throw new Error('Simulated API Error: Insufficient funds.');
  }
  simulateError(`Failed to submit order for ${order.ticker}.`);


  // ** REAL API INTEGRATION POINT **
  // Replace with:
  // const response = await fetch('YOUR_BROKER_ORDER_API_ENDPOINT', {
  //   method: 'POST',
  //   headers: { 'Authorization': 'Bearer YOUR_AUTH_TOKEN', 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     symbol: order.ticker,
  //     qty: order.quantity,
  //     side: order.type,
  //     type: order.orderPriceType || 'market', // 'market', 'limit', etc.
  //     time_in_force: 'day', // 'day', 'gtc', etc.
  //     limit_price: order.limitPrice, // Required if type is 'limit'
  //   }),
  // });
  // if (!response.ok) {
  //      const errorData = await response.json();
  //      throw new Error(`Order submission failed: ${errorData.message || response.statusText}`);
  // }
  // const brokerResponse = await response.json();
  // return {
  //      ...order,
  //      id: brokerResponse.id,
  //      status: brokerResponse.status, // e.g., 'accepted', 'pending_new'
  //      createdAt: new Date(brokerResponse.created_at),
  //      updatedAt: new Date(brokerResponse.updated_at),
  // };

  // Mock Response:
  const submittedOrder: Order = {
      ...order,
      id: `mock_order_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`,
      status: 'pending', // Broker typically confirms acceptance first
      createdAt: new Date(),
      updatedAt: new Date(),
      orderPriceType: order.orderPriceType || 'market',
  };
  console.log(`Mock order ${submittedOrder.id} (${order.ticker}) accepted by broker. Status: ${submittedOrder.status}`);
  return submittedOrder;
}

/**
 * Asynchronously retrieves the current positions in the portfolio.
 * Fetches from a brokerage API. Requires authentication.
 *
 * @returns A promise that resolves to an array of Position objects.
 * @throws Simulated API Error occasionally.
 */
export async function getPositions(): Promise<Position[]> {
  console.log('API Call: getPositions');
  await simulateDelay(MOCK_API_DELAY_MS.MEDIUM);
  simulateError('Failed to fetch portfolio positions.');

  // ** REAL API INTEGRATION POINT **
  // Replace with:
  // const response = await fetch('YOUR_BROKER_POSITIONS_API_ENDPOINT', {
  //   headers: { 'Authorization': 'Bearer YOUR_AUTH_TOKEN' },
  // });
  // if (!response.ok) throw new Error('Failed to fetch positions');
  // const data = await response.json();
  // return data.map(item => ({
  //      ticker: item.symbol,
  //      quantity: parseFloat(item.qty),
  //      averagePrice: parseFloat(item.avg_entry_price),
  // }));

  // Mock Data:
  return [
    { ticker: 'AAPL', quantity: 15, averagePrice: 165.50 },
    { ticker: 'MSFT', quantity: 10, averagePrice: 400.00 },
    { ticker: 'VOO', quantity: 30, averagePrice: 490.20 },
    { ticker: 'TSLA', quantity: 5, averagePrice: 190.75 },
    { ticker: 'AGG', quantity: 50, averagePrice: 97.10 },
    { ticker: 'XOM', quantity: 25, averagePrice: 110.00 },
  ];
}

/**
 * Fetch historical price data for a given ticker and time range.
 * Fetches from a financial data API.
 *
 * @param ticker The ticker symbol.
 * @param range The time range ('1m', '6m', '1y').
 * @returns A promise resolving to an array of historical data points.
 * @throws Simulated API Error occasionally.
 */
 export async function getHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
   console.log(`API Call: getHistoricalData(${ticker}, ${range})`);
   await simulateDelay(MOCK_API_DELAY_MS.SLOW); // Historical data can be slower
   simulateError(`Failed to fetch historical data for ${ticker} (${range}).`);

   // ** REAL API INTEGRATION POINT **
   // Replace with API call, e.g., Alpha Vantage TIME_SERIES_DAILY_ADJUSTED
   // or similar endpoints from other providers based on the 'range'.
   // You'll need to parse the API response into the { date: string; value: number } format.
   // Example structure (pseudo-code):
   // const response = await fetch(`YOUR_HISTORICAL_API_ENDPOINT?symbol=${ticker}&range=${range}`);
   // if (!response.ok) throw new Error('Failed to fetch historical data');
   // const data = await response.json();
   // const timeSeries = data['Time Series (Daily)']; // Adjust based on API response structure
   // return Object.entries(timeSeries)
   //    .map(([date, values]) => ({
   //      date: date,
   //      value: parseFloat(values['4. close']), // Or adjusted close
   //    }))
   //    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // Ensure ascending order
   //    .slice(-numberOfPointsBasedOnRange); // Trim to the desired range

   // Mock Data Generation:
   const endDate = new Date();
   let startDate = new Date();
   let numPoints = 30;

   switch (range) {
     case '1m': startDate.setMonth(endDate.getMonth() - 1); numPoints = 22; break; // Approx trading days
     case '6m': startDate.setMonth(endDate.getMonth() - 6); numPoints = 126; break;
     case '1y': startDate.setFullYear(endDate.getFullYear() - 1); numPoints = 252; break;
     default: startDate.setMonth(endDate.getMonth() - 1); numPoints = 22;
   }

   const data = [];
   let currentMarketData: MarketData | null = null;
   try {
     currentMarketData = await getMarketData(ticker); // Use current as a reference
   } catch (err) {
      console.warn(`Could not fetch current market data for ${ticker} while generating history, using base price.`);
      const basePrice = {
        'AAPL': 190, 'GOOGL': 175, 'MSFT': 430, 'AMZN': 185, 'TSLA': 180,
        'NVDA': 120, 'VOO': 510, 'AGG': 96, 'JPM': 195, 'XOM': 115,
        'VNQ': 85, 'GLD': 215
      }[ticker] || 100;
       currentMarketData = { ticker, price: basePrice, timestamp: new Date() };
   }
   let currentValue = currentMarketData.price;


   // Adjust starting value crudely based on range
   const rangeFactor = { '1m': 0.05, '6m': 0.15, '1y': 0.25 }[range] || 0.05;
   currentValue *= (1 + (Math.random() - 0.6) * rangeFactor); // Start lower/higher based on random trend

   const timeDiff = endDate.getTime() - startDate.getTime();
   const dailyVolatility = ['TSLA', 'NVDA'].includes(ticker) ? 0.04 : 0.025;
   const drift = 1.0001; // Slight upward bias

   for (let i = numPoints -1 ; i >= 0; i--) { // Generate backwards from end date
       const date = new Date(endDate.getTime() - (timeDiff * i) / numPoints);
       data.push({
           date: date.toISOString().split('T')[0],
           value: parseFloat(currentValue.toFixed(2)),
       });
       // Simulate next day's price based on previous
       currentValue /= drift; // Reverse drift
       currentValue /= (1 + (Math.random() - 0.5) * dailyVolatility);
       currentValue = Math.max(currentValue, 1); // Ensure price doesn't go below 1
   }
    // Ensure data is sorted correctly by date ascending
    data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

   // Ensure the last point matches the 'current' price fetched for consistency
   if (data.length > 0 && currentMarketData) {
       data[data.length - 1].value = currentMarketData.price;
   }

   return data;
 }


// --- Potential Future Additions ---
// - Authentication management (store/refresh tokens securely)
// - WebSocket connection for real-time data streams
// - More specific error handling (e.g., rate limits, invalid ticker)
// - Functions for:
//   - Fetching order status (getOrderStatus(orderId))
//   - Cancelling orders (cancelOrder(orderId))
//   - Fetching account balance/buying power (getAccountDetails())
//   - Managing watchlists
//   - Fetching company profiles, news, analyst ratings etc.

