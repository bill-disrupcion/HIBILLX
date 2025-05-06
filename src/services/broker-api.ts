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

/**
 * Asynchronously retrieves a list of available financial instruments.
 *
 * @returns A promise that resolves to an array of Instrument objects.
 */
export async function getInstruments(): Promise<Instrument[]> {
  // TODO: Replace this mock data with a real API call to a financial data provider.
  // Example: Fetch from Alpha Vantage, IEX Cloud, or a brokerage API.
  console.log('Using mock data for getInstruments');
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay

  return [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.' },
    { ticker: 'MSFT', name: 'Microsoft Corp.'},
    { ticker: 'AMZN', name: 'Amazon.com, Inc.'},
    { ticker: 'TSLA', name: 'Tesla, Inc.'},
    { ticker: 'NVDA', name: 'NVIDIA Corporation'},
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF'},
    { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF'},
  ];
}

/**
 * Asynchronously retrieves real-time market data for a given instrument.
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
  // TODO: Replace this mock data with a real API call to a market data provider.
  // Example: Fetch real-time price data from a WebSocket or REST API.
  console.log(`Using mock data for getMarketData(${ticker})`);
  await new Promise(resolve => setTimeout(resolve, 150)); // Simulate network delay

  // Simulate some price variation
  const basePrice = {
    'AAPL': 175,
    'GOOGL': 150,
    'MSFT': 450,
    'AMZN': 180,
    'TSLA': 185,
    'NVDA': 125,
    'VOO': 500,
    'AGG': 98
  }[ticker] || 100;
  const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.05); // +/- 5% fluctuation

  return {
    ticker: ticker,
    price: parseFloat(price.toFixed(2)),
    timestamp: new Date(),
  };
}

/**
 * Asynchronously submits an order for buying or selling a financial instrument.
 *
 * @param order The order to submit.
 * @returns A promise that resolves when the order is successfully submitted.
 */
export async function submitOrder(order: Order): Promise<void> {
  // TODO: Implement this by calling a real brokerage API to place the trade.
  // Ensure proper error handling and confirmation mechanisms are in place.
  console.log(`Simulating order submission: ${order.type} ${order.quantity} shares of ${order.ticker}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // In a real scenario, you would handle the API response here.
  // For example, confirming the order was filled or partially filled.
  console.log(`Mock order for ${order.ticker} processed successfully.`);
  return;
}

/**
 * Asynchronously retrieves the current positions in the portfolio.
 *
 * @returns A promise that resolves to an array of Position objects.
 */
export async function getPositions(): Promise<Position[]> {
  // TODO: Replace this mock data with a real API call to a brokerage API to fetch current holdings.
  console.log('Using mock data for getPositions');
  await new Promise(resolve => setTimeout(resolve, 400)); // Simulate network delay

  // Example mock positions
  return [
    { ticker: 'AAPL', quantity: 10, averagePrice: 145.00 },
    { ticker: 'GOOGL', quantity: 5, averagePrice: 130.00 },
    { ticker: 'VOO', quantity: 20, averagePrice: 480.50 },
     { ticker: 'TSLA', quantity: 8, averagePrice: 170.25 },
  ];
}

/**
 * Fetch historical data for a given ticker.
 * @param ticker The ticker symbol.
 * @param range The time range (e.g., '1m', '6m', '1y').
 * @returns A promise resolving to historical data points.
 */
 export async function getHistoricalData(ticker: string, range: string): Promise<{ date: string; value: number }[]> {
   // TODO: Implement this by calling a real financial data API (e.g., Alpha Vantage, IEX Cloud).
   console.log(`Using mock data for getHistoricalData(${ticker}, ${range})`);
   await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay

   // Generate simple mock historical data
   const endDate = new Date();
   let startDate = new Date();
   let numPoints = 30; // Default to 1 month approx

   switch (range) {
     case '1m':
       startDate.setMonth(endDate.getMonth() - 1);
       numPoints = 30;
       break;
     case '6m':
       startDate.setMonth(endDate.getMonth() - 6);
       numPoints = 180;
       break;
     case '1y':
       startDate.setFullYear(endDate.getFullYear() - 1);
       numPoints = 365;
       break;
     default:
       startDate.setMonth(endDate.getMonth() - 1);
   }

   const data = [];
   let currentValue = (await getMarketData(ticker)).price; // Start near current price
   const timeDiff = endDate.getTime() - startDate.getTime();

   for (let i = 0; i < numPoints; i++) {
     const date = new Date(startDate.getTime() + (timeDiff * i) / numPoints);
     currentValue += (Math.random() - 0.5) * (currentValue * 0.03); // Simulate daily fluctuation
     currentValue = Math.max(currentValue, 0); // Ensure price doesn't go negative
     data.push({
       date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
       value: parseFloat(currentValue.toFixed(2)),
     });
   }

   return data;
 }


// Potential future additions:
// - Function to fetch detailed company profile information.
// - Function to get upcoming earnings dates.
// - Function to fetch analyst ratings.
// - Integration with news APIs (e.g., NewsAPI, Finnhub).
// - Functions for more complex order types (limit orders, stop-loss, etc.).
// - Functions for managing watchlists.
// - Authentication handling for brokerage APIs.
