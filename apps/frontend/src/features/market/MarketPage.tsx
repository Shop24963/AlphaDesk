import { useQuery } from '@tanstack/react-query';
import { stockService, MarketOverview } from '@/services/stock.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function MarketStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: 'bg-green-500/20 text-green-600',
    CLOSED: 'bg-red-500/20 text-red-600',
    PRE_OPEN: 'bg-yellow-500/20 text-yellow-600',
    POST_CLOSE: 'bg-blue-500/20 text-blue-600',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-500/20'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

function IndexCard({ title, value, change, changePercent }: { title: string; value: number; change: number; changePercent: number }) {
  const isPositive = change >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toFixed(2)}</div>
        <div className={`flex items-center mt-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <Icon className="w-4 h-4 mr-1" />
          <span>{change.toFixed(2)} ({changePercent.toFixed(2)}%)</span>
        </div>
      </CardContent>
    </Card>
  );
}

function BreadthCard({ advances, declines, unchanged }: { advances: number; declines: number; unchanged: number }) {
  const total = advances + declines + unchanged;
  const advancePercent = total > 0 ? (advances / total) * 100 : 0;
  const declinePercent = total > 0 ? (declines / total) * 100 : 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Market Breadth</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-green-600">Advances: {advances}</span>
          <span className="text-sm text-red-600">Declines: {declines}</span>
          <span className="text-sm text-muted-foreground">Unchanged: {unchanged}</span>
        </div>
        <div className="flex h-2 rounded-full overflow-hidden bg-muted">
          <div 
            className="bg-green-500 transition-all" 
            style={{ width: `${advancePercent}%` }}
          />
          <div 
            className="bg-red-500 transition-all" 
            style={{ width: `${declinePercent}%` }}
          />
          <div 
            className="bg-muted-foreground/30 transition-all" 
            style={{ width: `${100 - advancePercent - declinePercent}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MarketPage() {
  const { data: overview, isLoading, error } = useQuery<MarketOverview>({
    queryKey: ['market-overview'],
    queryFn: () => stockService.getMarketOverview(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-destructive">Failed to load market data</h2>
        <p className="text-muted-foreground mt-2">Please try again later</p>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Market Overview</h1>
        <MarketStatusBadge status={overview.marketStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <IndexCard
          title="NIFTY 50"
          value={overview.nifty50.value}
          change={overview.nifty50.change}
          changePercent={overview.nifty50.changePercent}
        />
        <IndexCard
          title="BANK NIFTY"
          value={overview.bankNifty.value}
          change={overview.bankNifty.change}
          changePercent={overview.bankNifty.changePercent}
        />
        <BreadthCard
          advances={overview.advanceDecline.advances}
          declines={overview.advanceDecline.declines}
          unchanged={overview.advanceDecline.unchanged}
        />
      </div>
    </div>
  );
}
