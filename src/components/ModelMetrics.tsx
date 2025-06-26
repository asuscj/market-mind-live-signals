
import React from 'react';
import { Brain, TrendingUp, Target, Award, Activity, BarChart3 } from 'lucide-react';

interface ModelMetricsProps {
  metrics: {
    accuracy: number;
    precision: { buy: number; sell: number; hold: number };
    recall: { buy: number; sell: number; hold: number };
    f1Score: number;
    roi: number;
    winRate: number;
    totalTrades: number;
    profitableTrades: number;
  };
  modelStatus: {
    trained: boolean;
    training: boolean;
    trainingHistory: any[];
    recentPredictions: any[];
  };
}

const ModelMetrics: React.FC<ModelMetricsProps> = ({ metrics, modelStatus }) => {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  return (
    <div className="space-y-6">
      {/* Estado del Modelo */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Estado del Modelo ML</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${modelStatus.trained ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-sm">{modelStatus.trained ? 'Entrenado' : 'No Entrenado'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${modelStatus.training ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="text-sm">{modelStatus.training ? 'Entrenando...' : 'Inactivo'}</span>
          </div>
        </div>

        {modelStatus.trainingHistory.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-sm text-gray-400">Versiones del Modelo: {modelStatus.trainingHistory.length}</div>
            <div className="text-sm text-gray-400">Predicciones Recientes: {modelStatus.recentPredictions.length}</div>
          </div>
        )}
      </div>

      {/* Métricas de Rendimiento */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Métricas de Precisión</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Precisión General</div>
            <div className="text-2xl font-bold text-blue-400">
              {formatPercentage(metrics.accuracy)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">F1-Score</div>
            <div className="text-2xl font-bold text-purple-400">
              {formatPercentage(metrics.f1Score)}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-400">Precisión BUY</span>
            <span className="font-semibold">{formatPercentage(metrics.precision.buy)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-400">Precisión SELL</span>
            <span className="font-semibold">{formatPercentage(metrics.precision.sell)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-400">Precisión HOLD</span>
            <span className="font-semibold">{formatPercentage(metrics.precision.hold)}</span>
          </div>
        </div>
      </div>

      {/* Métricas Financieras */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Rendimiento Financiero</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">ROI Total</div>
            <div className={`text-2xl font-bold ${metrics.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {metrics.roi >= 0 ? '+' : ''}{formatPercentage(metrics.roi)}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Tasa de Éxito</div>
            <div className="text-2xl font-bold text-green-400">
              {formatPercentage(metrics.winRate)}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Trades Totales</span>
            <span className="font-semibold">{metrics.totalTrades}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-400">Trades Rentables</span>
            <span className="font-semibold text-green-400">{metrics.profitableTrades}</span>
          </div>
        </div>
      </div>

      {/* Métricas de Recall */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Sensibilidad (Recall)</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-green-400">Recall BUY</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-400 h-2 rounded-full" 
                  style={{ width: `${metrics.recall.buy * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold text-sm">{formatPercentage(metrics.recall.buy)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-red-400">Recall SELL</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-red-400 h-2 rounded-full" 
                  style={{ width: `${metrics.recall.sell * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold text-sm">{formatPercentage(metrics.recall.sell)}</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-blue-400">Recall HOLD</span>
            <div className="flex items-center space-x-2">
              <div className="w-20 bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full" 
                  style={{ width: `${metrics.recall.hold * 100}%` }}
                ></div>
              </div>
              <span className="font-semibold text-sm">{formatPercentage(metrics.recall.hold)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Predicciones Recientes */}
      {modelStatus.recentPredictions.length > 0 && (
        <div className="trading-card p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 trading-gold" />
            <h3 className="text-lg font-bold">Predicciones Recientes</h3>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {modelStatus.recentPredictions.slice(-5).map((pred, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${
                    pred.prediction.action === 'BUY' ? 'bg-green-400' : 
                    pred.prediction.action === 'SELL' ? 'bg-red-400' : 'bg-blue-400'
                  }`}></div>
                  <span className="text-sm font-semibold">{pred.prediction.action}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{pred.prediction.confidence.toFixed(1)}%</div>
                  <div className="text-xs text-gray-400">
                    {new Date(pred.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelMetrics;
