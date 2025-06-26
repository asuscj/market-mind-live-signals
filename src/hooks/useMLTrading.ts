
import { useState, useEffect, useCallback } from 'react';
import { HistoricalDataService } from '@/services/historicalDataService';
import { MLModelService } from '@/services/mlModelService';

interface MLTradingData {
  modelMetrics: {
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
  isLoadingData: boolean;
  mlPrediction: {
    action: 'BUY' | 'SELL' | 'HOLD';
    confidence: number;
    probability: { buy: number; sell: number; hold: number };
  } | null;
}

export const useMLTrading = (symbol: string) => {
  const [mlData, setMLData] = useState<MLTradingData>({
    modelMetrics: {
      accuracy: 0,
      precision: { buy: 0, sell: 0, hold: 0 },
      recall: { buy: 0, sell: 0, hold: 0 },
      f1Score: 0,
      roi: 0,
      winRate: 0,
      totalTrades: 0,
      profitableTrades: 0
    },
    modelStatus: {
      trained: false,
      training: false,
      trainingHistory: [],
      recentPredictions: []
    },
    isLoadingData: false,
    mlPrediction: null
  });

  const historicalService = HistoricalDataService.getInstance();
  const mlService = MLModelService.getInstance();

  const initializeModel = useCallback(async () => {
    console.log('🚀 Initializing ML model for', symbol);
    setMLData(prev => ({ ...prev, isLoadingData: true }));

    try {
      // 1. Recopilar datos históricos
      console.log('📊 Fetching historical data...');
      const historicalData = await historicalService.fetchHistoricalData(symbol, 30);
      
      if (historicalData.length === 0) {
        console.warn('⚠️ No historical data available');
        return;
      }

      // 2. Etiquetar datos
      console.log('🏷️ Labeling historical data...');
      const labeledData = historicalService.labelHistoricalData(historicalData, 4);
      
      // 3. Entrenar modelo
      console.log('🤖 Training ML model...');
      await mlService.trainModel(labeledData);
      
      // 4. Actualizar estado
      updateMLStatus();
      
    } catch (error) {
      console.error('❌ Error initializing ML model:', error);
    } finally {
      setMLData(prev => ({ ...prev, isLoadingData: false }));
    }
  }, [symbol]);

  const updateMLStatus = useCallback(() => {
    const status = mlService.getModelStatus();
    setMLData(prev => ({
      ...prev,
      modelStatus: status
    }));
  }, []);

  const makePrediction = useCallback(async (currentData: any): Promise<void> => {
    try {
      const features = [
        currentData.rsi || 50,
        currentData.sma20 || currentData.price,
        currentData.sma50 || currentData.price,
        currentData.macd?.macd || 0,
        currentData.macd?.signal || 0,
        currentData.macd?.histogram || 0,
        currentData.volume || 0,
        (currentData.price - currentData.sma20) / currentData.sma20 || 0,
        (currentData.sma20 - currentData.sma50) / currentData.sma50 || 0,
        0 // profitability (unknown for current data)
      ];

      const prediction = await mlService.predict(features);
      
      setMLData(prev => ({
        ...prev,
        mlPrediction: prediction
      }));

      console.log('🎯 ML Prediction:', prediction);

      // Aprendizaje incremental con datos nuevos
      if (currentData.label) {
        await mlService.incrementalLearning({
          ...currentData,
          features
        });
        updateMLStatus();
      }

    } catch (error) {
      console.error('❌ Error making ML prediction:', error);
    }
  }, []);

  const retrainModel = useCallback(async () => {
    console.log('🔄 Retraining model with new data...');
    await initializeModel();
  }, [initializeModel]);

  // Inicializar modelo al cambiar símbolo
  useEffect(() => {
    initializeModel();
  }, [initializeModel]);

  // Actualizar métricas periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      updateMLStatus();
    }, 30000); // Cada 30 segundos

    return () => clearInterval(interval);
  }, [updateMLStatus]);

  return {
    ...mlData,
    makePrediction,
    retrainModel,
    initializeModel
  };
};
