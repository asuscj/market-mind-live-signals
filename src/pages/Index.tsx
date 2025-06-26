
import React, { useState } from 'react';
import TradingHeader from '@/components/TradingHeader';
import PriceChart from '@/components/PriceChart';
import SignalPanel from '@/components/SignalPanel';
import TechnicalIndicators from '@/components/TechnicalIndicators';
import Portfolio from '@/components/Portfolio';
import CryptoSelector from '@/components/CryptoSelector';
import { useBinanceData } from '@/hooks/useBinanceData';

const Index = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  
  const {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators
  } = useBinanceData(selectedCrypto);

  // Datos estáticos para el portfolio
  const mockPositions = [
    {
      symbol: 'BTC/USDT',
      quantity: 0.5,
      avgPrice: 65800,
      currentPrice: currentPrice || 67234,
      pnl: ((currentPrice || 67234) - 65800) * 0.5,
      pnlPercent: (((currentPrice || 67234) - 65800) / 65800) * 100
    },
    {
      symbol: 'ADA/USDT',
      quantity: 1000,
      avgPrice: 0.45,
      currentPrice: 0.48,
      pnl: (0.48 - 0.45) * 1000,
      pnlPercent: ((0.48 - 0.45) / 0.45) * 100
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-6">
      <TradingHeader />
      
      {/* Selector de Criptomoneda */}
      <CryptoSelector 
        selectedCrypto={selectedCrypto}
        onCryptoChange={setSelectedCrypto}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal - Gráfico */}
        <div className="lg:col-span-2">
          <PriceChart 
            data={priceData} 
            currentPrice={currentPrice}
            symbol={selectedCrypto.replace('USDT', '/USDT')}
          />
        </div>
        
        {/* Columna Derecha - Señales */}
        <div>
          <SignalPanel signals={signals} currentSignal={currentSignal} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicadores Técnicos */}
        <div>
          <TechnicalIndicators {...indicators} />
        </div>
        
        {/* Portfolio */}
        <div>
          <Portfolio 
            balance={50000}
            totalValue={53247}
            dayPnL={1247}
            positions={mockPositions}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
