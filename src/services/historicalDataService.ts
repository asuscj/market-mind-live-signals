
interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  rsi: number;
  sma20: number;
  sma50: number;
  macd: number;
  signal: number;
  histogram: number;
  label?: 'BUY' | 'SELL' | 'HOLD';
  profitability?: number;
}

interface LabeledData extends HistoricalData {
  label: 'BUY' | 'SELL' | 'HOLD';
  profitability: number;
}

export class HistoricalDataService {
  private static instance: HistoricalDataService;
  private cache: Map<string, HistoricalData[]> = new Map();

  static getInstance(): HistoricalDataService {
    if (!HistoricalDataService.instance) {
      HistoricalDataService.instance = new HistoricalDataService();
    }
    return HistoricalDataService.instance;
  }

  async fetchHistoricalData(symbol: string, days: number = 30): Promise<HistoricalData[]> {
    const cacheKey = `${symbol}_${days}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`📁 Using cached data for ${symbol}`);
      return this.cache.get(cacheKey)!;
    }

    try {
      console.log(`📡 Fetching ${days} days of historical data for ${symbol}...`);
      
      // Usar Binance API para datos históricos más extensos
      const endTime = Date.now();
      const startTime = endTime - (days * 24 * 60 * 60 * 1000);
      
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&startTime=${startTime}&endTime=${endTime}&limit=1000`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const rawData = await response.json();
      console.log(`✅ Fetched ${rawData.length} historical data points`);

      const historicalData = this.processHistoricalData(rawData);
      this.cache.set(cacheKey, historicalData);
      
      return historicalData;
    } catch (error) {
      console.error('❌ Error fetching historical data:', error);
      return [];
    }
  }

  private processHistoricalData(rawData: any[]): HistoricalData[] {
    return rawData.map((kline, index) => {
      const close = parseFloat(kline[4]);
      const high = parseFloat(kline[2]);
      const low = parseFloat(kline[3]);
      const volume = parseFloat(kline[5]);
      
      // Calcular indicadores técnicos
      const prices = rawData.slice(0, index + 1).map(k => parseFloat(k[4]));
      const rsi = this.calculateRSI(prices);
      const sma20 = this.calculateSMA(prices, 20);
      const sma50 = this.calculateSMA(prices, 50);
      const macd = this.calculateMACD(prices);

      return {
        timestamp: kline[0],
        open: parseFloat(kline[1]),
        high,
        low,
        close,
        volume,
        rsi,
        sma20,
        sma50,
        macd: macd.macd,
        signal: macd.signal,
        histogram: macd.histogram
      };
    });
  }

  labelHistoricalData(data: HistoricalData[], lookAheadHours: number = 4): LabeledData[] {
    return data.map((point, index) => {
      if (index >= data.length - lookAheadHours) {
        return { ...point, label: 'HOLD' as const, profitability: 0 };
      }

      const currentPrice = point.close;
      const futurePrice = data[index + lookAheadHours]?.close || currentPrice;
      const priceChange = (futurePrice - currentPrice) / currentPrice;
      
      let label: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let profitability = 0;

      // Etiquetado basado en cambio de precio futuro
      if (priceChange > 0.02) { // 2% ganancia
        label = 'BUY';
        profitability = priceChange;
      } else if (priceChange < -0.02) { // 2% pérdida
        label = 'SELL';
        profitability = Math.abs(priceChange);
      }

      return { ...point, label, profitability };
    });
  }

  private calculateRSI(prices: number[], period: number = 14): number {
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
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0;
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12);
    const ema26 = this.calculateEMA(prices, 26);
    const macd = ema12 - ema26;
    const signal = this.calculateEMA([macd], 9);
    const histogram = macd - signal;
    
    return { macd, signal, histogram };
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0;
    if (prices.length === 1) return prices[0];
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
    
    return ema;
  }
}
