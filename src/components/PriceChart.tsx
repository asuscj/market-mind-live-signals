
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  symbol?: string;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, currentPrice, symbol = 'BTC/USD' }) => {
  const priceChange = data.length > 1 ? 
    ((currentPrice - data[data.length - 2]?.price) / data[data.length - 2]?.price) * 100 : 0;

  // Show loading state if no data
  if (!data || data.length === 0) {
    return (
      <div className="trading-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{symbol} - Cargando datos...</h2>
          <div className="text-2xl font-bold trading-gold">
            Conectando...
          </div>
        </div>
        
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Obteniendo datos de Binance...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="trading-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">{symbol} - Datos en Tiempo Real (Binance)</h2>
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold trading-gold">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </div>
          <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
          </div>
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
      
      <div className="mt-4 text-xs text-gray-400">
        * Datos actualizados cada 10 segundos desde Binance API | Última actualización: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default PriceChart;
