
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PriceData {
  time: string;
  price: number;
  sma20: number;
  sma50: number;
  volume: number;
}

interface PriceChartProps {
  data: PriceData[];
  currentPrice: number;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, currentPrice }) => {
  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">BTC/USD - Análisis en Tiempo Real</h2>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold trading-gold">
            ${currentPrice.toLocaleString()}
          </div>
          <div className="text-sm text-green-400">+2.34%</div>
        </div>
      </div>
      
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={['dataMin - 100', 'dataMax + 100']}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#F59E0B" 
              strokeWidth={2}
              dot={false}
              name="Precio"
            />
            <Line 
              type="monotone" 
              dataKey="sma20" 
              stroke="#10B981" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="SMA 20"
            />
            <Line 
              type="monotone" 
              dataKey="sma50" 
              stroke="#3B82F6" 
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="SMA 50"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceChart;
