import {
  BrokerAdapter,
  BrokerProfile,
  Funds,
  Holding,
  Position,
  Order,
  PlaceOrderRequest,
  ModifyOrderRequest,
} from './types.js';
import { logger } from '@/common/logger.js';

/**
 * Paper Broker Adapter
 * Simulates broker functionality for paper trading
 * No real money involved - purely for testing and practice
 */
export class PaperBrokerAdapter implements BrokerAdapter {
  private profile: BrokerProfile | null = null;
  private orders: Map<string, Order> = new Map();
  private positions: Map<string, Position> = new Map();
  private holdings: Map<string, Holding> = new Map();
  private cash: number = 1000000; // Default 10L virtual cash
  private marginUsed: number = 0;

  constructor(private userId: string) {}

  async authenticate(): Promise<void> {
    logger.info(`Paper broker authentication for user ${this.userId}`);
    
    this.profile = {
      userId: this.userId,
      brokerName: 'Paper Trading',
      clientId: `PAPER_${this.userId}`,
      accountType: 'individual',
      isActive: true,
    };

    return Promise.resolve();
  }

  async disconnect(): Promise<void> {
    logger.info(`Paper broker disconnected for user ${this.userId}`);
    this.profile = null;
    return Promise.resolve();
  }

  async getProfile(): Promise<BrokerProfile> {
    if (!this.profile) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
    return Promise.resolve(this.profile);
  }

  async getFunds(): Promise<Funds> {
    const totalEquity = this.cash + this.marginUsed;
    
    return Promise.resolve({
      availableCash: this.cash,
      marginUsed: this.marginUsed,
      marginAvailable: this.cash,
      totalEquity,
      collateral: 0,
    });
  }

  async getHoldings(): Promise<Holding[]> {
    return Promise.resolve(Array.from(this.holdings.values()));
  }

  async getPositions(): Promise<Position[]> {
    return Promise.resolve(Array.from(this.positions.values()));
  }

  async getOrders(): Promise<Order[]> {
    return Promise.resolve(Array.from(this.orders.values()));
  }

  async placeOrder(order: PlaceOrderRequest): Promise<Order> {
    logger.info(`Paper order placed: ${order.transactionType} ${order.quantity} ${order.symbol}`);

    const orderId = `PAPER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate order execution (instant fill for paper trading)
    const simulatedPrice = order.price || this.getSimulatedPrice(order.symbol);
    const orderValue = simulatedPrice * order.quantity;

    // Check if sufficient funds
    if (order.transactionType === 'buy' && orderValue > this.cash) {
      throw new Error('Insufficient funds for this order');
    }

    // Update cash for buy orders
    if (order.transactionType === 'buy') {
      this.cash -= orderValue;
      
      // Update or create position
      const existingPosition = this.positions.get(order.symbol);
      if (existingPosition) {
        const totalQty = existingPosition.quantity + order.quantity;
        const totalCost = (existingPosition.averagePrice * existingPosition.quantity) + orderValue;
        existingPosition.averagePrice = totalCost / totalQty;
        existingPosition.quantity = totalQty;
      } else {
        this.positions.set(order.symbol, {
          symbol: order.symbol,
          quantity: order.quantity,
          averagePrice: simulatedPrice,
          lastPrice: simulatedPrice,
          currentPrice: simulatedPrice,
          pnl: 0,
          pnlPercent: 0,
          productType: order.productType,
          side: 'long',
          exchange: order.exchange,
        });
      }
    }

    const newOrder: Order = {
      orderId,
      symbol: order.symbol,
      exchange: order.exchange,
      productType: order.productType,
      orderType: order.orderType,
      transactionType: order.transactionType,
      quantity: order.quantity,
      price: simulatedPrice,
      triggerPrice: order.triggerPrice,
      status: 'complete',
      filledQuantity: order.quantity,
      averagePrice: simulatedPrice,
      timestamp: new Date(),
    };

    this.orders.set(orderId, newOrder);

    return Promise.resolve(newOrder);
  }

  async modifyOrder(order: ModifyOrderRequest): Promise<Order> {
    const existingOrder = this.orders.get(order.orderId);
    
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    if (existingOrder.status !== 'pending' && existingOrder.status !== 'open') {
      throw new Error('Cannot modify completed order');
    }

    logger.info(`Paper order modified: ${order.orderId}`);

    const modifiedOrder: Order = {
      ...existingOrder,
      quantity: order.quantity || existingOrder.quantity,
      price: order.price || existingOrder.price,
      triggerPrice: order.triggerPrice || existingOrder.triggerPrice,
      orderType: order.orderType || existingOrder.orderType,
    };

    this.orders.set(order.orderId, modifiedOrder);
    return Promise.resolve(modifiedOrder);
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status === 'complete') {
      throw new Error('Cannot cancel completed order');
    }

    logger.info(`Paper order cancelled: ${orderId}`);
    
    order.status = 'cancelled';
    this.orders.set(orderId, order);
    
    return Promise.resolve();
  }

  /**
   * Get simulated market price for a symbol
   * In production, this would fetch from market data provider
   */
  private getSimulatedPrice(symbol: string): number {
    // Simple simulation - in production use real market data
    const basePrices: Record<string, number> = {
      'RELIANCE': 2500,
      'TCS': 3600,
      'INFY': 1500,
      'HDFC': 2700,
      'ICICIBANK': 1000,
    };
    
    return basePrices[symbol] || 100 + Math.random() * 100;
  }

  /**
   * Update positions with current prices (for PnL calculation)
   */
  updatePositionPrices(prices: Map<string, number>): void {
    for (const [symbol, position] of this.positions.entries()) {
      const currentPrice = prices.get(symbol) || this.getSimulatedPrice(symbol);
      position.lastPrice = currentPrice;
      position.currentPrice = currentPrice;
      
      if (position.side === 'long') {
        position.pnl = (currentPrice - position.averagePrice) * position.quantity;
      } else {
        position.pnl = (position.averagePrice - currentPrice) * position.quantity;
      }
      
      position.pnlPercent = (position.pnl / (position.averagePrice * position.quantity)) * 100;
    }
  }
}

/**
 * Factory function to create broker adapter instances
 */
export const createBrokerAdapter = (userId: string, type: 'paper' | 'live' = 'paper'): BrokerAdapter => {
  if (type === 'paper') {
    return new PaperBrokerAdapter(userId);
  }
  
  // Live brokers will be implemented when integrations are added
  throw new Error('Live broker integration not yet implemented. Use paper trading mode.');
};
