import { useState, useEffect, useCallback } from 'react';
import { useMLTrading } from './useMLTrading';
import { useMLPredictions } from './useMLPredictions';

interface PriceData {
  time: string;
  price: number;
  sma20: number;
  sma50: number;
  volume: number;
}

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

interface TechnicalIndicators {
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

interface BinanceKline {
  0: number;  // openTime
  1: string;  // open
  2: string;  // high
  3: string;  // low
  4: string;  // close
  5: string;  // volume
  6: number;  // closeTime
  7: string;  // quoteAssetVolume
  8: number;  // numberOfTrades
  9: string;  // takerBuyBaseAssetVolume
  10: string; // takerBuyQuoteAssetVolume
  11: string; // ignore
}

export const useBinanceData = (symbol: string) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 50,
    macd: {
      macd: 0,
      signal: 0,
      histogram: 0
    },
    bollinger: {
      upper: 0,
      middle: 0,
      lower: 0,
      current: 0
    },
    volume: 0,
    avgVolume: 0
  });

  const mlTrading = useMLTrading(symbol);
  const mlPredictions = useMLPredictions(symbol);

  const calculateSMA = (prices: number[], period: number): number => {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  };

  const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = prices.length - period; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  const fetchKlineData = useCallback(async () => {
    try {
      console.log(`🔄 Fetching data from Binance for ${symbol}...`);
      
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=50`;
      console.log(`📡 API URL: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`❌ HTTP Error: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data: BinanceKline[] = await response.json();
      console.log(`✅ Received ${data.length} data points from Binance`);
      
      if (!data || data.length === 0) {
        console.error('❌ No data received from Binance API');
        return;
      }
      
      const processedData: PriceData[] = data.map((kline, index) => {
        const price = parseFloat(kline[4]);
        const volume = parseFloat(kline[5]);
        const time = new Date(kline[6]).toLocaleTimeString();
        
        const prices = data.slice(0, index + 1).map(k => parseFloat(k[4]));
        const sma20 = calculateSMA(prices, 20);
        const sma50 = calculateSMA(prices, 50);
        
        return {
          time,
          price,
          sma20,
          sma50,
          volume
        };
      });

      console.log(`📈 Processed ${processedData.length} data points`);
      setPriceData(processedData);
      
      if (processedData.length > 0) {
        const latestData = processedData[processedData.length - 1];
        setCurrentPrice(latestData.price);
        
        const prices = processedData.map(d => d.price);
        const volumes = processedData.map(d => d.volume);
        const rsi = calculateRSI(prices);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        
        const currentIndicators = {
          rsi,
          volume: latestData.volume,
          avgVolume,
          bollinger: {
            upper: latestData.sma20 * 1.02,
            middle: latestData.sma20,
            lower: latestData.sma20 * 0.98,
            current: latestData.price
          },
          macd: {
            macd: 0,
            signal: 0,
            histogram: 0
          }
        };
        
        setIndicators(currentIndicators);

        // Generar predicción ML mejorada
        const marketData = {
          price: latestData.price,
          rsi,
          sma20: latestData.sma20,
          sma50: latestData.sma50,
          volume: latestData.volume,
          macd: currentIndicators.macd
        };

        // Obtener predicción ML
        const mlPrediction = await mlPredictions.makePrediction(marketData);
        
        // También actualizar el sistema ML anterior para compatibilidad
        await mlTrading.makePrediction(marketData);

        // Generar señal combinada (técnica + ML)
        generateEnhancedTradingSignal(latestData, rsi, processedData, mlPrediction);
      }
      
    } catch (error) {
      console.error('❌ Error fetching Binance data:', error);
    }
  }, [symbol, mlTrading, mlPredictions]);

  const generateEnhancedTradingSignal = (
    latestData: PriceData, 
    rsi: number, 
    historicalData: PriceData[],
    mlPrediction: any
  ) => {
    let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reason = 'Análisis en curso...';

    // Análisis técnico tradicional
    let technicalSignal: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let technicalConfidence = 50;

    if (rsi < 30 && latestData.price > latestData.sma20) {
      technicalSignal = 'BUY';
      technicalConfidence = Math.min(90, 60 + (30 - rsi));
    } else if (rsi > 70 && latestData.price < latestData.sma20) {
      technicalSignal = 'SELL';
      technicalConfidence = Math.min(90, 60 + (rsi - 70));
    }

    // Combinar con predicción ML si está disponible
    if (mlPrediction && mlPredictions.isModelReady) {
      const mlAction = mlPrediction.action;
      const mlConfidence = mlPrediction.confidence;
      const signalStrength = mlPredictions.getSignalStrength(mlPrediction);
      
      // Estrategia híbrida: combinar señales técnicas y ML
      if (technicalSignal === mlAction && technicalSignal !== 'HOLD') {
        // Ambas señales coinciden - alta confianza
        signalType = technicalSignal;
        confidence = Math.min(95, (technicalConfidence * 0.4) + (mlConfidence * 0.6));
        reason = `🤖 ML y análisis técnico coinciden: ${signalType}. ML: ${mlConfidence.toFixed(1)}%, Técnico: ${technicalConfidence}%, Fuerza: ${signalStrength}`;
      } else if (signalStrength === 'STRONG' && mlConfidence > 80) {
        // ML muy confiable, seguir su recomendación
        signalType = mlAction;
        confidence = Math.min(90, mlConfidence * 0.9);
        reason = `🎯 Predicción ML fuerte: ${mlAction} (${mlConfidence.toFixed(1)}% confianza, ${signalStrength})`;
      } else if (technicalSignal !== 'HOLD' && (mlAction === 'HOLD' || mlConfidence < 60)) {
        // ML incierto, usar análisis técnico
        signalType = technicalSignal;
        confidence = Math.max(55, technicalConfidence * 0.8);
        reason = `📊 Análisis técnico (ML incierto): ${technicalSignal}. RSI: ${rsi.toFixed(1)}, Precio vs SMA20: ${((latestData.price / latestData.sma20 - 1) * 100).toFixed(2)}%`;
      } else if (mlAction !== 'HOLD' && technicalSignal === 'HOLD') {
        // Solo ML tiene señal
        signalType = mlAction;
        confidence = Math.max(55, mlConfidence * 0.7);
        reason = `🤖 Solo predicción ML: ${mlAction} (${mlConfidence.toFixed(1)}% confianza, técnico neutral)`;
      } else {
        // Señales conflictivas o ambas neutras
        signalType = 'HOLD';
        confidence = 50;
        reason = `⚖️ Señales mixtas: ML dice ${mlAction} (${mlConfidence.toFixed(1)}%), Técnico dice ${technicalSignal}. Mantener posición.`;
      }
    } else {
      // Solo análisis técnico (ML no disponible)
      signalType = technicalSignal;
      confidence = technicalConfidence;
      if (technicalSignal === 'BUY') {
        reason = 'RSI en sobreventa + precio por encima de SMA20. Posible rebote alcista.';
      } else if (technicalSignal === 'SELL') {
        reason = 'RSI en sobrecompra + precio por debajo de SMA20. Posible corrección bajista.';
      } else {
        reason = 'Condiciones de mercado neutras. Esperando señal clara.';
      }
    }

    const newSignal: Signal = {
      id: Date.now().toString(),
      type: signalType,
      symbol: symbol.replace('USDT', '/USDT'),
      price: latestData.price,
      confidence,
      timestamp: new Date().toLocaleTimeString(),
      reason
    };

    console.log(`🎯 Enhanced signal generated: ${signalType} for ${symbol} at $${latestData.price} (${confidence}% confidence)`);

    setCurrentSignal(newSignal);
    
    if (signalType !== 'HOLD') {
      setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    console.log(`🚀 Initializing data fetch for ${symbol}`);
    fetchKlineData();
  }, [fetchKlineData]);

  // Update data every 10 seconds
  useEffect(() => {
    console.log(`⏰ Setting up 10-second interval for ${symbol}`);
    const interval = setInterval(() => {
      console.log(`🔄 Interval update for ${symbol}`);
      fetchKlineData();
    }, 10000);

    return () => {
      console.log(`⏹️ Cleaning up interval for ${symbol}`);
      clearInterval(interval);
    };
  }, [fetchKlineData]);

  return {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators,
    // Exponer datos ML mejorados
    mlTrading,
    mlPredictions
  };
};
