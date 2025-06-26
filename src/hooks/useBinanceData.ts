import { useState, useEffect, useCallback } from 'react';
import { useMLTrading } from './useMLTrading';

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

        // Generar predicción ML
        await mlTrading.makePrediction({
          price: latestData.price,
          rsi,
          sma20: latestData.sma20,
          sma50: latestData.sma50,
          volume: latestData.volume,
          macd: currentIndicators.macd
        });

        // Generar señal tradicional
        generateTradingSignal(latestData, rsi, processedData);
      }
      
    } catch (error) {
      console.error('❌ Error fetching Binance data:', error);
    }
  }, [symbol, mlTrading]);

  const generateTradingSignal = (
    latestData: PriceData, 
    rsi: number, 
    historicalData: PriceData[]
  ) => {
    let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reason = 'Análisis en curso...';

    // Combinar señal tradicional con ML si está disponible
    if (mlTrading.mlPrediction) {
      const mlAction = mlTrading.mlPrediction.action;
      const mlConfidence = mlTrading.mlPrediction.confidence;
      
      // Ponderar señal ML con análisis técnico tradicional
      if (mlAction === 'BUY' && rsi < 50 && latestData.price > latestData.sma20) {
        signalType = 'BUY';
        confidence = Math.min(95, mlConfidence * 0.7 + 25);
        reason = `ML recomienda COMPRA (${mlConfidence.toFixed(1)}% confianza) + RSI favorable y precio sobre SMA20.`;
      } else if (mlAction === 'SELL' && rsi > 50 && latestData.price < latestData.sma20) {
        signalType = 'SELL';
        confidence = Math.min(95, mlConfidence * 0.7 + 25);
        reason = `ML recomienda VENTA (${mlConfidence.toFixed(1)}% confianza) + RSI desfavorable y precio bajo SMA20.`;
      } else {
        signalType = mlAction;
        confidence = Math.max(60, mlConfidence * 0.8);
        reason = `Predicción ML: ${mlAction} con ${mlConfidence.toFixed(1)}% de confianza.`;
      }
    } else {
      // Lógica tradicional cuando ML no está disponible
      if (rsi < 30 && latestData.price > latestData.sma20) {
        signalType = 'BUY';
        confidence = Math.min(90, 60 + (30 - rsi));
        reason = 'RSI en sobreventa + precio por encima de SMA20. Posible rebote alcista.';
      } else if (rsi > 70 && latestData.price < latestData.sma20) {
        signalType = 'SELL';
        confidence = Math.min(90, 60 + (rsi - 70));
        reason = 'RSI en sobrecompra + precio por debajo de SMA20. Posible corrección bajista.';
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

    console.log(`🎯 Generated signal: ${signalType} for ${symbol} at $${latestData.price} (${confidence}% confidence)`);

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
    // Exponer datos ML
    mlTrading
  };
};
