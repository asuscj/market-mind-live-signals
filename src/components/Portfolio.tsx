
import React from 'react';
import { Wallet, TrendingUp, DollarSign, PieChart } from 'lucide-react';

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

interface PortfolioProps {
  balance: number;
  totalValue: number;
  dayPnL: number;
  positions: Position[];
}

const Portfolio: React.FC<PortfolioProps> = ({ balance, totalValue, dayPnL, positions }) => {
  const totalPnL = totalValue - balance;
  const totalPnLPercent = ((totalValue - balance) / balance) * 100;

  return (
    <div className="space-y-6">
      {/* Resumen del Portfolio */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wallet className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Portfolio</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Balance Total</div>
            <div className="text-2xl font-bold trading-gold">
              ${totalValue.toLocaleString()}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">P&L Total</div>
            <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString()}
            </div>
            <div className={`text-sm ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ({totalPnLPercent >= 0 ? '+' : ''}{totalPnLPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">P&L del Día</span>
            <div className={`font-bold ${dayPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {dayPnL >= 0 ? '+' : ''}${dayPnL.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Posiciones Activas */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Posiciones Activas</h3>
        </div>

        <div className="space-y-3">
          {positions.map((position, index) => (
            <div key={index} className="p-3 bg-gray-800 rounded border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{position.symbol}</div>
                <div className={`font-bold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-400">Cantidad</div>
                  <div className="font-semibold">{position.quantity}</div>
                </div>
                <div>
                  <div className="text-gray-400">Precio Prom.</div>
                  <div className="font-semibold">${position.avgPrice.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-gray-400">Precio Actual</div>
                  <div className="font-semibold">${position.currentPrice.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="mt-2 text-right">
                <span className={`text-xs ${position.pnlPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ({position.pnlPercent >= 0 ? '+' : ''}{position.pnlPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de Performance */}
      <div className="trading-card p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="w-5 h-5 trading-gold" />
          <h3 className="text-lg font-bold">Métricas</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-bold text-green-400">68.5%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Sharpe Ratio</div>
            <div className="text-xl font-bold text-blue-400">1.42</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Max Drawdown</div>
            <div className="text-xl font-bold text-red-400">-12.3%</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Trades</div>
            <div className="text-xl font-bold">247</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
