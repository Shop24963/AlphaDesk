import { Server, Socket } from 'socket.io';
import { MarketDataService } from '../modules/market/market.service';
import { logger } from '../../common/utils/logger';

interface ClientSubscription {
  symbols: Set<string>;
  rooms: Set<string>;
}

export class WebSocketService {
  private io: Server | null = null;
  private subscriptions: Map<string, ClientSubscription> = new Map();
  private marketDataService: MarketDataService;
  private updateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.marketDataService = new MarketDataService();
  }

  initialize(io: Server): void {
    this.io = io;
    this.setupSocketHandlers();
    this.startMarketDataStream();
    logger.info('WebSocket service initialized');
  }

  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Initialize client subscription
      this.subscriptions.set(socket.id, { symbols: new Set(), rooms: new Set() });

      // Join user-specific room for private alerts/updates
      socket.on('join:user', (userId: string) => {
        socket.join(`user:${userId}`);
        this.subscriptions.get(socket.id)?.rooms.add(`user:${userId}`);
        logger.debug(`Client ${socket.id} joined user room: user:${userId}`);
      });

      // Subscribe to market data
      socket.on('subscribe:market', (symbols: string[]) => {
        const clientSub = this.subscriptions.get(socket.id);
        if (!clientSub) return;

        symbols.forEach((symbol) => {
          clientSub.symbols.add(symbol);
          socket.join(`market:${symbol}`);
        });
        logger.debug(`Client ${socket.id} subscribed to: ${symbols.join(', ')}`);
      });

      // Unsubscribe
      socket.on('unsubscribe:market', (symbols: string[]) => {
        const clientSub = this.subscriptions.get(socket.id);
        if (!clientSub) return;

        symbols.forEach((symbol) => {
          clientSub.symbols.delete(symbol);
          socket.leave(`market:${symbol}`);
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        this.subscriptions.delete(socket.id);
      });
    });
  }

  private startMarketDataStream(): void {
    // Simulate real-time ticks every 2 seconds
    // In production, this would connect to a real exchange feed
    this.updateInterval = setInterval(async () => {
      if (!this.io) return;

      try {
        // Get active symbols from subscriptions
        const activeSymbols = new Set<string>();
        this.subscriptions.forEach((sub) => {
          sub.symbols.forEach((s) => activeSymbols.add(s));
        });

        if (activeSymbols.size === 0) return;

        // Fetch updated quotes (Mock implementation)
        const symbolsArray = Array.from(activeSymbols);
        const quotes = await this.marketDataService.getQuotes(symbolsArray);

        // Emit to respective rooms
        quotes.forEach((quote) => {
          this.io?.to(`market:${quote.symbol}`).emit('market:tick', quote);
        });

        // Emit global market status update
        const overview = await this.marketDataService.getMarketOverview();
        this.io.to('market:global').emit('market:overview', overview);

      } catch (error) {
        logger.error('Error in market data stream', error);
      }
    }, 2000);
  }

  public emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcast(event: string, data: any): void {
    if (!this.io) return;
    this.io.emit(event, data);
  }

  public stop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const wsService = new WebSocketService();
