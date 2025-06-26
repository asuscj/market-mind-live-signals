
import { useState, useEffect, useCallback } from 'react';

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
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
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
      console.log(`Obteniendo datos de Binance para ${symbol}`);
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1m&limit=100`
      );
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }
      
      const data: BinanceKline[] = await response.json();
      
      const processedData: PriceData[] = data.map((kline, index) => {
        const price = parseFloat(kline.close);
        const volume = parseFloat(kline.volume);
        const time = new Date(kline.closeTime).toLocaleTimeString();
        
        // Calcular SMAs usando los precios anteriores
        const prices = data.slice(0, index + 1).map(k => parseFloat(k.close));
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

      setPriceData(processedData);
      
      if (processedData.length > 0) {
        const latestData = processedData[processedData.length - 1];
        setCurrentPrice(latestData.price);
        
        // Calcular indicadores técnicos
        const prices = processedData.map(d => d.price);
        const volumes = processedData.map(d => d.volume);
        const rsi = calculateRSI(prices);
        const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
        
        setIndicators(prev => ({
          ...prev,
          rsi,
          volume: latestData.volume,
          avgVolume,
          bollinger: {
            upper: latestData.sma20 * 1.02,
            middle: latestData.sma20,
            lower: latestData.sma20 * 0.98,
            current: latestData.price
          }
        }));

        // Generar señal basada en análisis técnico simple
        generateTradingSignal(latestData, rsi, processedData);
      }
      
    } catch (error) {
      console.error('Error obteniendo datos de Binance:', error);
    }
  }, [symbol]);

  const generateTradingSignal = (
    latestData: PriceData, 
    rsi: number, 
    historicalData: PriceData[]
  ) => {
    let signalType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 50;
    let reason = 'Análisis en curso...';

    // Lógica de señales basada en RSI y SMAs
    if (rsi < 30 && latestData.price > latestData.sma20) {
      signalType = 'BUY';
      confidence = Math.min(90, 60 + (30 - rsi));
      reason = 'RSI en sobreventa + precio por encima de SMA20. Posible rebote alcista.';
    } else if (rsi > 70 && latestData.price < latestData.sma20) {
      signalType = 'SELL';
      confidence = Math.min(90, 60 + (rsi - 70));
      reason = 'RSI en sobrecompra + precio por debajo de SMA20. Posible corrección bajista.';
    } else if (latestData.sma20 > latestData.sma50 && latestData.price > latestData.sma20) {
      signalType = 'BUY';
      confidence = 70;
      reason = 'Tendencia alcista confirmada. SMA20 > SMA50 y precio sobre ambas medias.';
    } else if (latestData.sma20 < latestData.sma50 && latestData.price < latestData.sma20) {
      signalType = 'SELL';
      confidence = 70;
      reason = 'Tendencia bajista confirmada. SMA20 < SMA50 y precio bajo ambas medias.';
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

    setCurrentSignal(newSignal);
    
    // Agregar a historial si no es HOLD
    if (signalType !== 'HOLD') {
      setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
    }
  };

  // Obtener datos iniciales
  useEffect(() => {
    fetchKlineData();
  }, [fetchKlineData]);

  // Actualizar datos cada 10 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      fetchKlineData();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchKlineData]);

  return {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators
  };
};
