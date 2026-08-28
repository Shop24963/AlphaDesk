import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { backtestService } from '@/services/backtest.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Play, TrendingUp, TrendingDown, Activity, Target, Clock } from 'lucide-react';

export function BacktestingPage() {
  const { data: backtests = [], isLoading } = useQuery({
    queryKey: ['backtests'],
    queryFn: () => backtestService.getAll(),
  });

  const columns = [
    { key: 'name' as const, label: 'Name', sortable: true, render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'strategy' as const, label: 'Strategy', sortable: true, render: (v: any) => <Badge variant="outline">{v?.name || 'N/A'}</Badge> },
    { key: 'status' as const, label: 'Status', sortable: true, render: (v: string) => <Badge variant={v === 'completed' ? 'success' : v === 'running' ? 'default' : 'muted'}>{v}</Badge> },
    { key: 'totalTrades' as const, label: 'Trades', sortable: true, render: (v: number) => v || '-' },
    { key: 'winRate' as const, label: 'Win Rate', sortable: true, render: (v?: number) => v ? `${v.toFixed(1)}%` : '-' },
    { key: 'totalReturn' as const, label: 'Return', sortable: true, render: (v?: number) => <Badge variant={(v||0) >= 0 ? 'success' : 'danger'}>{v ? `${v.toFixed(2)}%` : '-'}</Badge> },
    { key: 'sharpeRatio' as const, label: 'Sharpe', sortable: true, render: (v?: number) => v ? v.toFixed(2) : '-' },
    { key: 'createdAt' as const, label: 'Date', sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Backtesting" description="Test your strategies on historical data" action={<Button><Plus size={18} className="mr-2"/>New Backtest</Button>} />
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Total Backtests" value={backtests.length || 0} icon={Activity} trend={0} />
        <StatCard title="Completed" value={backtests.filter(b => b.status === 'completed').length || 0} icon={Target} trend={0} />
        <StatCard title="Running" value={backtests.filter(b => b.status === 'running').length || 0} icon={Clock} trend={0} />
        <StatCard title="Avg Return" value={`${backtests.reduce((a,b) => a + (b.totalReturn||0), 0) / (backtests.length || 1)}%`} icon={TrendingUp} trend={0} />
      </div>
      <Card>
        <div className="p-4 border-b"><h3 className="text-lg font-semibold">Backtest Results</h3></div>
        {isLoading ? <div className="p-8 text-center">Loading...</div> : backtests.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No backtests yet. Create your first backtest to see results.</div>
        ) : <DataTable columns={columns} data={backtests} defaultSort={{key:'createdAt',direction:'desc'}} />}
      </Card>
    </div>
  );
}
