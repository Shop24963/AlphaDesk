import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { BookOpen, TrendingUp, TrendingDown, Target, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';

interface JournalEntry {
  _id: string;
  date: string;
  symbol: string;
  transactionType: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  pnl?: number;
  strategy: string;
  rating: number;
}

export function JournalPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const mockEntries: JournalEntry[] = [
    {
      _id: '1',
      date: new Date().toISOString(),
      symbol: 'RELIANCE',
      transactionType: 'BUY',
      quantity: 10,
      entryPrice: 2450.00,
      exitPrice: 2520.00,
      pnl: 700.00,
      strategy: 'Swing Trading',
      rating: 4,
    },
  ];

  const { data: entries = mockEntries, isLoading } = useQuery({
    queryKey: ['journal-entries'],
    queryFn: async () => mockEntries,
  });

  const totalTrades = entries.length;
  const winningTrades = entries.filter(e => (e.pnl || 0) > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = entries.reduce((sum, e) => sum + (e.pnl || 0), 0);

  const columns = [
    { key: 'date' as const, label: 'Date', sortable: true, render: (v: string) => new Date(v).toLocaleDateString() },
    { key: 'symbol' as const, label: 'Symbol', sortable: true, render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'transactionType' as const, label: 'Type', sortable: true, render: (v: string) => <Badge variant={v === 'BUY' ? 'success' : 'danger'}>{v}</Badge> },
    { key: 'quantity' as const, label: 'Qty', sortable: true, render: (v: number) => v.toLocaleString() },
    { key: 'entryPrice' as const, label: 'Entry', sortable: true, render: (v: number) => `₹${v.toFixed(2)}` },
    { key: 'exitPrice' as const, label: 'Exit', sortable: true, render: (v?: number) => v ? `₹${v.toFixed(2)}` : '-' },
    { key: 'pnl' as const, label: 'P&L', sortable: true, render: (v?: number) => <Badge variant={(v||0) >= 0 ? 'success' : 'danger'}>{(v||0) >= 0 ? '+' : ''}₹{(v||0).toFixed(2)}</Badge> },
    { key: 'strategy' as const, label: 'Strategy', sortable: true, render: (v: string) => <Badge variant="outline">{v}</Badge> },
    { key: 'rating' as const, label: 'Rating', sortable: true, render: (v: number) => <div className="flex gap-1">{[1,2,3,4,5].map(s => <span key={s} className={s <= v ? 'text-yellow-500' : 'text-muted-foreground'}>★</span>)}</div> },
    { key: 'actions' as const, label: 'Actions', sortable: false, render: (_: any, row: any) => <div className="flex gap-2"><Button variant="ghost" size="sm"><Edit size={16}/></Button><Button variant="ghost" size="sm"><Trash2 size={16} className="text-destructive"/></Button></div> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Trading Journal" description="Track and analyze your trades" action={<Button onClick={() => setShowAddModal(true)}><Plus size={18} className="mr-2"/>Add Trade</Button>} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard title="Total Trades" value={totalTrades} icon={BookOpen} trend={0} />
        <StatCard title="Win Rate" value={`${winRate.toFixed(1)}%`} icon={Target} trend={0} />
        <StatCard title="Total P&L" value={`${totalPnL >= 0 ? '+' : ''}₹${totalPnL.toFixed(2)}`} icon={totalPnL >= 0 ? TrendingUp : TrendingDown} trend={0} />
        <StatCard title="Avg Win" value="₹0" icon={TrendingUp} trend={0} />
        <StatCard title="Avg Loss" value="₹0" icon={TrendingDown} trend={0} />
      </div>
      <Card>
        <div className="p-4 border-b flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
          <Button variant="outline"><Filter size={18} className="mr-2"/>Filters</Button>
        </div>
        {isLoading ? <div className="p-8 text-center">Loading...</div> : <DataTable columns={columns} data={entries} defaultSort={{key:'date',direction:'desc'}} />}
      </Card>
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Add Trade</h3>
            <p className="text-muted-foreground mb-4">Trade entry form coming soon.</p>
            <Button onClick={() => setShowAddModal(false)}>Close</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
