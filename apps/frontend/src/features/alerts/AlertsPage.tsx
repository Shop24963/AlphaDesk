import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockService } from '@/services/stock.service';
import { alertService } from '@/services/alert.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Search,
  Plus,
  Trash2,
  Edit
} from 'lucide-react';
import { StockChart } from '@/components/charts/stock-chart';
import { useToast } from '@/hooks/useToast';

interface AlertFormData {
  symbol: string;
  condition: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  price: number;
  notificationType: 'email' | 'sms' | 'push';
}

export function AlertsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const { toast } = useToast();

  const { data: alerts, isLoading, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: () => alertService.getAll(),
  });

  const { data: stocks } = useQuery({
    queryKey: ['stocks-list'],
    queryFn: () => stockService.getList({ limit: 100 }),
  });

  const handleDeleteAlert = async (id: string) => {
    try {
      await alertService.delete(id);
      toast({
        title: 'Alert deleted',
        description: 'Your alert has been removed.',
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete alert.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAlert = async (id: string, isActive: boolean) => {
    try {
      if (isActive) {
        await alertService.toggle(id);
      } else {
        await alertService.toggle(id);
      }
      toast({
        title: isActive ? 'Alert activated' : 'Alert deactivated',
        description: `Alert ${isActive ? 'activated' : 'deactivated'} successfully.`,
      });
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update alert.',
        variant: 'destructive',
      });
    }
  };

  const columns = [
    {
      key: 'symbol' as const,
      label: 'Symbol',
      sortable: true,
      render: (value: string) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: 'condition' as const,
      label: 'Condition',
      sortable: true,
      render: (value: string) => {
        const conditionMap: Record<string, string> = {
          above: 'Price >',
          below: 'Price <',
          crosses_above: 'Crosses Above',
          crosses_below: 'Crosses Below',
        };
        return <Badge variant="outline">{conditionMap[value] || value}</Badge>;
      },
    },
    {
      key: 'price' as const,
      label: 'Target Price',
      sortable: true,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'currentPrice' as const,
      label: 'Current Price',
      sortable: true,
      render: (value: number) => `₹${value.toFixed(2)}`,
    },
    {
      key: 'notificationType' as const,
      label: 'Notification',
      sortable: false,
      render: (value: string) => (
        <Badge variant="secondary" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: 'isActive' as const,
      label: 'Status',
      sortable: true,
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'muted'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions' as const,
      label: 'Actions',
      sortable: false,
      render: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleToggleAlert(row._id, !row.isActive)}
          >
            {row.isActive ? <Activity size={16} /> : <Bell size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedAlert(row._id)}
          >
            <Edit size={16} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteAlert(row._id)}
          >
            <Trash2 size={16} className="text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const filteredAlerts = alerts?.filter((alert) =>
    alert.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const activeAlertsCount = alerts?.filter((a) => a.isActive).length || 0;
  const triggeredToday = alerts?.filter((a) => {
    const today = new Date().toDateString();
    return a.triggeredAt && new Date(a.triggeredAt).toDateString() === today;
  }).length || 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Alerts"
        description="Set and manage price alerts for your watchlist stocks"
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={18} className="mr-2" />
            Create Alert
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Alerts"
          value={alerts?.length || 0}
          icon={Bell}
          trend={0}
        />
        <StatCard
          title="Active Alerts"
          value={activeAlertsCount}
          icon={Activity}
          trend={0}
        />
        <StatCard
          title="Triggered Today"
          value={triggeredToday}
          icon={TrendingUp}
          trend={triggeredToday > 0 ? 100 : 0}
        />
        <StatCard
          title="Watchlist Stocks"
          value={stocks?.length || 0}
          icon={Search}
          trend={0}
        />
      </div>

      {/* Alerts Table */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading alerts...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first price alert to get notified when stocks reach your target prices.
            </p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="mr-2" />
              Create Alert
            </Button>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredAlerts}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
          />
        )}
      </Card>

      {/* Create Alert Modal - Simplified */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create Price Alert</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Symbol</label>
                <Input placeholder="e.g., RELIANCE" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Condition</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="above">Price goes above</option>
                  <option value="below">Price goes below</option>
                  <option value="crosses_above">Crosses above</option>
                  <option value="crosses_below">Crosses below</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Target Price</label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notification</label>
                <select className="w-full p-2 border rounded-md">
                  <option value="push">Push Notification</option>
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1">
                  Create Alert
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
