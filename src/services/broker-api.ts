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
     // Add more diverse options
    { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
    { ticker: 'XOM', name: 'Exxon Mobil Corporation' },
    { ticker: 'VNQ', name: 'Vanguard Real Estate ETF' },
    { ticker: 'GLD', name: 'SPDR Gold Shares' },
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

  // Simulate some price variation - More realistic base prices
  const basePrice = {
    'AAPL': 190,
    'GOOGL': 175,
    'MSFT': 430,
    'AMZN': 185,
    'TSLA': 180,
    'NVDA': 120, // Adjusted post-split assumption
    'VOO': 510,
    'AGG': 96,
    'JPM': 195,
    'XOM': 115,
    'VNQ': 85,
    'GLD': 215
  }[ticker] || 100; // Default price if ticker not found
  const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.03); // +/- 3% fluctuation

  return {
    ticker: ticker,
    price: parseFloat(price.toFixed(2)),
    timestamp: new Date(),
  };
}

/**
 * Asynchronously submits an order for buying or selling a financial instrument.
 * In a real app, this would interact with a broker's API.
 *
 * @param order The order details to submit.
 * @returns A promise that resolves to the submitted Order object, potentially updated with an ID and status from the broker.
 */
export async function submitOrder(order: Order): Promise<Order> {
  // TODO: Implement this by calling a real brokerage API to place the trade.
  // Ensure proper error handling and confirmation mechanisms are in place.
  console.log(`Simulating order submission: ${order.type} ${order.quantity} shares of ${order.ticker} (${order.orderPriceType || 'market'})`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate slightly longer network delay for orders

  // In a real scenario, you would handle the API response here.
  // The broker might return an order ID and initial status (e.g., 'pending' or 'accepted').
  const submittedOrder: Order = {
      ...order,
      id: `mock_order_${Date.now()}_${Math.random().toString(16).substring(2, 8)}`, // Generate a mock ID
      status: 'pending', // Initial status
      createdAt: new Date(),
      updatedAt: new Date(),
      orderPriceType: order.orderPriceType || 'market', // Default to market if not specified
  };

  console.log(`Mock order for ${order.ticker} submitted with ID: ${submittedOrder.id}. Status: ${submittedOrder.status}`);

  // Simulate potential fill after a delay (optional, for more realism)
  // setTimeout(async () => {
  //    const finalStatus = Math.random() < 0.9 ? 'filled' : 'rejected'; // 90% success rate
  //    console.log(`Mock order ${submittedOrder.id} status updated to: ${finalStatus}`);
  //    // In a real app, you might update the order status via webhook or polling
  //    // updateOrderStatus(submittedOrder.id, finalStatus, marketPrice);
  // }, 2000);


  return submittedOrder; // Return the submitted order details
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

  // Example mock positions - Added more diverse holdings
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
       numPoints = 252; // Trading days approximation
       break;
     default:
       startDate.setMonth(endDate.getMonth() - 1);
   }

   const data = [];
   // Fetch a semi-realistic starting price based on current mocked price
    const currentMarketData = await getMarketData(ticker);
    let currentValue = currentMarketData.price;
    // Adjust starting value based on range to simulate trend (very basic simulation)
    if (range === '6m') currentValue *= (1 + (Math.random() - 0.6) * 0.15); // Wider fluctuation for 6m
    if (range === '1y') currentValue *= (1 + (Math.random() - 0.6) * 0.25); // Wider fluctuation for 1y


   const timeDiff = endDate.getTime() - startDate.getTime();

   for (let i = 0; i < numPoints; i++) {
     const date = new Date(startDate.getTime() + (timeDiff * i) / numPoints);
     // Simulate daily volatility - slightly higher for potentially more volatile stocks
     const volatilityFactor = ['TSLA', 'NVDA'].includes(ticker) ? 0.04 : 0.025;
     currentValue += (Math.random() - 0.5) * (currentValue * volatilityFactor);
     currentValue = Math.max(currentValue, 1); // Ensure price doesn't go too low

     // Add slight upward drift bias over time
     currentValue *= 1.0001;

     data.push({
       date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
       value: parseFloat(currentValue.toFixed(2)),
     });
   }

    // Ensure the last point is close to the current fetched price for consistency
   if (data.length > 0) {
       data[data.length - 1].value = currentMarketData.price;
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
// - Function to get order status by ID.
// - Function to cancel an order.
// - Function to fetch account balance / buying power.
