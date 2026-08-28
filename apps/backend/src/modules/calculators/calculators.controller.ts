import { Request, Response, NextFunction } from 'express';

interface PositionSizeRequest {
  accountSize: number;
  riskPercent: number;
  entryPrice: number;
  stopLossPrice: number;
}

interface RiskRewardRequest {
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
}

interface BreakEvenRequest {
  totalInvestment: number;
  currentPrice: number;
  quantity: number;
}

interface PortfolioAllocationRequest {
  totalValue: number;
  allocations: { asset: string; percent: number }[];
}

export class CalculatorsController {
  /**
   * Calculate position size based on risk parameters
   */
  calculatePositionSize(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountSize, riskPercent, entryPrice, stopLossPrice }: PositionSizeRequest =
        req.body;

      // Validation
      if (
        !accountSize ||
        !riskPercent ||
        !entryPrice ||
        !stopLossPrice ||
        accountSize <= 0 ||
        riskPercent <= 0 ||
        riskPercent > 100 ||
        entryPrice <= 0 ||
        stopLossPrice <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input parameters',
        });
      }

      const riskAmount = (accountSize * riskPercent) / 100;
      const riskPerShare = Math.abs(entryPrice - stopLossPrice);

      if (riskPerShare === 0) {
        return res.status(400).json({
          success: false,
          message: 'Stop loss price cannot equal entry price',
        });
      }

      const positionSize = Math.floor(riskAmount / riskPerShare);
      const totalValue = positionSize * entryPrice;
      const actualRisk = positionSize * riskPerShare;

      res.json({
        success: true,
        data: {
          positionSize,
          totalValue,
          riskAmount,
          actualRisk,
          riskPerShare,
          sharesToBuy: positionSize,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate risk-reward ratio
   */
  calculateRiskReward(req: Request, res: Response, next: NextFunction) {
    try {
      const { entryPrice, stopLossPrice, targetPrice }: RiskRewardRequest =
        req.body;

      if (!entryPrice || !stopLossPrice || !targetPrice) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters',
        });
      }

      const risk = Math.abs(entryPrice - stopLossPrice);
      const reward = Math.abs(targetPrice - entryPrice);

      if (risk === 0) {
        return res.status(400).json({
          success: false,
          message: 'Risk cannot be zero (stop loss equals entry)',
        });
      }

      const riskRewardRatio = reward / risk;
      const winRateNeeded = 100 / (1 + riskRewardRatio);

      res.json({
        success: true,
        data: {
          risk,
          reward,
          riskRewardRatio: parseFloat(riskRewardRatio.toFixed(2)),
          winRateNeeded: parseFloat(winRateNeeded.toFixed(2)),
          profitPercent: parseFloat(((reward / entryPrice) * 100).toFixed(2)),
          lossPercent: parseFloat(((risk / entryPrice) * 100).toFixed(2)),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate break-even price
   */
  calculateBreakEven(req: Request, res: Response, next: NextFunction) {
    try {
      const { totalInvestment, currentPrice, quantity }: BreakEvenRequest =
        req.body;

      if (!totalInvestment || !currentPrice || !quantity || quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input parameters',
        });
      }

      const currentValue = currentPrice * quantity;
      const pnl = currentValue - totalInvestment;
      const pnlPercent = (pnl / totalInvestment) * 100;
      const breakEvenPrice = totalInvestment / quantity;
      const priceToBreakEven = breakEvenPrice - currentPrice;
      const percentToBreakEven = (priceToBreakEven / currentPrice) * 100;

      res.json({
        success: true,
        data: {
          totalInvestment,
          currentValue,
          pnl: parseFloat(pnl.toFixed(2)),
          pnlPercent: parseFloat(pnlPercent.toFixed(2)),
          breakEvenPrice: parseFloat(breakEvenPrice.toFixed(2)),
          priceToBreakEven: parseFloat(priceToBreakEven.toFixed(2)),
          percentToBreakEven: parseFloat(percentToBreakEven.toFixed(2)),
          isProfitable: pnl > 0,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate portfolio allocation
   */
  calculatePortfolioAllocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { totalValue, allocations }: PortfolioAllocationRequest = req.body;

      if (!totalValue || !allocations || totalValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input parameters',
        });
      }

      const totalPercent = allocations.reduce((sum, a) => sum + a.percent, 0);

      if (Math.abs(totalPercent - 100) > 0.01) {
        return res.status(400).json({
          success: false,
          message: `Allocations must sum to 100% (current: ${totalPercent}%)`,
        });
      }

      const results = allocations.map((allocation) => ({
        asset: allocation.asset,
        percent: allocation.percent,
        value: parseFloat(((totalValue * allocation.percent) / 100).toFixed(2)),
      }));

      res.json({
        success: true,
        data: {
          totalValue,
          allocations: results,
          totalPercent,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate compound interest
   */
  calculateCompoundInterest(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        principal,
        rate,
        time,
        compoundsPerYear = 12,
      }: {
        principal: number;
        rate: number;
        time: number;
        compoundsPerYear?: number;
      } = req.body;

      if (!principal || !rate || !time || principal <= 0 || rate <= 0 || time <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input parameters',
        });
      }

      const r = rate / 100;
      const n = compoundsPerYear;
      const t = time;

      const amount = principal * Math.pow(1 + r / n, n * t);
      const interest = amount - principal;
      const totalReturn = ((amount - principal) / principal) * 100;

      // Generate year-by-year breakdown
      const breakdown = [];
      let currentAmount = principal;
      for (let year = 1; year <= time; year++) {
        currentAmount = principal * Math.pow(1 + r / n, n * year);
        breakdown.push({
          year,
          amount: parseFloat(currentAmount.toFixed(2)),
          interest: parseFloat((currentAmount - principal).toFixed(2)),
        });
      }

      res.json({
        success: true,
        data: {
          principal,
          finalAmount: parseFloat(amount.toFixed(2)),
          totalInterest: parseFloat(interest.toFixed(2)),
          totalReturn: parseFloat(totalReturn.toFixed(2)),
          breakdown,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Calculate margin and leverage
   */
  calculateMargin(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        tradeValue,
        leverage,
        marginPercent,
      }: {
        tradeValue: number;
        leverage?: number;
        marginPercent?: number;
      } = req.body;

      if (!tradeValue || tradeValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid trade value',
        });
      }

      let requiredMargin: number;
      let effectiveLeverage: number;

      if (leverage) {
        requiredMargin = tradeValue / leverage;
        effectiveLeverage = leverage;
      } else if (marginPercent) {
        requiredMargin = (tradeValue * marginPercent) / 100;
        effectiveLeverage = tradeValue / requiredMargin;
      } else {
        return res.status(400).json({
          success: false,
          message: 'Either leverage or marginPercent is required',
        });
      }

      res.json({
        success: true,
        data: {
          tradeValue,
          requiredMargin: parseFloat(requiredMargin.toFixed(2)),
          leverage: parseFloat(effectiveLeverage.toFixed(2)),
          marginPercent: parseFloat((requiredMargin / tradeValue) * 100),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const calculatorsController = new CalculatorsController();
