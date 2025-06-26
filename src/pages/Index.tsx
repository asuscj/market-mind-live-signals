
import React, { useState } from 'react';
import TradingHeader from '@/components/TradingHeader';
import PriceChart from '@/components/PriceChart';
import SignalPanel from '@/components/SignalPanel';
import TechnicalIndicators from '@/components/TechnicalIndicators';
import Portfolio from '@/components/Portfolio';
import CryptoSelector from '@/components/CryptoSelector';
import ModelMetrics from '@/components/ModelMetrics';
import Backtesting from '@/components/Backtesting';
import { useBinanceData } from '@/hooks/useBinanceData';
import { useMLPredictions } from '@/hooks/useMLPredictions';

const Index = () => {
  const [selectedCrypto, setSelectedCrypto] = useState('BTCUSDT');
  const [activeTab, setActiveTab] = useState<'live' | 'backtest'>('live');
  
  const {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators,
    mlTrading
  } = useBinanceData(selectedCrypto);

  const mlPredictions = useMLPredictions(selectedCrypto);

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

      {/* Navegación entre pestañas */}
      <div className="flex space-x-4 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('live')}
          className={`py-2 px-4 font-semibold ${
            activeTab === 'live' 
              ? 'text-yellow-400 border-b-2 border-yellow-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Trading en Vivo
        </button>
        <button
          onClick={() => setActiveTab('backtest')}
          className={`py-2 px-4 font-semibold ${
            activeTab === 'backtest' 
              ? 'text-yellow-400 border-b-2 border-yellow-400' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Backtesting Histórico
        </button>
      </div>

      {activeTab === 'live' ? (
        <>
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

            <div>
              <ModelMetrics 
                metrics={mlTrading.modelMetrics}
                modelStatus={mlTrading.modelStatus}
              />
            </div>
          </div>

          {/* Predicción ML Actual */}
          {mlPredictions.currentPrediction && (
            <div className="trading-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    mlPredictions.currentPrediction.action === 'BUY' ? 'bg-green-400' : 
                    mlPredictions.currentPrediction.action === 'SELL' ? 'bg-red-400' : 'bg-blue-400'
                  }`}></div>
                  <span className="font-semibold">
                    Predicción ML: {mlPredictions.currentPrediction.action}
                  </span>
                  <span className="text-sm text-gray-400">
                    ({mlPredictions.currentPrediction.confidence.toFixed(1)}% confianza)
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Precisión Reciente: {mlPredictions.getRecentAccuracy().toFixed(1)}%
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          <div className="xl:col-span-3">
            <Backtesting 
              symbol={selectedCrypto}
              mlPrediction={mlPredictions.currentPrediction}
            />
          </div>
          <div>
            <ModelMetrics 
              metrics={mlTrading.modelMetrics}
              modelStatus={mlTrading.modelStatus}
            />
          </div>
        </div>
      )}

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
