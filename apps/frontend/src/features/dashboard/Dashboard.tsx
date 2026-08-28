import { PageHeader, SectionHeader } from '@/components/layout/top-navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatINR, formatPercent } from '@alphadesk/shared-utils';
import { TrendingUp, TrendingDown, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const mockPortfolioData = {
  totalValue: 1250000,
  investedValue: 1000000,
  currentPnL: 250000,
  currentPnLPercent: 25,
  dayPnL: 12500,
  dayPnLPercent: 1.2,
};

const mockHoldings = [
  { symbol: 'RELIANCE', quantity: 50, avgPrice: 2400, currentPrice: 2520, pnl: 6000, pnlPercent: 5 },
  { symbol: 'TCS', quantity: 30, avgPrice: 3500, currentPrice: 3680, pnl: 5400, pnlPercent: 5.14 },
  { symbol: 'HDFCBANK', quantity: 100, avgPrice: 1600, currentPrice: 1580, pnl: -2000, pnlPercent: -1.25 },
  { symbol: 'INFY', quantity: 80, avgPrice: 1450, currentPrice: 1520, pnl: 5600, pnlPercent: 4.83 },
  { symbol: 'ICICIBANK', quantity: 75, avgPrice: 950, currentPrice: 980, pnl: 2250, pnlPercent: 3.16 },
];

const mockMarketIndices = [
  { name: 'NIFTY 50', value: 21450.25, change: 125.50, changePercent: 0.59 },
  { name: 'BANK NIFTY', value: 45230.80, change: -85.30, changePercent: -0.19 },
  { name: 'FIN NIFTY', value: 18950.45, change: 45.20, changePercent: 0.24 },
  { name: 'NIFTY MIDCAP', value: 48520.60, change: 210.80, changePercent: 0.44 },
];

export default function Dashboard() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's your trading overview."
        actions={
          <Button>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Quick Trade
          </Button>
        }
      />

      {/* Portfolio Summary Cards */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Portfolio Value"
          value={formatINR(mockPortfolioData.totalValue)}
          change={formatPercent(mockPortfolioData.dayPnLPercent)}
          isPositive={mockPortfolioData.dayPnL >= 0}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <MetricCard
          title="Total P&L"
          value={formatINR(mockPortfolioData.currentPnL)}
          change={formatPercent(mockPortfolioData.currentPnLPercent)}
          isPositive={mockPortfolioData.currentPnL >= 0}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Day P&L"
          value={formatINR(mockPortfolioData.dayPnL)}
          change={formatPercent(mockPortfolioData.dayPnLPercent)}
          isPositive={mockPortfolioData.dayPnL >= 0}
          icon={<Activity className="h-4 w-4" />}
        />
        <MetricCard
          title="Invested"
          value={formatINR(mockPortfolioData.investedValue)}
          change="+12.5%"
          isPositive={true}
          icon={<DollarSign className="h-4 w-4" />}
        />
      </div>

      {/* Market Indices */}
      <SectionHeader
        title="Market Indices"
        description="Real-time NSE market overview"
      />
      <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockMarketIndices.map((index) => (
          <Card key={index.name}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">{index.name}</p>
                <p className="text-2xl font-bold">{index.value.toLocaleString('en-IN')}</p>
                <div className={`flex items-center text-sm ${index.change >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {index.change >= 0 ? (
                    <ArrowUpRight className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="mr-1 h-3 w-3" />
                  )}
                  {index.change >= 0 ? '+' : ''}{index.change} ({index.changePercent}%)
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Holdings Table */}
      <SectionHeader
        title="Top Holdings"
        description="Your largest positions by value"
        actions={<Button variant="outline">View All</Button>}
      />
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Avg Price</th>
                  <th className="text-right">Current Price</th>
                  <th className="text-right">LTP</th>
                  <th className="text-right">P&L</th>
                  <th className="text-right">P&L %</th>
                </tr>
              </thead>
              <tbody>
                {mockHoldings.map((holding) => (
                  <tr key={holding.symbol}>
                    <td className="font-medium">{holding.symbol}</td>
                    <td className="text-right">{holding.quantity}</td>
                    <td className="text-right">{formatINR(holding.avgPrice)}</td>
                    <td className="text-right">{formatINR(holding.currentPrice)}</td>
                    <td className="text-right">{formatINR(holding.currentPrice * holding.quantity)}</td>
                    <td className={`text-right ${holding.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {holding.pnl >= 0 ? '+' : ''}{formatINR(holding.pnl)}
                    </td>
                    <td className="text-right">
                      <span className={`status-badge ${holding.pnl >= 0 ? 'status-badge-success' : 'status-badge-danger'}`}>
                        {holding.pnl >= 0 ? '+' : ''}{formatPercent(holding.pnlPercent)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

function MetricCard({ title, value, change, isPositive, icon }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className={`mt-1 flex items-center text-xs ${isPositive ? 'text-profit' : 'text-loss'}`}>
          {isPositive ? (
            <ArrowUpRight className="mr-1 h-3 w-3" />
          ) : (
            <ArrowDownRight className="mr-1 h-3 w-3" />
          )}
          {change} from yesterday
        </p>
      </CardContent>
    </Card>
  );
}
