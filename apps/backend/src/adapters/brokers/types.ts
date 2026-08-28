/**
 * Broker Profile interface
 */
export interface BrokerProfile {
  userId: string;
  brokerName: string;
  clientId: string;
  accountType: 'individual' | 'corporate' | 'demat';
  isActive: boolean;
}

/**
 * Funds interface
 */
export interface Funds {
  availableCash: number;
  marginUsed: number;
  marginAvailable: number;
  totalEquity: number;
  collateral: number;
}

/**
 * Holding interface
 */
export interface Holding {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  lastPrice: number;
  pnl: number;
  pnlPercent: number;
  exchange: string;
  isin: string;
}

/**
 * Position interface
 */
export interface Position {
  symbol: string;
  quantity: number;
  averagePrice: number;
  lastPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  productType: 'delivery' | 'intraday' | 'margin';
  side: 'long' | 'short';
  exchange: string;
}

/**
 * Order interface
 */
export interface Order {
  orderId: string;
  symbol: string;
  exchange: string;
  productType: 'delivery' | 'intraday' | 'margin';
  orderType: 'market' | 'limit' | 'stoploss' | 'sl-m';
  transactionType: 'buy' | 'sell';
  quantity: number;
  price: number;
  triggerPrice?: number;
  status: 'pending' | 'open' | 'complete' | 'rejected' | 'cancelled';
  filledQuantity: number;
  averagePrice: number;
  timestamp: Date;
}

/**
 * Place Order Request
 */
export interface PlaceOrderRequest {
  symbol: string;
  exchange: string;
  productType: 'delivery' | 'intraday' | 'margin';
  orderType: 'market' | 'limit' | 'stoploss' | 'sl-m';
  transactionType: 'buy' | 'sell';
  quantity: number;
  price?: number;
  triggerPrice?: number;
}

/**
 * Modify Order Request
 */
export interface ModifyOrderRequest {
  orderId: string;
  quantity?: number;
  price?: number;
  triggerPrice?: number;
  orderType?: 'market' | 'limit' | 'stoploss' | 'sl-m';
}

/**
 * Broker Adapter Interface
 * Abstracts broker-specific implementations
 */
export interface BrokerAdapter {
  /**
   * Authenticate with broker
   */
  authenticate(): Promise<void>;

  /**
   * Disconnect from broker
   */
  disconnect(): Promise<void>;

  /**
   * Get user profile
   */
  getProfile(): Promise<BrokerProfile>;

  /**
   * Get funds/margin details
   */
  getFunds(): Promise<Funds>;

  /**
   * Get holdings
   */
  getHoldings(): Promise<Holding[]>;

  /**
   * Get positions
   */
  getPositions(): Promise<Position[]>;

  /**
   * Get orders
   */
  getOrders(): Promise<Order[]>;

  /**
   * Place a new order
   */
  placeOrder(order: PlaceOrderRequest): Promise<Order>;

  /**
   * Modify an existing order
   */
  modifyOrder(order: ModifyOrderRequest): Promise<Order>;

  /**
   * Cancel an order
   */
  cancelOrder(orderId: string): Promise<void>;
}
