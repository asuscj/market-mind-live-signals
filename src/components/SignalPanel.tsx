
import React from 'react';
import { ArrowUp, ArrowDown, Minus, TrendingUp, Activity } from 'lucide-react';

interface Signal {
  id: string;
  type: 'BUY' | 'SELL' | 'HOLD';
  symbol: string;
  price: number;
  confidence: number;
  timestamp: string;
  reason: string;
  profit?: number;
}

interface SignalPanelProps {
  signals: Signal[];
  currentSignal: Signal | null;
}

const SignalPanel: React.FC<SignalPanelProps> = ({ signals, currentSignal }) => {
  const getSignalIcon = (type: string) => {
    switch (type) {
      case 'BUY':
        return <ArrowUp className="w-5 h-5" />;
      case 'SELL':
        return <ArrowDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getSignalClass = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'signal-buy bg-green-900/20 border-green-500/30';
      case 'SELL':
        return 'signal-sell bg-red-900/20 border-red-500/30';
      default:
        return 'signal-neutral bg-blue-900/20 border-blue-500/30';
    }
  };

  const getPulseClass = (type: string) => {
    switch (type) {
      case 'BUY':
        return 'pulse-buy';
      case 'SELL':
        return 'pulse-sell';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Señal Actual */}
      {currentSignal && (
        <div className={`trading-card p-6 ${getSignalClass(currentSignal.type)} ${getPulseClass(currentSignal.type)}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${currentSignal.type === 'BUY' ? 'bg-green-500' : currentSignal.type === 'SELL' ? 'bg-red-500' : 'bg-blue-500'}`}>
                {getSignalIcon(currentSignal.type)}
              </div>
              <div>
                <h3 className="text-xl font-bold">SEÑAL ACTIVA</h3>
                <p className="text-sm text-gray-400">{currentSignal.timestamp}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{currentSignal.type}</div>
              <div className="text-sm">Confianza: {currentSignal.confidence}%</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-400">Símbolo</div>
              <div className="text-lg font-bold">{currentSignal.symbol}</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Precio</div>
              <div className="text-lg font-bold">${currentSignal.price.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-800 rounded">
            <div className="text-sm text-gray-400">Razón del Análisis</div>
            <div className="text-sm">{currentSignal.reason}</div>
          </div>
        </div>
      )}

      {/* Historial de Señales */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Historial de Señales</h3>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {signals.map((signal) => (
            <div key={signal.id} className={`p-3 rounded border ${getSignalClass(signal.type)}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded ${signal.type === 'BUY' ? 'bg-green-500' : signal.type === 'SELL' ? 'bg-red-500' : 'bg-blue-500'}`}>
                    {getSignalIcon(signal.type)}
                  </div>
                  <div>
                    <div className="font-semibold">{signal.type} {signal.symbol}</div>
                    <div className="text-xs text-gray-400">{signal.timestamp}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${signal.price.toLocaleString()}</div>
                  {signal.profit && (
                    <div className={`text-xs ${signal.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {signal.profit > 0 ? '+' : ''}{signal.profit.toFixed(2)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SignalPanel;
