import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  ema20?: number;
  ema50?: number;
  rsi?: number;
}

interface StockChartProps {
  data: CandleData[];
  height?: number;
  showEma20?: boolean;
  showEma50?: boolean;
  showVolume?: boolean;
}

export function StockChart({ 
  data, 
  height = 400, 
  showEma20 = false, 
  showEma50 = false,
  showVolume = true 
}: StockChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No chart data available</div>;
  }

  const prices = data.flatMap(d => [d.high, d.low]);
  const maxValue = Math.max(...prices);
  const minValue = Math.min(...prices);
  const padding = (maxValue - minValue) * 0.1;

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={height * 0.7}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="time" 
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }}
          />
          <YAxis 
            domain={[minValue - padding, maxValue + padding]}
            stroke="#6b7280"
            fontSize={12}
            tickFormatter={(value) => `₹${value.toFixed(2)}`}
            orientation="right"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
            formatter={(val: number, name: string) => [`₹${val.toFixed(2)}`, name.toUpperCase()]}
          />
          <Line 
            type="monotone" 
            dataKey="close" 
            stroke="#22c55e" 
            strokeWidth={2} 
            dot={false}
            name="Close"
          />
          {showEma20 && (
            <Line 
              type="monotone" 
              dataKey="ema20" 
              stroke="#3b82f6" 
              strokeWidth={1.5} 
              dot={false}
              name="EMA 20"
            />
          )}
          {showEma50 && (
            <Line 
              type="monotone" 
              dataKey="ema50" 
              stroke="#f59e0b" 
              strokeWidth={1.5} 
              dot={false}
              name="EMA 50"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
      
      {showVolume && (
        <ResponsiveContainer width="100%" height={height * 0.3}>
          <LineChart data={data}>
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
              hide
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              hide
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              formatter={(val: number) => [val.toLocaleString(), 'Volume']}
            />
            <Line 
              type="monotone" 
              dataKey="volume" 
              stroke="#8b5cf6" 
              strokeWidth={1} 
              dot={false}
              name="Volume"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
