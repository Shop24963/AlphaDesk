import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { portfolioService } from '@/services/portfolio.service';
import { analyticsService } from '@/services/analytics.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EquityCurveChart } from '@/components/charts/equity-curve';
import { DrawdownChart } from '@/components/charts/drawdown-chart';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Activity, 
  PieChart, 
  Shield,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | 'ALL'>('6M');

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio-analytics'],
    queryFn: () => portfolioService.getAnalytics(),
  });

  const { data: holdings, isLoading: holdingsLoading } = useQuery({
    queryKey: ['holdings'],
    queryFn: () => portfolioService.getHoldings(),
  });

  const { data: riskMetrics, isLoading: riskLoading } = useQuery({
    queryKey: ['risk-metrics'],
    queryFn: () => analyticsService.getRiskMetrics(),
  });

  const totalValue = holdings?.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0) || 0;
  const totalCost = holdings?.reduce((sum, h) => sum + (h.quantity * h.averagePrice), 0) || 0;
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost) * 100 : 0;

  // Calculate allocation percentages
  const allocationData = holdings?.map(h => ({
    name: h.symbol,
    value: h.quantity * h.currentPrice,
    percentage: totalValue > 0 ? ((h.quantity * h.currentPrice) / totalValue) * 100 : 0,
  })) || [];

  // Top gainers and losers
  const sortedByPnL = [...(holdings || [])].sort((a, b) => b.pnl - a.pnl);
  const topGainers = sortedByPnL.slice(0, 5);
  const topLosers = sortedByPnL.slice(-5).reverse();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio Analytics"
        description="Comprehensive analysis of your portfolio performance and risk metrics"
        action={
          <div className="flex gap-2">
            {(['1M', '3M', '6M', '1Y', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        }
      />

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Portfolio Value"
          value={`₹${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          trend={totalPnLPercent}
        />
        <StatCard
          title="Total P&L"
          value={`${totalPnL >= 0 ? '+' : ''}₹${totalPnL.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
          trend={totalPnLPercent}
        />
        <StatCard
          title="Sharpe Ratio"
          value={riskMetrics?.sharpeRatio?.toFixed(2) || '0.00'}
          icon={Activity}
          trend={0}
          description="Risk-adjusted return metric"
        />
        <StatCard
          title="Max Drawdown"
          value={`${riskMetrics?.maxDrawdown?.toFixed(2) || '0.00'}%`}
          icon={Shield}
          trend={0}
          description="Maximum peak-to-trough decline"
          trendValue={riskMetrics?.maxDrawdown || 0}
          trendNegative
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Equity Curve */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Portfolio Growth</h3>
          <EquityCurveChart timeRange={timeRange} />
        </Card>

        {/* Drawdown Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Drawdown Analysis</h3>
          <DrawdownChart timeRange={timeRange} />
        </Card>
      </div>

      {/* Risk Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Risk Metrics</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Sharpe Ratio</div>
            <div className="text-2xl font-bold">{riskMetrics?.sharpeRatio?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {riskMetrics && riskMetrics.sharpeRatio > 1 ? 'Excellent' : riskMetrics!.sharpeRatio > 0.5 ? 'Good' : 'Needs Improvement'}
            </div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Sortino Ratio</div>
            <div className="text-2xl font-bold">{riskMetrics?.sortinoRatio?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground mt-1">Downside risk adjustment</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Volatility</div>
            <div className="text-2xl font-bold">{riskMetrics?.volatility?.toFixed(2) || '0.00'}%</div>
            <div className="text-xs text-muted-foreground mt-1">Annualized standard deviation</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Beta</div>
            <div className="text-2xl font-bold">{riskMetrics?.beta?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground mt-1">Market sensitivity</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Alpha</div>
            <div className="text-2xl font-bold">{riskMetrics?.alpha?.toFixed(2) || '0.00'}</div>
            <div className="text-xs text-muted-foreground mt-1">Excess return vs benchmark</div>
          </div>
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
            <div className="text-2xl font-bold">{riskMetrics?.winRate?.toFixed(1) || '0.0'}%</div>
            <div className="text-xs text-muted-foreground mt-1">Percentage of profitable trades</div>
          </div>
        </div>
      </Card>

      {/* Allocation and Top Performers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Portfolio Allocation */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Portfolio Allocation</h3>
            <PieChart size={20} className="text-muted-foreground" />
          </div>
          {allocationData.length > 0 ? (
            <div className="space-y-3">
              {allocationData.slice(0, 10).map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary" style={{ opacity: 1 - index * 0.1 }} />
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">₹{item.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                    <div className="text-sm text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No holdings to display
            </div>
          )}
        </Card>

        {/* Top Gainers & Losers */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-6">
            {/* Top Gainers */}
            <div>
              <h4 className="text-sm font-medium text-success mb-3 flex items-center gap-2">
                <ArrowUpRight size={16} />
                Top Gainers
              </h4>
              <div className="space-y-2">
                {topGainers.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-2 bg-success/10 rounded-md">
                    <div>
                      <div className="font-semibold">{holding.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {holding.quantity} @ ₹{holding.averagePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-success">+₹{holding.pnl.toFixed(2)}</div>
                      <div className="text-sm text-success">+{holding.pnlPercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
                {topGainers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No gainers</div>
                )}
              </div>
            </div>

            {/* Top Losers */}
            <div>
              <h4 className="text-sm font-medium text-danger mb-3 flex items-center gap-2">
                <ArrowDownRight size={16} />
                Top Losers
              </h4>
              <div className="space-y-2">
                {topLosers.map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-2 bg-danger/10 rounded-md">
                    <div>
                      <div className="font-semibold">{holding.symbol}</div>
                      <div className="text-sm text-muted-foreground">
                        {holding.quantity} @ ₹{holding.averagePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-danger">-₹{Math.abs(holding.pnl).toFixed(2)}</div>
                      <div className="text-sm text-danger">{holding.pnlPercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))}
                {topLosers.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">No losers</div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
