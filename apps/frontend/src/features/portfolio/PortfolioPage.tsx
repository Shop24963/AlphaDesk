import { useQuery } from '@tanstack/react-query';
import { portfolioService, Portfolio, Holding } from '@/services/portfolio.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, PieChart } from 'lucide-react';

function StatCard({ title, value, subValue, isPositive }: { title: string; value: string; subValue?: string; isPositive?: boolean }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subValue && (
          <div className={`text-sm mt-1 ${isPositive === true ? 'text-green-600' : isPositive === false ? 'text-red-600' : 'text-muted-foreground'}`}>
            {subValue}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  if (!holdings.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No holdings yet. Add transactions to see your portfolio.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Symbol</th>
            <th className="text-right py-3 px-4 font-medium">Qty</th>
            <th className="text-right py-3 px-4 font-medium">Avg Price</th>
            <th className="text-right py-3 px-4 font-medium">Current</th>
            <th className="text-right py-3 px-4 font-medium">Invested</th>
            <th className="text-right py-3 px-4 font-medium">Current Value</th>
            <th className="text-right py-3 px-4 font-medium">P&L</th>
            <th className="text-right py-3 px-4 font-medium">P&L %</th>
            <th className="text-right py-3 px-4 font-medium">Allocation</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">{holding.symbol}</td>
              <td className="text-right py-3 px-4">{holding.quantity}</td>
              <td className="text-right py-3 px-4">₹{holding.averagePrice.toFixed(2)}</td>
              <td className="text-right py-3 px-4">₹{holding.currentPrice.toFixed(2)}</td>
              <td className="text-right py-3 px-4">₹{holding.investedValue.toFixed(2)}</td>
              <td className="text-right py-3 px-4">₹{holding.currentValue.toFixed(2)}</td>
              <td className={`text-right py-3 px-4 ${holding.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.pnl >= 0 ? '+' : ''}₹{holding.pnl.toFixed(2)}
              </td>
              <td className={`text-right py-3 px-4 ${holding.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {holding.pnlPercent >= 0 ? '+' : ''}{holding.pnlPercent.toFixed(2)}%
              </td>
              <td className="text-right py-3 px-4">{holding.allocation.toFixed(1)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function PortfolioPage() {
  const { data: portfolio, isLoading, error } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => portfolioService.getPortfolio(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Failed to load portfolio</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Portfolio</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Value"
          value={`₹${portfolio.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          title="Invested Value"
          value={`₹${portfolio.investedValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        />
        <StatCard
          title="Total P&L"
          value={`${portfolio.totalPnL >= 0 ? '+' : ''}₹${portfolio.totalPnL.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          subValue={`${portfolio.totalPnLPercent >= 0 ? '+' : ''}${portfolio.totalPnLPercent.toFixed(2)}%`}
          isPositive={portfolio.totalPnL >= 0}
        />
        <StatCard
          title="Holdings"
          value={portfolio.holdings.length.toString()}
          subValue="stocks"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Holdings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <HoldingsTable holdings={portfolio.holdings} />
        </CardContent>
      </Card>
    </div>
  );
}
