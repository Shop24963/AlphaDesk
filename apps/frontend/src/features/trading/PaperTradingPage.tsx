import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradingService } from '@/services/trading.service';
import { portfolioService } from '@/services/portfolio.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatCard } from '@/components/common/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Activity,
  Plus,
  X,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useToast } from '@/hooks/useToast';

interface OrderFormData {
  symbol: string;
  quantity: number;
  orderType: 'MARKET' | 'LIMIT';
  transactionType: 'BUY' | 'SELL';
  price?: number;
}

export function PaperTradingPage() {
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderFormData>({
    symbol: '',
    quantity: 1,
    orderType: 'MARKET',
    transactionType: 'BUY',
    price: undefined,
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['paper-account'],
    queryFn: () => tradingService.getAccount(),
  });

  const { data: positions, isLoading: positionsLoading } = useQuery({
    queryKey: ['paper-positions'],
    queryFn: () => tradingService.getPositions(),
  });

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['paper-orders'],
    queryFn: () => tradingService.getOrders(),
  });

  const placeOrderMutation = useMutation({
    mutationFn: (data: OrderFormData) => tradingService.placeOrder(data),
    onSuccess: () => {
      toast({
        title: 'Order placed',
        description: 'Your paper order has been executed.',
      });
      setShowOrderModal(false);
      queryClient.invalidateQueries({ queryKey: ['paper'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to place order.',
        variant: 'destructive',
      });
    },
  });

  const handlePlaceOrder = () => {
    placeOrderMutation.mutate(orderForm);
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
      key: 'quantity' as const,
      label: 'Quantity',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'averagePrice' as const,
      label: 'Avg Price',
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
      key: 'pnl' as const,
      label: 'P&L',
      sortable: true,
      render: (value: number) => (
        <Badge variant={value >= 0 ? 'success' : 'danger'}>
          {value >= 0 ? '+' : ''}₹{value.toFixed(2)}
        </Badge>
      ),
    },
    {
      key: 'pnlPercent' as const,
      label: 'P&L %',
      sortable: true,
      render: (value: number) => (
        <div className={`flex items-center ${value >= 0 ? 'text-success' : 'text-danger'}`}>
          {value >= 0 ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
          {value.toFixed(2)}%
        </div>
      ),
    },
  ];

  const orderColumns = [
    {
      key: 'symbol' as const,
      label: 'Symbol',
      sortable: true,
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'transactionType' as const,
      label: 'Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant={value === 'BUY' ? 'success' : 'danger'} className="capitalize">
          {value.toLowerCase()}
        </Badge>
      ),
    },
    {
      key: 'orderType' as const,
      label: 'Order Type',
      sortable: true,
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      ),
    },
    {
      key: 'quantity' as const,
      label: 'Qty',
      sortable: true,
      render: (value: number) => value.toLocaleString(),
    },
    {
      key: 'price' as const,
      label: 'Price',
      sortable: true,
      render: (value: number | null) => value ? `₹${value.toFixed(2)}` : 'Market',
    },
    {
      key: 'status' as const,
      label: 'Status',
      sortable: true,
      render: (value: string) => {
        const statusConfig: Record<string, { badge: string; icon: any }> = {
          PENDING: { badge: 'muted', icon: Clock },
          EXECUTED: { badge: 'success', icon: CheckCircle },
          REJECTED: { badge: 'danger', icon: X },
        };
        const config = statusConfig[value] || statusConfig.PENDING;
        const Icon = config.icon;
        return (
          <Badge variant={config.badge as any} className="flex items-center gap-1">
            <Icon size={12} />
            {value}
          </Badge>
        );
      },
    },
    {
      key: 'createdAt' as const,
      label: 'Time',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleTimeString(),
    },
  ];

  const totalPnL = positions?.reduce((sum, pos) => sum + pos.pnl, 0) || 0;
  const totalPnLPercent = account?.initialCapital 
    ? (totalPnL / account.initialCapital) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paper Trading"
        description="Practice trading with virtual money to test your strategies"
        action={
          <Button onClick={() => setShowOrderModal(true)}>
            <Plus size={18} className="mr-2" />
            Place Order
          </Button>
        }
      />

      {/* Account Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Capital"
          value={account?.totalCapital ? `₹${account.totalCapital.toLocaleString()}` : '₹0'}
          icon={DollarSign}
          trend={0}
        />
        <StatCard
          title="Available Cash"
          value={account?.availableCash ? `₹${account.availableCash.toLocaleString()}` : '₹0'}
          icon={Activity}
          trend={0}
        />
        <StatCard
          title="Total P&L"
          value={totalPnL >= 0 ? `+₹${totalPnL.toFixed(2)}` : `-₹${Math.abs(totalPnL).toFixed(2)}`}
          icon={totalPnL >= 0 ? TrendingUp : TrendingDown}
          trend={totalPnLPercent}
        />
        <StatCard
          title="Invested Amount"
          value={account?.investedAmount ? `₹${account.investedAmount.toLocaleString()}` : '₹0'}
          icon={DollarSign}
          trend={0}
        />
      </div>

      {/* Positions */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Current Positions</h3>
        </div>

        {positionsLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading positions...</p>
          </div>
        ) : positions && positions.length > 0 ? (
          <DataTable
            columns={columns}
            data={positions}
            defaultSort={{ key: 'pnl', direction: 'desc' }}
          />
        ) : (
          <div className="p-8 text-center">
            <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No open positions</h3>
            <p className="text-muted-foreground mb-4">
              Start paper trading to build your virtual portfolio.
            </p>
            <Button onClick={() => setShowOrderModal(true)}>
              <Plus size={18} className="mr-2" />
              Place Your First Order
            </Button>
          </div>
        )}
      </Card>

      {/* Recent Orders */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>

        {ordersLoading ? (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">Loading orders...</p>
          </div>
        ) : orders && orders.length > 0 ? (
          <DataTable
            columns={orderColumns}
            data={orders.slice(0, 10)}
            defaultSort={{ key: 'createdAt', direction: 'desc' }}
          />
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            No recent orders
          </div>
        )}
      </Card>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Place Paper Order</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowOrderModal(false)}
              >
                <X size={18} />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Symbol *</label>
                <Input
                  placeholder="e.g., RELIANCE"
                  value={orderForm.symbol}
                  onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Transaction Type *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={orderForm.transactionType}
                    onChange={(e) => setOrderForm({ ...orderForm, transactionType: e.target.value as 'BUY' | 'SELL' })}
                  >
                    <option value="BUY">Buy</option>
                    <option value="SELL">Sell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Order Type *</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={orderForm.orderType}
                    onChange={(e) => setOrderForm({ ...orderForm, orderType: e.target.value as 'MARKET' | 'LIMIT' })}
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <Input
                    type="number"
                    min="1"
                    value={orderForm.quantity}
                    onChange={(e) => setOrderForm({ ...orderForm, quantity: parseInt(e.target.value) || 0 })}
                  />
                </div>

                {orderForm.orderType === 'LIMIT' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Limit Price *</label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={orderForm.price || ''}
                      onChange={(e) => setOrderForm({ ...orderForm, price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowOrderModal(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={handlePlaceOrder}
                  disabled={!orderForm.symbol || orderForm.quantity <= 0}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
