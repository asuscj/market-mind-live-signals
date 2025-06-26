
import React from 'react';
import { TrendingUp, Bot, Zap } from 'lucide-react';

const TradingHeader = () => {
  return (
    <header className="trading-card p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-8 h-8 trading-gold" />
            <h1 className="text-2xl font-bold trading-gold">AI Trading Bot</h1>
          </div>
          <div className="flex items-center space-x-2 text-green-400">
            <Zap className="w-4 h-4" />
            <span className="text-sm">Sistema Activo</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">+24.7%</div>
            <div className="text-xs text-gray-400">Rendimiento Hoy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">127</div>
            <div className="text-xs text-gray-400">Señales Enviadas</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;
