
interface TrainingData {
  features: number[][];
  labels: number[];
}

interface ModelPrediction {
  action: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  probability: { buy: number; sell: number; hold: number };
}

interface ModelMetrics {
  accuracy: number;
  precision: { buy: number; sell: number; hold: number };
  recall: { buy: number; sell: number; hold: number };
  f1Score: number;
  roi: number;
  winRate: number;
  totalTrades: number;
  profitableTrades: number;
}

export class MLModelService {
  private static instance: MLModelService;
  private model: any = null;
  private isTraining: boolean = false;
  private trainingHistory: ModelMetrics[] = [];
  private recentPredictions: Array<{
    prediction: ModelPrediction;
    actual?: 'BUY' | 'SELL' | 'HOLD';
    timestamp: number;
    profit?: number;
  }> = [];

  static getInstance(): MLModelService {
    if (!MLModelService.instance) {
      MLModelService.instance = new MLModelService();
    }
    return MLModelService.instance;
  }

  async trainModel(labeledData: any[]): Promise<void> {
    console.log('🤖 Starting ML model training...');
    this.isTraining = true;

    try {
      const trainingData = this.prepareTrainingData(labeledData);
      console.log(`📊 Training with ${trainingData.features.length} samples`);

      // Simular entrenamiento de Random Forest
      await this.simulateModelTraining(trainingData);
      
      // Calcular métricas iniciales
      const metrics = await this.evaluateModel(trainingData);
      this.trainingHistory.push(metrics);
      
      console.log('✅ Model training completed!');
      console.log('📈 Initial metrics:', metrics);
    } catch (error) {
      console.error('❌ Error training model:', error);
    } finally {
      this.isTraining = false;
    }
  }

  private prepareTrainingData(labeledData: any[]): TrainingData {
    const features: number[][] = [];
    const labels: number[] = [];

    labeledData.forEach(point => {
      if (point.label) {
        const feature = [
          point.rsi || 50,
          point.sma20 || point.close,
          point.sma50 || point.close,
          point.macd || 0,
          point.signal || 0,
          point.histogram || 0,
          point.volume || 0,
          (point.close - point.sma20) / point.sma20 || 0, // Precio vs SMA20
          (point.sma20 - point.sma50) / point.sma50 || 0, // SMA20 vs SMA50
          point.profitability || 0
        ];

        features.push(feature);
        
        // Convertir etiquetas a números
        const labelMap = { 'BUY': 1, 'SELL': -1, 'HOLD': 0 };
        labels.push(labelMap[point.label] || 0);
      }
    });

    return { features, labels };
  }

  private async simulateModelTraining(trainingData: TrainingData): Promise<void> {
    // Simular proceso de entrenamiento (en una implementación real usarías TensorFlow.js o similar)
    return new Promise(resolve => {
      setTimeout(() => {
        this.model = {
          weights: trainingData.features[0]?.map(() => Math.random() * 2 - 1) || [],
          bias: Math.random() * 2 - 1,
          trained: true,
          trainingSize: trainingData.features.length
        };
        resolve();
      }, 2000);
    });
  }

  async predict(features: number[]): Promise<ModelPrediction> {
    if (!this.model || !this.model.trained) {
      console.warn('⚠️ Model not trained, using fallback prediction');
      return this.fallbackPrediction(features);
    }

    try {
      // Simular predicción del modelo
      const score = this.calculateModelScore(features);
      const probabilities = this.softmax([score + 0.1, score - 0.1, score]);
      
      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      let confidence = Math.max(...probabilities) * 100;

      // Determinar acción basada en probabilidades
      const maxIndex = probabilities.indexOf(Math.max(...probabilities));
      const actions: ('BUY' | 'SELL' | 'HOLD')[] = ['BUY', 'SELL', 'HOLD'];
      action = actions[maxIndex];

      const prediction = {
        action,
        confidence,
        probability: {
          buy: probabilities[0] * 100,
          sell: probabilities[1] * 100,
          hold: probabilities[2] * 100
        }
      };

      // Guardar predicción para evaluación posterior
      this.recentPredictions.push({
        prediction,
        timestamp: Date.now()
      });

      // Mantener solo las últimas 100 predicciones
      if (this.recentPredictions.length > 100) {
        this.recentPredictions.shift();
      }

      return prediction;
    } catch (error) {
      console.error('❌ Error making prediction:', error);
      return this.fallbackPrediction(features);
    }
  }

  private calculateModelScore(features: number[]): number {
    if (!this.model || !this.model.weights) return 0;
    
    let score = this.model.bias;
    for (let i = 0; i < Math.min(features.length, this.model.weights.length); i++) {
      score += features[i] * this.model.weights[i];
    }
    
    return Math.tanh(score); // Activación tanh
  }

  private softmax(scores: number[]): number[] {
    const maxScore = Math.max(...scores);
    const expScores = scores.map(score => Math.exp(score - maxScore));
    const sumExp = expScores.reduce((sum, exp) => sum + exp, 0);
    return expScores.map(exp => exp / sumExp);
  }

  private fallbackPrediction(features: number[]): ModelPrediction {
    // Predicción simple basada en RSI y tendencia
    const rsi = features[0] || 50;
    const priceTrend = features[7] || 0; // Precio vs SMA20
    
    let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let confidence = 60;

    if (rsi < 30 && priceTrend > 0) {
      action = 'BUY';
      confidence = 70;
    } else if (rsi > 70 && priceTrend < 0) {
      action = 'SELL';
      confidence = 70;
    }

    return {
      action,
      confidence,
      probability: {
        buy: action === 'BUY' ? confidence : (100 - confidence) / 2,
        sell: action === 'SELL' ? confidence : (100 - confidence) / 2,
        hold: action === 'HOLD' ? confidence : (100 - confidence) / 2
      }
    };
  }

  async incrementalLearning(newData: any): Promise<void> {
    if (!this.model || this.isTraining) return;

    console.log('🔄 Performing incremental learning...');
    
    try {
      // Simular aprendizaje incremental
      const features = this.extractFeatures(newData);
      const learningRate = 0.01;
      
      // Actualizar pesos del modelo (simulado)
      if (this.model.weights && newData.label) {
        const target = newData.label === 'BUY' ? 1 : newData.label === 'SELL' ? -1 : 0;
        const prediction = this.calculateModelScore(features);
        const error = target - prediction;
        
        for (let i = 0; i < this.model.weights.length; i++) {
          this.model.weights[i] += learningRate * error * features[i];
        }
        
        this.model.bias += learningRate * error;
        console.log('✅ Model updated with new data');
      }
    } catch (error) {
      console.error('❌ Error in incremental learning:', error);
    }
  }

  private extractFeatures(data: any): number[] {
    return [
      data.rsi || 50,
      data.sma20 || data.price,
      data.sma50 || data.price,
      data.macd || 0,
      data.signal || 0,
      data.histogram || 0,
      data.volume || 0,
      (data.price - data.sma20) / data.sma20 || 0,
      (data.sma20 - data.sma50) / data.sma50 || 0,
      data.profitability || 0
    ];
  }

  async evaluateModel(testData: TrainingData): Promise<ModelMetrics> {
    if (!this.model) {
      return this.getDefaultMetrics();
    }

    let correct = 0;
    let totalTrades = 0;
    let profitableTrades = 0;
    let totalROI = 0;

    const confusionMatrix = { buy: { tp: 0, fp: 0, fn: 0 }, sell: { tp: 0, fp: 0, fn: 0 }, hold: { tp: 0, fp: 0, fn: 0 } };

    for (let i = 0; i < testData.features.length; i++) {
      const prediction = await this.predict(testData.features[i]);
      const actual = testData.labels[i] === 1 ? 'BUY' : testData.labels[i] === -1 ? 'SELL' : 'HOLD';
      
      if (prediction.action === actual) {
        correct++;
      }

      // Simular ROI para trades
      if (prediction.action !== 'HOLD') {
        totalTrades++;
        const simulatedROI = Math.random() * 0.1 - 0.05; // -5% a +5%
        totalROI += simulatedROI;
        if (simulatedROI > 0) profitableTrades++;
      }

      // Actualizar matriz de confusión
      this.updateConfusionMatrix(confusionMatrix, prediction.action, actual);
    }

    const accuracy = correct / testData.features.length;
    const precision = this.calculatePrecision(confusionMatrix);
    const recall = this.calculateRecall(confusionMatrix);
    const f1Score = this.calculateF1Score(precision, recall);

    return {
      accuracy,
      precision,
      recall,
      f1Score,
      roi: totalROI,
      winRate: totalTrades > 0 ? profitableTrades / totalTrades : 0,
      totalTrades,
      profitableTrades
    };
  }

  private updateConfusionMatrix(matrix: any, predicted: string, actual: string) {
    const classes = ['buy', 'sell', 'hold'];
    const predIndex = predicted.toLowerCase();
    const actualIndex = actual.toLowerCase();

    if (classes.includes(predIndex) && classes.includes(actualIndex)) {
      if (predIndex === actualIndex) {
        matrix[predIndex].tp++;
      } else {
        matrix[predIndex].fp++;
        matrix[actualIndex].fn++;
      }
    }
  }

  private calculatePrecision(matrix: any) {
    return {
      buy: matrix.buy.tp / (matrix.buy.tp + matrix.buy.fp) || 0,
      sell: matrix.sell.tp / (matrix.sell.tp + matrix.sell.fp) || 0,
      hold: matrix.hold.tp / (matrix.hold.tp + matrix.hold.fp) || 0
    };
  }

  private calculateRecall(matrix: any) {
    return {
      buy: matrix.buy.tp / (matrix.buy.tp + matrix.buy.fn) || 0,
      sell: matrix.sell.tp / (matrix.sell.tp + matrix.sell.fn) || 0,
      hold: matrix.hold.tp / (matrix.hold.tp + matrix.hold.fn) || 0
    };
  }

  private calculateF1Score(precision: any, recall: any): number {
    const f1Buy = 2 * (precision.buy * recall.buy) / (precision.buy + recall.buy) || 0;
    const f1Sell = 2 * (precision.sell * recall.sell) / (precision.sell + recall.sell) || 0;
    const f1Hold = 2 * (precision.hold * recall.hold) / (precision.hold + recall.hold) || 0;
    
    return (f1Buy + f1Sell + f1Hold) / 3;
  }

  private getDefaultMetrics(): ModelMetrics {
    return {
      accuracy: 0,
      precision: { buy: 0, sell: 0, hold: 0 },
      recall: { buy: 0, sell: 0, hold: 0 },
      f1Score: 0,
      roi: 0,
      winRate: 0,
      totalTrades: 0,
      profitableTrades: 0
    };
  }

  getModelStatus() {
    return {
      trained: this.model?.trained || false,
      training: this.isTraining,
      trainingHistory: this.trainingHistory,
      recentPredictions: this.recentPredictions.slice(-10)
    };
  }
}
