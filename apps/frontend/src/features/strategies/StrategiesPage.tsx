import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { strategyService } from '@/services/strategy.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, Play, Edit, Trash2, TrendingUp, Activity, Target } from 'lucide-react';

export function StrategiesPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'backtested'>('all');

  const { data: strategies = [], isLoading } = useQuery({
    queryKey: ['strategies'],
    queryFn: () => strategyService.getAll(),
  });

  const columns = [
    { key: 'name' as const, label: 'Name', sortable: true, render: (v: string) => <span className="font-semibold">{v}</span> },
    { key: 'type' as const, label: 'Type', sortable: true, render: (v: string) => <Badge variant="outline">{v}</Badge> },
    { key: 'timeframe' as const, label: 'Timeframe', sortable: true, render: (v: string) => v },
    { key: 'isActive' as const, label: 'Status', sortable: true, render: (v: boolean) => <Badge variant={v ? 'success' : 'muted'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'winRate' as const, label: 'Win Rate', sortable: true, render: (v?: number) => v ? `${v.toFixed(1)}%` : '-' },
    { key: 'actions' as const, label: 'Actions', sortable: false, render: (_: any, row: any) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm"><Play size={16}/></Button>
        <Button variant="ghost" size="sm"><Edit size={16}/></Button>
        <Button variant="ghost" size="sm"><Trash2 size={16} className="text-destructive"/></Button>
      </div>
    )},
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Strategies" description="Build and manage your trading strategies" action={<Button><Plus size={18} className="mr-2"/>Create Strategy</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Strategies" value={strategies.length || 0} icon={Activity} trend={0} />
        <StatCard title="Active Strategies" value={strategies.filter(s => s.isActive).length || 0} icon={TrendingUp} trend={0} />
        <StatCard title="Avg Win Rate" value={`${(strategies.reduce((a,b) => a + (b.winRate||0), 0) / (strategies.length || 1)).toFixed(1)}%`} icon={Target} trend={0} />
      </div>
      <Card>
        <div className="p-4 border-b flex gap-2">
          <Button variant={!activeTab || activeTab === 'all' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('all')}>All</Button>
          <Button variant={activeTab === 'active' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('active')}>Active</Button>
          <Button variant={activeTab === 'backtested' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveTab('backtested')}>Backtested</Button>
        </div>
        {isLoading ? <div className="p-8 text-center">Loading...</div> : <DataTable columns={columns} data={strategies} defaultSort={{key:'createdAt',direction:'desc'}} />}
      </Card>
    </div>
  );
}
