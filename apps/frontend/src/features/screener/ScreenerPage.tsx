import { useQuery } from '@tanstack/react-query';
import { screenerService, ScreenerResult } from '@/services/screener.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function ScanResultsTable({ results, scanType }: { results: ScreenerResult[]; scanType: string }) {
  if (!results.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No stocks found matching {scanType} criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Symbol</th>
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-right py-3 px-4 font-medium">Price</th>
            <th className="text-right py-3 px-4 font-medium">Change %</th>
            <th className="text-right py-3 px-4 font-medium">Volume</th>
            <th className="text-right py-3 px-4 font-medium">RSI</th>
            <th className="text-right py-3 px-4 font-medium">P/E</th>
            <th className="text-right py-3 px-4 font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.symbol} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">{result.symbol}</td>
              <td className="py-3 px-4">{result.name}</td>
              <td className={`text-right py-3 px-4 ${result.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{result.lastPrice.toFixed(2)}
              </td>
              <td className={`text-right py-3 px-4 ${result.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {result.changePercent >= 0 ? '+' : ''}{result.changePercent.toFixed(2)}%
              </td>
              <td className="text-right py-3 px-4">{result.volume.toLocaleString()}</td>
              <td className="text-right py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  result.rsi > 70 ? 'bg-red-500/20 text-red-600' :
                  result.rsi < 30 ? 'bg-green-500/20 text-green-600' :
                  'bg-yellow-500/20 text-yellow-600'
                }`}>
                  {result.rsi.toFixed(1)}
                </span>
              </td>
              <td className="text-right py-3 px-4">{result.peRatio?.toFixed(2) || 'N/A'}</td>
              <td className="text-right py-3 px-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  result.score >= 80 ? 'bg-green-500/20 text-green-600' :
                  result.score >= 60 ? 'bg-yellow-500/20 text-yellow-600' :
                  'bg-red-500/20 text-red-600'
                }`}>
                  {result.score.toFixed(0)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScreenerPage() {
  const { data: swingResults, isLoading: swingLoading } = useQuery({
    queryKey: ['screener-swing'],
    queryFn: () => screenerService.getSwingCandidates(),
  });

  const { data: positionalResults, isLoading: positionalLoading } = useQuery({
    queryKey: ['screener-positional'],
    queryFn: () => screenerService.getPositionalCandidates(),
  });

  const { data: rsResults, isLoading: rsLoading } = useQuery({
    queryKey: ['screener-rs'],
    queryFn: () => screenerService.getRelativeStrength(),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Stock Screener</h1>
      </div>

      <Tabs defaultValue="swing" className="space-y-4">
        <TabsList>
          <TabsTrigger value="swing">Swing Candidates</TabsTrigger>
          <TabsTrigger value="positional">Positional Candidates</TabsTrigger>
          <TabsTrigger value="relative-strength">Relative Strength</TabsTrigger>
        </TabsList>

        <TabsContent value="swing">
          <Card>
            <CardHeader>
              <CardTitle>Swing Trading Candidates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stocks showing potential swing trading setups based on technical indicators
              </p>
            </CardHeader>
            <CardContent>
              {swingLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <ScanResultsTable results={swingResults || []} scanType="swing" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positional">
          <Card>
            <CardHeader>
              <CardTitle>Positional Trading Candidates</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stocks with strong fundamentals and trends for positional trades
              </p>
            </CardHeader>
            <CardContent>
              {positionalLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <ScanResultsTable results={positionalResults || []} scanType="positional" />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relative-strength">
          <Card>
            <CardHeader>
              <CardTitle>Relative Strength Leaders</CardTitle>
              <p className="text-sm text-muted-foreground">
                Stocks outperforming the market benchmark
              </p>
            </CardHeader>
            <CardContent>
              {rsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <ScanResultsTable results={rsResults || []} scanType="relative strength" />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
