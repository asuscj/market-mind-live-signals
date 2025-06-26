
import { useState, useEffect } from 'react';

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

interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export const useTradingData = () => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [currentPrice, setCurrentPrice] = useState(67234);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators>({
    rsi: 45.7,
    macd: {
      macd: 0.0023,
      signal: 0.0018,
      histogram: 0.0005
    },
    bollinger: {
      upper: 68500,
      middle: 67234,
      lower: 65968,
      current: 67234
    },
    volume: 2845000,
    avgVolume: 2100000
  });
  const [positions, setPositions] = useState<Position[]>([
    {
      symbol: 'BTC/USD',
      quantity: 0.5,
      avgPrice: 65800,
      currentPrice: 67234,
      pnl: 717,
      pnlPercent: 2.18
    },
    {
      symbol: 'ETH/USD',
      quantity: 2.8,
      avgPrice: 3450,
      currentPrice: 3521,
      pnl: 198.8,
      pnlPercent: 2.06
    }
  ]);

  // Simular datos de precio en tiempo real
  useEffect(() => {
    const generateInitialData = () => {
      const data: PriceData[] = [];
      let basePrice = 67000;
      
      for (let i = 0; i < 50; i++) {
        const price = basePrice + (Math.random() - 0.5) * 1000;
        const sma20 = price * (0.98 + Math.random() * 0.04);
        const sma50 = price * (0.96 + Math.random() * 0.08);
        
        data.push({
          time: new Date(Date.now() - (49 - i) * 60000).toLocaleTimeString(),
          price,
          sma20,
          sma50,
          volume: 1500000 + Math.random() * 2000000
        });
        basePrice = price;
      }
      return data;
    };

    setPriceData(generateInitialData());

    // Generar señales iniciales
    const initialSignals: Signal[] = [
      {
        id: '1',
        type: 'BUY',
        symbol: 'BTC/USD',
        price: 66500,
        confidence: 85,
        timestamp: '14:32:15',
        reason: 'RSI en zona de sobrecompra + MACD cruzando al alza',
        profit: 1.1
      },
      {
        id: '2',
        type: 'SELL',
        symbol: 'ETH/USD',
        price: 3480,
        confidence: 78,
        timestamp: '14:15:42',
        reason: 'Ruptura de resistencia + volumen alto',
        profit: -0.8
      }
    ];
    setSignals(initialSignals);

    // Establecer señal actual
    setCurrentSignal({
      id: 'current',
      type: 'BUY',
      symbol: 'BTC/USD',
      price: 67234,
      confidence: 92,
      timestamp: new Date().toLocaleTimeString(),
      reason: 'Análisis de IA: Confluencia de múltiples indicadores técnicos sugiere movimiento alcista. RSI saliendo de sobreventa, MACD cruzando línea de señal, y ruptura de resistencia en 67200.'
    });
  }, []);

  // Actualizar datos en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      // Actualizar precio
      const newPrice = currentPrice + (Math.random() - 0.5) * 200;
      setCurrentPrice(newPrice);

      // Actualizar datos del gráfico
      setPriceData(prev => {
        const newData = [...prev.slice(1)];
        newData.push({
          time: new Date().toLocaleTimeString(),
          price: newPrice,
          sma20: newPrice * (0.98 + Math.random() * 0.04),
          sma50: newPrice * (0.96 + Math.random() * 0.08),
          volume: 1500000 + Math.random() * 2000000
        });
        return newData;
      });

      // Actualizar indicadores
      setIndicators(prev => ({
        ...prev,
        rsi: Math.max(0, Math.min(100, prev.rsi + (Math.random() - 0.5) * 5)),
        bollinger: {
          ...prev.bollinger,
          current: newPrice,
          upper: newPrice + 1000 + Math.random() * 500,
          lower: newPrice - 1000 - Math.random() * 500
        },
        volume: 1500000 + Math.random() * 2000000
      }));

      // Generar nueva señal ocasionalmente
      if (Math.random() < 0.1) {
        const signalTypes: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
        const newSignal: Signal = {
          id: Date.now().toString(),
          type: signalTypes[Math.floor(Math.random() * signalTypes.length)],
          symbol: 'BTC/USD',
          price: newPrice,
          confidence: Math.floor(70 + Math.random() * 30),
          timestamp: new Date().toLocaleTimeString(),
          reason: 'Análisis automático de IA detecta nueva oportunidad de trading'
        };
        
        setSignals(prev => [newSignal, ...prev.slice(0, 9)]);
        setCurrentSignal(newSignal);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPrice]);

  return {
    priceData,
    currentPrice,
    signals,
    currentSignal,
    indicators,
    positions,
    portfolio: {
      balance: 50000,
      totalValue: 53247,
      dayPnL: 1247
    }
  };
};
