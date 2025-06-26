
import { useState, useEffect, useCallback } from 'react';
import { MLModelService } from '@/services/mlModelService';

interface MLPrediction {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  probability: { buy: number; sell: number; hold: number };
  timestamp: number;
  features: number[];
}

interface MLPredictionsData {
  currentPrediction: MLPrediction | null;
  predictionHistory: MLPrediction[];
  isModelReady: boolean;
  lastUpdate: number;
}

export const useMLPredictions = (symbol: string) => {
  const [mlData, setMLData] = useState<MLPredictionsData>({
    currentPrediction: null,
    predictionHistory: [],
    isModelReady: false,
    lastUpdate: 0
  });

  const mlService = MLModelService.getInstance();

  const makePrediction = useCallback(async (marketData: any): Promise<MLPrediction | null> => {
    try {
      console.log('🤖 Making ML prediction for', symbol);
      
      const features = [
        marketData.rsi || 50,
        marketData.sma20 || marketData.price,
        marketData.sma50 || marketData.price,
        marketData.macd?.macd || 0,
        marketData.macd?.signal || 0,
        marketData.macd?.histogram || 0,
        marketData.volume || 0,
        (marketData.price - marketData.sma20) / marketData.sma20 || 0,
        (marketData.sma20 - marketData.sma50) / marketData.sma50 || 0,
        0 // profitability placeholder
      ];

      const prediction = await mlService.predict(features);
      
      const mlPrediction: MLPrediction = {
        ...prediction,
        timestamp: Date.now(),
        features
      };

      // Actualizar estado
      setMLData(prev => ({
        ...prev,
        currentPrediction: mlPrediction,
        predictionHistory: [mlPrediction, ...prev.predictionHistory.slice(0, 49)], // Mantener últimas 50
        lastUpdate: Date.now()
      }));

      console.log('🎯 ML Prediction generated:', mlPrediction);
      return mlPrediction;

    } catch (error) {
      console.error('❌ Error making ML prediction:', error);
      return null;
    }
  }, [symbol, mlService]);

  const checkModelStatus = useCallback(() => {
    const status = mlService.getModelStatus();
    setMLData(prev => ({
      ...prev,
      isModelReady: status.trained && !status.training
    }));
  }, [mlService]);

  // Verificar estado del modelo periódicamente
  useEffect(() => {
    const interval = setInterval(checkModelStatus, 5000);
    checkModelStatus(); // Verificar inmediatamente
    return () => clearInterval(interval);
  }, [checkModelStatus]);

  const getSignalStrength = useCallback((prediction: MLPrediction | null): 'WEAK' | 'MODERATE' | 'STRONG' => {
    if (!prediction) return 'WEAK';
    
    if (prediction.confidence >= 80) return 'STRONG';
    if (prediction.confidence >= 60) return 'MODERATE';
    return 'WEAK';
  }, []);

  const getRecentAccuracy = useCallback((): number => {
    // Calcular precisión basada en predicciones recientes
    // En una implementación real, compararías con resultados reales
    const recentPredictions = mlData.predictionHistory.slice(0, 10);
    if (recentPredictions.length === 0) return 0;
    
    // Simulación simple de precisión basada en confianza promedio
    const avgConfidence = recentPredictions.reduce((sum, p) => sum + p.confidence, 0) / recentPredictions.length;
    return Math.min(avgConfidence * 0.8, 95); // Max 95%
  }, [mlData.predictionHistory]);

  return {
    ...mlData,
    makePrediction,
    getSignalStrength,
    getRecentAccuracy,
    checkModelStatus
  };
};
