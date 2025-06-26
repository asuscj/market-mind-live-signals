
import React, { useState } from 'react';
import TradingHeader from '@/components/TradingHeader';
import PriceChart from '@/components/PriceChart';
import SignalPanel from '@/components/SignalPanel';
import TechnicalIndicators from '@/components/TechnicalIndicators';
import Portfolio from '@/components/Portfolio';
import CryptoSelector from '@/components/CryptoSelector';
import ModelMetrics from '@/components/ModelMetrics';
import { useBinanceData } from '@/hooks/useBinanceData';

const Index = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  
  const {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators,
    mlTrading
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
      
      <CryptoSelector 
        selectedCrypto={selectedCrypto}
        onCryptoChange={setSelectedCrypto}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart 
            data={priceData} 
            currentPrice={currentPrice}
            symbol={selectedCrypto.replace('USDT', '/USDT')}
          />
        </div>
        
        <div>
          <SignalPanel signals={signals} currentSignal={currentSignal} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <TechnicalIndicators {...indicators} />
        </div>
        
        <div>
          <Portfolio 
            balance={50000}
            totalValue={53247}
            dayPnL={1247}
            positions={mockPositions}
          />
        </div>

        {/* Nuevas Métricas ML */}
        <div>
          <ModelMetrics 
            metrics={mlTrading.modelMetrics}
            modelStatus={mlTrading.modelStatus}
          />
        </div>
      </div>

      {/* Indicador de carga de datos ML */}
      {mlTrading.isLoadingData && (
        <div className="fixed bottom-4 right-4 trading-card p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
            <span className="text-sm">Entrenando modelo ML...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
