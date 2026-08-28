import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface EquityCurveData {
  date: string;
  value: number;
  benchmark?: number;
}

interface EquityCurveProps {
  data: EquityCurveData[];
  height?: number;
  showBenchmark?: boolean;
}

export function EquityCurve({ data, height = 300, showBenchmark = false }: EquityCurveProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.value, d.benchmark || 0)));
  const minValue = Math.min(...data.map(d => Math.min(d.value, d.benchmark || 0)));
  const padding = (maxValue - minValue) * 0.1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
          </linearGradient>
          {showBenchmark && (
            <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          tickFormatter={(value) => format(new Date(value), 'MMM dd')}
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          domain={[minValue - padding, maxValue + padding]}
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => `₹${value.toLocaleString()}`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
          labelFormatter={(value) => format(new Date(value), 'MMMM dd, yyyy')}
          formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Value']}
        />
        <ReferenceLine y={data[0]?.value || 0} stroke="#6b7280" strokeDasharray="3 3" />
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke="#22c55e" 
          fillOpacity={1} 
          fill="url(#colorValue)" 
          strokeWidth={2}
        />
        {showBenchmark && (
          <Area 
            type="monotone" 
            dataKey="benchmark" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorBenchmark)" 
            strokeWidth={2}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
