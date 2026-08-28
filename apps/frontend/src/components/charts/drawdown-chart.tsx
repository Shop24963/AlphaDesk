import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DrawdownData {
  date: string;
  drawdown: number;
  underwater?: number;
}

interface DrawdownChartProps {
  data: DrawdownData[];
  height?: number;
}

export function DrawdownChart({ data, height = 250 }: DrawdownChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">No data available</div>;
  }

  const maxDrawdown = Math.min(...data.map(d => d.drawdown));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#6b7280"
          fontSize={12}
        />
        <YAxis 
          stroke="#6b7280"
          fontSize={12}
          tickFormatter={(value) => `${value.toFixed(2)}%`}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
          formatter={(value: number) => [`${value.toFixed(2)}%`, 'Drawdown']}
        />
        <ReferenceLine y={0} stroke="#6b7280" />
        <ReferenceLine y={maxDrawdown} stroke="#ef4444" strokeDasharray="3 3" label={{ value: `Max: ${maxDrawdown.toFixed(2)}%`, fill: '#ef4444', fontSize: 12 }} />
        <Bar 
          dataKey="drawdown" 
          fill="#ef4444" 
          opacity={0.7}
          name="Drawdown %"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
