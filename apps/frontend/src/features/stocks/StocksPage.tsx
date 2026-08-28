import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService, Stock, Quote } from '@/services/stock.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function StocksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);

  const { data: stocksData, isLoading } = useQuery({
    queryKey: ['stocks', searchTerm],
    queryFn: () => stockService.getAll({ search: searchTerm || undefined, limit: 50 }),
  });

  const { data: quote } = useQuery({
    queryKey: ['quote', selectedStock?.symbol],
    queryFn: () => selectedStock ? stockService.getQuote(selectedStock.symbol) : Promise.resolve(null),
    enabled: !!selectedStock,
    refetchInterval: 5000,
  });

  const stocks = stocksData?.stocks || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Explorer</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stocks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 w-32 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : stocks.length === 0 ? (
          <div className="col-span-full p-8 text-center text-muted-foreground">
            No stocks found. Try a different search term.
          </div>
        ) : (
          stocks.map((stock) => (
            <Card
              key={stock._id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setSelectedStock(stock)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{stock.symbol}</CardTitle>
                  <span className={`flex items-center text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stock.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {stock.changePercent.toFixed(2)}%
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stock.lastPrice.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground mt-1">{stock.name}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{stock.sector}</span>
                  <span>MCap: ₹{(stock.marketCap / 100000).toFixed(1)}L Cr</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {selectedStock && quote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelectedStock(null)}>
          <Card className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{selectedStock.symbol} - {selectedStock.name}</CardTitle>
                  <p className="text-muted-foreground">{selectedStock.sector} • {selectedStock.industry}</p>
                </div>
                <button
                  onClick={() => setSelectedStock(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Last Price</div>
                  <div className="text-xl font-bold">₹{quote.lastPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Open</div>
                  <div className="text-lg">₹{quote.open.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">High</div>
                  <div className="text-lg">₹{quote.high.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Low</div>
                  <div className="text-lg">₹{quote.low.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Close</div>
                  <div className="text-lg">₹{quote.close.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Volume</div>
                  <div className="text-lg">{quote.volume.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">52W High</div>
                  <div className="text-lg">₹{selectedStock.weekHigh52.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">52W Low</div>
                  <div className="text-lg">₹{selectedStock.weekLow52.toFixed(2)}</div>
                </div>
              </div>
              
              {selectedStock.peRatio && (
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div>
                    <div className="text-sm text-muted-foreground">P/E Ratio</div>
                    <div className="text-lg">{selectedStock.peRatio.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">P/B Ratio</div>
                    <div className="text-lg">{selectedStock.pbRatio?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Div Yield</div>
                    <div className="text-lg">{selectedStock.dividendYield?.toFixed(2) || 'N/A'}%</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
