
import { MLModelService } from './mlModelService';

interface BacktestConfig {
  historicalData: any[];
  initialCapital: number;
  strategy: 'ml' | 'technical' | 'hybrid';
  symbol: string;
}

interface Trade {
  date: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  pnl: number;
  reason: string;
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
  trades: Trade[];
}

interface Position {
  isOpen: boolean;
  entryPrice: number;
  entryDate: string;
  quantity: number;
  type: 'LONG' | 'SHORT';
}

export class BacktestingService {
  private static instance: BacktestingService;
  private mlService = MLModelService.getInstance();

  static getInstance(): BacktestingService {
    if (!BacktestingService.instance) {
      BacktestingService.instance = new BacktestingService();
    }
    return BacktestingService.instance;
  }

  async runBacktest(config: BacktestConfig): Promise<BacktestResults> {
    console.log(`🔄 Running backtest with ${config.strategy} strategy...`);

    const trades: Trade[] = [];
    let currentCapital = config.initialCapital;
    let position: Position = { isOpen: false, entryPrice: 0, entryDate: '', quantity: 0, type: 'LONG' };
    let maxCapital = config.initialCapital;
    let maxDrawdown = 0;

    // Procesar cada punto de datos históricos
    for (let i = 1; i < config.historicalData.length; i++) {
      const currentData = config.historicalData[i];
      const previousData = config.historicalData[i - 1];
      
      // Generar señal basada en la estrategia seleccionada
      const signal = await this.generateSignal(currentData, previousData, config.strategy);
      
      if (signal && signal !== 'HOLD') {
        // Procesar la señal de trading
        const trade = this.processSignal(signal, currentData, position, currentCapital);
        
        if (trade) {
          trades.push(trade);
          currentCapital += trade.pnl;
          
          // Actualizar posición
          if (signal === 'BUY' && !position.isOpen) {
            position = {
              isOpen: true,
              entryPrice: currentData.close,
              entryDate: new Date(currentData.timestamp).toISOString(),
              quantity: trade.quantity,
              type: 'LONG'
            };
          } else if (signal === 'SELL' && position.isOpen) {
            position = { isOpen: false, entryPrice: 0, entryDate: '', quantity: 0, type: 'LONG' };
          }
        }
      }

      // Calcular drawdown
      if (currentCapital > maxCapital) {
        maxCapital = currentCapital;
      }
      const currentDrawdown = (maxCapital - currentCapital) / maxCapital;
      if (currentDrawdown > maxDrawdown) {
        maxDrawdown = currentDrawdown;
      }
    }

    // Cerrar posición abierta al final del backtest
    if (position.isOpen) {
      const finalData = config.historicalData[config.historicalData.length - 1];
      const closeTrade = this.processSignal('SELL', finalData, position, currentCapital);
      if (closeTrade) {
        trades.push(closeTrade);
        currentCapital += closeTrade.pnl;
      }
    }

    return this.calculateMetrics(trades, config.initialCapital, currentCapital, maxDrawdown);
  }

  private async generateSignal(
    currentData: any, 
    previousData: any, 
    strategy: 'ml' | 'technical' | 'hybrid'
  ): Promise<'BUY' | 'SELL' | 'HOLD' | null> {
    
    switch (strategy) {
      case 'technical':
        return this.technicalSignal(currentData, previousData);
      
      case 'ml':
        return await this.mlSignal(currentData);
      
      case 'hybrid':
        const techSignal = this.technicalSignal(currentData, previousData);
        const mlSignal = await this.mlSignal(currentData);
        return this.combineSignals(techSignal, mlSignal);
      
      default:
        return null;
    }
  }

  private technicalSignal(currentData: any, previousData: any): 'BUY' | 'SELL' | 'HOLD' {
    const rsi = currentData.rsi || 50;
    const price = currentData.close;
    const sma20 = currentData.sma20;
    const sma50 = currentData.sma50;
    
    // Señal de compra: RSI oversold + precio cruza por encima de SMA20
    if (rsi < 30 && price > sma20 && previousData.close <= previousData.sma20) {
      return 'BUY';
    }
    
    // Señal de venta: RSI overbought + precio cruza por debajo de SMA20
    if (rsi > 70 && price < sma20 && previousData.close >= previousData.sma20) {
      return 'SELL';
    }
    
    // Golden Cross: SMA20 cruza por encima de SMA50
    if (sma20 > sma50 && previousData.sma20 <= previousData.sma50) {
      return 'BUY';
    }
    
    // Death Cross: SMA20 cruza por debajo de SMA50
    if (sma20 < sma50 && previousData.sma20 >= previousData.sma50) {
      return 'SELL';
    }
    
    return 'HOLD';
  }

  private async mlSignal(currentData: any): Promise<'BUY' | 'SELL' | 'HOLD'> {
    try {
      const features = [
        currentData.rsi || 50,
        currentData.sma20 || currentData.close,
        currentData.sma50 || currentData.close,
        currentData.macd || 0,
        currentData.signal || 0,
        currentData.histogram || 0,
        currentData.volume || 0,
        (currentData.close - currentData.sma20) / currentData.sma20 || 0,
        (currentData.sma20 - currentData.sma50) / currentData.sma50 || 0,
        0 // profitability placeholder
      ];

      const prediction = await this.mlService.predict(features);
      
      // Solo actuar si la confianza es alta (>70%)
      if (prediction.confidence > 70) {
        return prediction.action;
      }
      
      return 'HOLD';
    } catch (error) {
      console.error('Error getting ML signal:', error);
      return 'HOLD';
    }
  }

  private combineSignals(
    techSignal: 'BUY' | 'SELL' | 'HOLD', 
    mlSignal: 'BUY' | 'SELL' | 'HOLD'
  ): 'BUY' | 'SELL' | 'HOLD' {
    // Ambas señales deben coincidir para una acción
    if (techSignal === mlSignal && techSignal !== 'HOLD') {
      return techSignal;
    }
    
    // Si una es HOLD, usar la otra si es fuerte
    if (techSignal === 'HOLD') return mlSignal;
    if (mlSignal === 'HOLD') return techSignal;
    
    // Si hay conflicto, mantener
    return 'HOLD';
  }

  private processSignal(
    signal: 'BUY' | 'SELL',
    data: any,
    position: Position,
    currentCapital: number
  ): Trade | null {
    
    const price = data.close;
    const date = new Date(data.timestamp).toLocaleDateString();
    
    if (signal === 'BUY' && !position.isOpen) {
      // Abrir posición larga
      const quantity = Math.floor((currentCapital * 0.95) / price); // 95% del capital
      
      return {
        date,
        type: 'BUY',
        price,
        quantity,
        pnl: 0, // Se calculará al cerrar
        reason: 'Abrir posición larga'
      };
    }
    
    if (signal === 'SELL' && position.isOpen) {
      // Cerrar posición larga
      const pnl = (price - position.entryPrice) * position.quantity;
      
      return {
        date,
        type: 'SELL',
        price,
        quantity: position.quantity,
        pnl,
        reason: `Cerrar posición larga (entrada: $${position.entryPrice.toFixed(2)})`
      };
    }
    
    return null;
  }

  private calculateMetrics(
    trades: Trade[], 
    initialCapital: number, 
    finalCapital: number, 
    maxDrawdown: number
  ): BacktestResults {
    
    const totalReturn = (finalCapital - initialCapital) / initialCapital;
    const completedTrades = trades.filter(t => t.type === 'SELL');
    const winningTrades = completedTrades.filter(t => t.pnl > 0).length;
    const losingTrades = completedTrades.filter(t => t.pnl < 0).length;
    const winRate = completedTrades.length > 0 ? winningTrades / completedTrades.length : 0;
    
    const grossProfit = completedTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(completedTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 10 : 1;
    
    const avgTradeReturn = completedTrades.length > 0 
      ? completedTrades.reduce((sum, t) => sum + (t.pnl / initialCapital), 0) / completedTrades.length
      : 0;
    
    // Cálculo simplificado del Sharpe Ratio
    const returns = completedTrades.map(t => t.pnl / initialCapital);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) || 1;
    const sharpeRatio = avgReturn / stdDev;

    return {
      totalReturn,
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate,
      maxDrawdown,
      sharpeRatio,
      profitFactor,
      avgTradeReturn,
      trades
    };
  }
}
