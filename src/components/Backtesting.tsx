
import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, DollarSign, Activity, BarChart3, Play, Pause } from 'lucide-react';
import { HistoricalDataService } from '@/services/historicalDataService';
import { BacktestingService } from '@/services/backtestingService';

interface BacktestingProps {
  symbol: string;
  mlPrediction?: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
  } | null;
}

interface BacktestResults {
  totalReturn: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgTradeReturn: number;
  trades: Array<{
    date: string;
    type: 'BUY' | 'SELL';
    price: number;
    quantity: number;
    pnl: number;
    reason: string;
  }>;
}

const Backtesting: React.FC<BacktestingProps> = ({ symbol, mlPrediction }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BacktestResults | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [initialCapital, setInitialCapital] = useState(10000);
  const [strategy, setStrategy] = useState<'ml' | 'technical' | 'hybrid'>('hybrid');

  const historicalService = HistoricalDataService.getInstance();
  const backtestingService = BacktestingService.getInstance();

  const runBacktest = async () => {
    setIsRunning(true);
    console.log(`🔄 Starting backtest for ${symbol} with ${strategy} strategy...`);

    try {
      // Obtener datos históricos
      const historicalData = await historicalService.fetchHistoricalData(symbol, selectedPeriod);
      
      if (historicalData.length === 0) {
        console.warn('⚠️ No historical data available for backtesting');
        return;
      }

      // Ejecutar backtesting
      const backtestResults = await backtestingService.runBacktest({
        historicalData,
        initialCapital,
        strategy,
        symbol
      });

      setResults(backtestResults);
      console.log('✅ Backtesting completed:', backtestResults);

    } catch (error) {
      console.error('❌ Error running backtest:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);

  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* Configuración del Backtest */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Configuración de Backtesting</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Período (días)</label>
            <select 
              value={selectedPeriod} 
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Capital Inicial</label>
            <input
              type="number"
              value={initialCapital}
              onChange={(e) => setInitialCapital(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
              min="1000"
              step="1000"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Estrategia</label>
            <select 
              value={strategy} 
              onChange={(e) => setStrategy(e.target.value as 'ml' | 'technical' | 'hybrid')}
              className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
            >
              <option value="technical">Solo Técnico</option>
              <option value="ml">Solo ML</option>
              <option value="hybrid">Híbrido (ML + Técnico)</option>
            </select>
          </div>
        </div>

        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-2 px-4 rounded flex items-center justify-center space-x-2"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 animate-spin" />
              <span>Ejecutando Backtest...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span>Ejecutar Backtest</span>
            </>
          )}
        </button>
      </div>

      {/* Resultados del Backtest */}
      {results && (
        <>
          {/* Métricas Principales */}
          <div className="trading-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 trading-gold" />
              <h3 className="text-lg font-bold">Resultados del Backtest</h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-gray-400">Retorno Total</div>
                <div className={`text-2xl font-bold ${results.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercentage(results.totalReturn)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400">Tasa de Éxito</div>
                <div className="text-2xl font-bold text-blue-400">
                  {formatPercentage(results.winRate)}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400">Total Trades</div>
                <div className="text-2xl font-bold text-white">
                  {results.totalTrades}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-400">Sharpe Ratio</div>
                <div className="text-2xl font-bold text-purple-400">
                  {results.sharpeRatio.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Métricas Detalladas */}
          <div className="trading-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Activity className="w-5 h-5 trading-gold" />
              <h3 className="text-lg font-bold">Métricas Detalladas</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trades Ganadores:</span>
                  <span className="text-green-400 font-semibold">{results.winningTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trades Perdedores:</span>
                  <span className="text-red-400 font-semibold">{results.losingTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Max Drawdown:</span>
                  <span className="text-red-400 font-semibold">{formatPercentage(results.maxDrawdown)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Factor de Beneficio:</span>
                  <span className="text-blue-400 font-semibold">{results.profitFactor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Retorno Promedio por Trade:</span>
                  <span className={`font-semibold ${results.avgTradeReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatPercentage(results.avgTradeReturn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Capital Final:</span>
                  <span className="text-yellow-400 font-semibold">
                    {formatCurrency(initialCapital * (1 + results.totalReturn))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Trades */}
          <div className="trading-card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <DollarSign className="w-5 h-5 trading-gold" />
              <h3 className="text-lg font-bold">Historial de Trades (Últimos 10)</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2">Fecha</th>
                    <th className="text-left py-2">Tipo</th>
                    <th className="text-left py-2">Precio</th>
                    <th className="text-left py-2">P&L</th>
                    <th className="text-left py-2">Razón</th>
                  </tr>
                </thead>
                <tbody>
                  {results.trades.slice(-10).reverse().map((trade, index) => (
                    <tr key={index} className="border-b border-gray-800">
                      <td className="py-2 text-gray-300">{trade.date}</td>
                      <td className="py-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          trade.type === 'BUY' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-2 text-gray-300">{formatCurrency(trade.price)}</td>
                      <td className={`py-2 font-semibold ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(trade.pnl)}
                      </td>
                      <td className="py-2 text-gray-400 text-xs max-w-32 truncate" title={trade.reason}>
                        {trade.reason}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Backtesting;
