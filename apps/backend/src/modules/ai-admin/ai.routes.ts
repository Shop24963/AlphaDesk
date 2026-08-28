import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware.js';
import { getHistoricalData, getQuote } from '../market/market.provider.js';
import { generateAIAnalysis } from './ai-analysis.service.js';

const router = Router();

// Get AI analysis for a stock
router.get('/analyze/:symbol', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { symbol } = req.params;
    const { days = '60' } = req.query;

    // Fetch historical data
    const candles = await getHistoricalData(symbol, parseInt(days as string));
    
    if (!candles || candles.length === 0) {
      return res.status(404).json({ message: 'No data available for this symbol' });
    }

    // Generate AI analysis
    const analysis = generateAIAnalysis(symbol, candles);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get pattern recognition for multiple stocks
router.post('/patterns', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { symbols, days = 30 } = req.body;

    if (!symbols || !Array.isArray(symbols)) {
      return res.status(400).json({ message: 'Symbols array is required' });
    }

    const analyses = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const candles = await getHistoricalData(symbol, days);
          if (candles && candles.length > 0) {
            return generateAIAnalysis(symbol, candles);
          }
          return null;
        } catch (error) {
          return null;
        }
      })
    );

    const validAnalyses = analyses.filter(a => a !== null);

    res.json({
      success: true,
      data: validAnalyses,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

// Get market sentiment overview
router.get('/sentiment', authenticate, async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { screenerService } = await import('../screener/screener.service.js');
    
    // Get top stocks by volume
    const topStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'LT'];
    
    const analyses = await Promise.all(
      topStocks.map(async (symbol) => {
        try {
          const candles = await getHistoricalData(symbol, 30);
          if (candles && candles.length > 0) {
            const analysis = generateAIAnalysis(symbol, candles);
            return {
              symbol,
              sentiment: analysis.sentiment,
              sentimentScore: analysis.sentimentScore,
              trend: analysis.trend,
            };
          }
          return null;
        } catch (error) {
          return null;
        }
      })
    );

    const validAnalyses = analyses.filter(a => a !== null);
    
    // Calculate overall market sentiment
    const totalScore = validAnalyses.reduce((sum, a) => sum + a.sentimentScore, 0);
    const avgScore = totalScore / validAnalyses.length;
    
    let marketSentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (avgScore > 0.2) marketSentiment = 'bullish';
    else if (avgScore < -0.2) marketSentiment = 'bearish';

    res.json({
      success: true,
      data: {
        marketSentiment,
        marketScore: avgScore,
        stocks: validAnalyses,
        bullishCount: validAnalyses.filter(a => a.sentiment === 'bullish').length,
        bearishCount: validAnalyses.filter(a => a.sentiment === 'bearish').length,
        neutralCount: validAnalyses.filter(a => a.sentiment === 'neutral').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export const aiRoutes = router;
