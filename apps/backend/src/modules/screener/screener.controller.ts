import { Request, Response, NextFunction } from 'express';
import { Stock } from '../stocks/stock.model';
import { marketDataProvider } from '../market/market.provider';

interface ScanResult {
  symbol: string;
  exchange: string;
  name: string;
  sector?: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume?: number;
  marketCap?: number;
  peRatio?: number;
  technicals?: {
    rsi?: number;
    macd?: { macd: number; signal: number; histogram: number };
    ema20?: number;
    ema50?: number;
    ema200?: number;
    sma20?: number;
    upperBand?: number;
    lowerBand?: number;
  };
  scanType: string;
  score?: number;
}

class ScreenerController {
  async screenStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        exchange,
        sector,
        minPrice,
        maxPrice,
        minVolume,
        maxVolume,
        minMarketCap,
        maxMarketCap,
        minPE,
        maxPE,
        minChangePercent,
        maxChangePercent,
        page = 1,
        limit = 50,
      } = req.query;

      const query: any = {};

      if (exchange) query.exchange = exchange;
      if (sector) query.sector = new RegExp(sector as string, 'i');
      if (minPrice || maxPrice) query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
      if (minVolume) query.volume = { $gte: Number(minVolume) };
      if (minMarketCap || maxMarketCap) query.marketCap = {};
      if (minMarketCap) query.marketCap.$gte = Number(minMarketCap);
      if (maxMarketCap) query.marketCap.$lte = Number(maxMarketCap);
      if (minPE || maxPE) query.peRatio = {};
      if (minPE) query.peRatio.$gte = Number(minPE);
      if (maxPE) query.peRatio.$lte = Number(maxPE);

      const stocks = await Stock.find(query)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit));

      const results: ScanResult[] = [];

      for (const stock of stocks) {
        try {
          const quote = await marketDataProvider.getQuote(stock.symbol);
          
          let include = true;
          
          if (minChangePercent && quote.priceChangePercent < Number(minChangePercent)) include = false;
          if (maxChangePercent && quote.priceChangePercent > Number(maxChangePercent)) include = false;

          if (include) {
            results.push({
              symbol: stock.symbol,
              exchange: stock.exchange,
              name: stock.name,
              sector: stock.sector,
              price: quote.lastPrice,
              change: quote.priceChange,
              changePercent: quote.priceChangePercent,
              volume: quote.volume,
              marketCap: stock.marketCap,
              peRatio: stock.peRatio,
              scanType: 'custom',
            });
          }
        } catch (error) {
          // Skip if quote not available
        }
      }

      res.json({
        success: true,
        data: results,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: results.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async swingScanner(req: Request, res: Response, next: NextFunction) {
    try {
      const results: ScanResult[] = [];
      const stocks = await Stock.find({ isActive: true }).limit(100);

      for (const stock of stocks) {
        try {
          const quote = await marketDataProvider.getQuote(stock.symbol);
          const candles = await marketDataProvider.getHistoricalData({
            symbol: stock.symbol,
            interval: '1d',
            days: 50,
          });

          // Calculate simple RSI
          const rsi = this.calculateRSI(candles.map(c => c.close), 14);
          
          // Check for swing trading conditions
          const currentPrice = quote.lastPrice;
          const recentLow = Math.min(...candles.slice(-10).map(c => c.low));
          const recentHigh = Math.max(...candles.slice(-10).map(c => c.high));
          
          const isNearLow = currentPrice < recentLow * 1.05;
          const isNearHigh = currentPrice > recentHigh * 0.95;
          const isOversold = rsi < 35;
          const isOverbought = rsi > 65;

          let score = 0;
          let scanType = '';

          if (isNearLow && isOversold) {
            score += 3;
            scanType = 'swing-buy';
          }
          if (isNearHigh && !isOverbought) {
            score += 2;
            scanType = 'swing-breakout';
          }
          if (quote.priceChangePercent > 3) {
            score += 1;
          }

          if (score >= 2) {
            results.push({
              symbol: stock.symbol,
              exchange: stock.exchange,
              name: stock.name,
              sector: stock.sector,
              price: currentPrice,
              change: quote.priceChange,
              changePercent: quote.priceChangePercent,
              volume: quote.volume,
              scanType,
              score,
              technicals: { rsi },
            });
          }
        } catch (error) {
          // Skip
        }
      }

      results.sort((a, b) => (b.score || 0) - (a.score || 0));

      res.json({
        success: true,
        data: results.slice(0, 20),
      });
    } catch (error) {
      next(error);
    }
  }

  async positionalScanner(req: Request, res: Response, next: NextFunction) {
    try {
      const results: ScanResult[] = [];
      const stocks = await Stock.find({ isActive: true }).limit(100);

      for (const stock of stocks) {
        try {
          const quote = await marketDataProvider.getQuote(stock.symbol);
          const candles = await marketDataProvider.getHistoricalData({
            symbol: stock.symbol,
            interval: '1d',
            days: 200,
          });

          const closes = candles.map(c => c.close);
          const ema20 = this.calculateEMA(closes, 20);
          const ema50 = this.calculateEMA(closes, 50);
          const ema200 = this.calculateEMA(closes, 200);

          const currentPrice = quote.lastPrice;
          const isAboveEma20 = currentPrice > ema20;
          const isAboveEma50 = currentPrice > ema50;
          const isAboveEma200 = currentPrice > ema200;
          const ema20AboveEma50 = ema20 > ema50;
          const ema50AboveEma200 = ema50 > ema200;

          let score = 0;

          if (isAboveEma200) score += 2;
          if (isAboveEma50) score += 1;
          if (isAboveEma20) score += 1;
          if (ema20AboveEma50) score += 2;
          if (ema50AboveEma200) score += 2;
          if (quote.priceChangePercent > 0) score += 1;

          if (score >= 5) {
            results.push({
              symbol: stock.symbol,
              exchange: stock.exchange,
              name: stock.name,
              sector: stock.sector,
              price: currentPrice,
              change: quote.priceChange,
              changePercent: quote.priceChangePercent,
              volume: quote.volume,
              scanType: 'positional',
              score,
              technicals: { ema20, ema50, ema200 },
            });
          }
        } catch (error) {
          // Skip
        }
      }

      results.sort((a, b) => (b.score || 0) - (a.score || 0));

      res.json({
        success: true,
        data: results.slice(0, 20),
      });
    } catch (error) {
      next(error);
    }
  }

  async relativeStrength(req: Request, res: Response, next: NextFunction) {
    try {
      const results: ScanResult[] = [];
      const stocks = await Stock.find({ isActive: true, sector: { $exists: true } }).limit(100);

      // Get NIFTY performance for comparison
      const niftyCandles = await marketDataProvider.getHistoricalData({
        symbol: 'NIFTY',
        interval: '1d',
        days: 30,
      });
      const niftyReturn = ((niftyCandles[niftyCandles.length - 1].close - niftyCandles[0].close) / niftyCandles[0].close) * 100;

      for (const stock of stocks) {
        try {
          const candles = await marketDataProvider.getHistoricalData({
            symbol: stock.symbol,
            interval: '1d',
            days: 30,
          });

          if (candles.length < 2) continue;

          const stockReturn = ((candles[candles.length - 1].close - candles[0].close) / candles[0].close) * 100;
          const relativeStrength = stockReturn - niftyReturn;

          if (relativeStrength > 5) {
            const quote = await marketDataProvider.getQuote(stock.symbol);
            results.push({
              symbol: stock.symbol,
              exchange: stock.exchange,
              name: stock.name,
              sector: stock.sector,
              price: quote.lastPrice,
              change: quote.priceChange,
              changePercent: quote.priceChangePercent,
              volume: quote.volume,
              scanType: 'relative-strength',
              score: relativeStrength,
            });
          }
        } catch (error) {
          // Skip
        }
      }

      results.sort((a, b) => (b.score || 0) - (a.score || 0));

      res.json({
        success: true,
        data: results.slice(0, 20),
      });
    } catch (error) {
      next(error);
    }
  }

  private calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;

    const multiplier = 2 / (period + 1);
    let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }

    return ema;
  }
}

export const screenerController = new ScreenerController();
