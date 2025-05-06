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
  // TODO: Implement this by calling an API.

  return [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  ];
}

/**
 * Asynchronously retrieves real-time market data for a given instrument.
 *
 * @param ticker The ticker symbol of the instrument.
 * @returns A promise that resolves to a MarketData object.
 */
export async function getMarketData(ticker: string): Promise<MarketData> {
  // TODO: Implement this by calling an API.

  return {
    ticker: ticker,
    price: 150.00,
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
  // TODO: Implement this by calling an API.
  console.log(`Order submitted: ${order.type} ${order.quantity} shares of ${order.ticker}`);
  return;
}

/**
 * Asynchronously retrieves the current positions in the portfolio.
 *
 * @returns A promise that resolves to an array of Position objects.
 */
export async function getPositions(): Promise<Position[]> {
  // TODO: Implement this by calling an API.

  return [
    { ticker: 'AAPL', quantity: 10, averagePrice: 145.00 },
    { ticker: 'GOOGL', quantity: 5, averagePrice: 2700.00 },
  ];
}
