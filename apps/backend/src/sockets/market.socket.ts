import { Server, Socket } from 'socket.io';
import { getQuote, subscribeMarketData, unsubscribeMarketData } from '../market/market.provider.js';

interface UserSocket extends Socket {
  userId?: string;
  subscribedSymbols: Set<string>;
}

export function setupMarketSockets(io: Server) {
  const marketNamespace = io.of('/market');

  marketNamespace.on('connection', (socket: UserSocket) => {
    console.log(`Client connected to market namespace: ${socket.id}`);
    
    socket.subscribedSymbols = new Set<string>();

    // Subscribe to market data for specific symbols
    socket.on('market:subscribe', async (data: { symbols: string[] }) => {
      try {
        const { symbols } = data;
        
        // Join room for each symbol
        symbols.forEach(symbol => {
          socket.join(`symbol:${symbol}`);
          socket.subscribedSymbols.add(symbol);
        });

        // Send current quotes
        const quotes = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const quote = await getQuote(symbol);
              return { symbol, ...quote };
            } catch (error) {
              return { symbol, error: 'Failed to fetch quote' };
            }
          })
        );

        socket.emit('market:data', quotes);
        console.log(`Client ${socket.id} subscribed to: ${symbols.join(', ')}`);
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Unsubscribe from symbols
    socket.on('market:unsubscribe', (data: { symbols: string[] }) => {
      const { symbols } = data;
      
      symbols.forEach(symbol => {
        socket.leave(`symbol:${symbol}`);
        socket.subscribedSymbols.delete(symbol);
      });

      console.log(`Client ${socket.id} unsubscribed from: ${symbols.join(', ')}`);
    });

    // Get single quote
    socket.on('market:quote', async (data: { symbol: string }) => {
      try {
        const { symbol } = data;
        const quote = await getQuote(symbol);
        socket.emit('market:quote', { symbol, ...quote });
      } catch (error: any) {
        socket.emit('error', { message: error.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
      
      // Leave all symbol rooms
      socket.subscribedSymbols.forEach(symbol => {
        socket.leave(`symbol:${symbol}`);
      });
    });

    // Handle errors
    socket.on('error', (error: Error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Real-time price updates (called from market data provider)
  marketNamespace.on('market:update', (data: { symbol: string; quote: any }) => {
    const { symbol, quote } = data;
    marketNamespace.to(`symbol:${symbol}`).emit('market:update', { symbol, ...quote });
  });

  return marketNamespace;
}

export function setupPortfolioSockets(io: Server) {
  const portfolioNamespace = io.of('/portfolio');

  portfolioNamespace.on('connection', (socket: UserSocket) => {
    console.log(`Client connected to portfolio namespace: ${socket.id}`);

    // Authenticate and join user room
    socket.on('portfolio:auth', (data: { userId: string }) => {
      const { userId } = data;
      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected to portfolio namespace`);
    });

    // Request portfolio update
    socket.on('portfolio:update', () => {
      if (socket.userId) {
        // Trigger portfolio recalculation
        console.log(`Portfolio update requested for user ${socket.userId}`);
        // In a real implementation, this would trigger a recalculation
        socket.emit('portfolio:updated', { timestamp: new Date() });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Portfolio client disconnected: ${socket.id}`);
    });
  });

  return portfolioNamespace;
}

export function setupAlertSockets(io: Server) {
  const alertNamespace = io.of('/alerts');

  alertNamespace.on('connection', (socket: UserSocket) => {
    console.log(`Client connected to alerts namespace: ${socket.id}`);

    // Authenticate and join user room
    socket.on('alerts:auth', (data: { userId: string }) => {
      const { userId } = data;
      socket.userId = userId;
      socket.join(`user:${userId}`);
      console.log(`User ${userId} connected to alerts namespace`);
    });

    socket.on('disconnect', () => {
      console.log(`Alerts client disconnected: ${socket.id}`);
    });
  });

  return alertNamespace;
}

// Helper function to emit portfolio updates
export async function emitPortfolioUpdate(io: Server, userId: string, data: any) {
  io.of('/portfolio').to(`user:${userId}`).emit('portfolio:updated', data);
}

// Helper function to emit trade updates
export async function emitTradeUpdate(io: Server, userId: string, data: any) {
  io.of('/portfolio').to(`user:${userId}`).emit('trade:updated', data);
}

// Helper function to emit order updates
export async function emitOrderUpdate(io: Server, userId: string, data: any) {
  io.of('/portfolio').to(`user:${userId}`).emit('order:updated', data);
}
