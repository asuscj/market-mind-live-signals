
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface IndicatorProps {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    current: number;
  };
  volume: number;
  avgVolume: number;
}

const TechnicalIndicators: React.FC<IndicatorProps> = ({ 
  rsi, 
  macd, 
  bollinger, 
  volume, 
  avgVolume 
}) => {
  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { signal: 'SOBREVENTA', color: 'text-red-400', icon: TrendingDown };
    if (rsi < 30) return { signal: 'SOBRECOMPRA', color: 'text-green-400', icon: TrendingUp };
    return { signal: 'NEUTRAL', color: 'text-blue-400', icon: Activity };
  };

  const getMACDSignal = () => {
    if (macd.macd > macd.signal) return { signal: 'ALCISTA', color: 'text-green-400' };
    return { signal: 'BAJISTA', color: 'text-red-400' };
  };

  const getBollingerSignal = () => {
    const { upper, lower, current } = bollinger;
    if (current > upper) return { signal: 'SOBRECOMPRA', color: 'text-red-400' };
    if (current < lower) return { signal: 'SOBREVENTA', color: 'text-green-400' };
    return { signal: 'RANGO NORMAL', color: 'text-blue-400' };
  };

  const rsiSignal = getRSISignal(rsi);
  const macdSignal = getMACDSignal();
  const bollingerSignal = getBollingerSignal();
  const volumeRatio = (volume / avgVolume) * 100;

  const RSIIcon = rsiSignal.icon;

  return (
    <div className="trading-card p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center space-x-2">
        <Activity className="w-5 h-5 trading-gold" />
        <span>Indicadores Técnicos</span>
      </h3>

      <div className="space-y-6">
        {/* RSI */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <RSIIcon className="w-4 h-4" />
              <span className="font-semibold">RSI (14)</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{rsi.toFixed(1)}</div>
              <div className={`text-xs ${rsiSignal.color}`}>{rsiSignal.signal}</div>
            </div>
          </div>
          <Progress value={rsi} className="h-2" />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0</span>
            <span className="text-green-400">30</span>
            <span className="text-red-400">70</span>
            <span>100</span>
          </div>
        </div>

        {/* MACD */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">MACD</span>
            <div className="text-right">
              <div className="font-bold">{macd.macd.toFixed(3)}</div>
              <div className={`text-xs ${macdSignal.color}`}>{macdSignal.signal}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-gray-400">MACD</div>
              <div className="font-semibold">{macd.macd.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-gray-400">Señal</div>
              <div className="font-semibold">{macd.signal.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-gray-400">Histograma</div>
              <div className={`font-semibold ${macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {macd.histogram.toFixed(3)}
              </div>
            </div>
          </div>
        </div>

        {/* Bandas de Bollinger */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Bollinger Bands</span>
            <div className="text-right">
              <div className="font-bold">${bollinger.current.toLocaleString()}</div>
              <div className={`text-xs ${bollingerSignal.color}`}>{bollingerSignal.signal}</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <div className="text-gray-400">Superior</div>
              <div className="font-semibold text-red-400">${bollinger.upper.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Media</div>
              <div className="font-semibold text-blue-400">${bollinger.middle.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-400">Inferior</div>
              <div className="font-semibold text-green-400">${bollinger.lower.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Volumen */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Volumen</span>
            <div className="text-right">
              <div className="font-bold">{(volume / 1000000).toFixed(1)}M</div>
              <div className={`text-xs ${volumeRatio > 150 ? 'text-yellow-400' : 'text-gray-400'}`}>
                {volumeRatio.toFixed(0)}% del promedio
              </div>
            </div>
          </div>
          <Progress value={Math.min(volumeRatio, 200)} className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default TechnicalIndicators;
