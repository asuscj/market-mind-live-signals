
import React from 'react';
import TradingHeader from '@/components/TradingHeader';
import PriceChart from '@/components/PriceChart';
import SignalPanel from '@/components/SignalPanel';
import TechnicalIndicators from '@/components/TechnicalIndicators';
import Portfolio from '@/components/Portfolio';
import { useTradingData } from '@/hooks/useTradingData';

const Index = () => {
  const {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators,
    positions,
    portfolio
  } = useTradingData();

  return (
    <div className="min-h-screen p-6 space-y-6">
      <TradingHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal - Gráfico */}
        <div className="lg:col-span-2">
          <PriceChart data={priceData} currentPrice={currentPrice} />
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
          <Portfolio {...portfolio} positions={positions} />
        </div>
      </div>
    </div>
  );
};

export default Index;
