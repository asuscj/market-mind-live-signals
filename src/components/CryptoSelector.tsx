
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bitcoin, Coins } from 'lucide-react';

interface CryptoSelectorProps {
  selectedCrypto: string;
  onCryptoChange: (crypto: string) => void;
}

const AVAILABLE_CRYPTOS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', displayName: 'BTC/USDT' },
  { symbol: 'ADAUSDT', name: 'Cardano', displayName: 'ADA/USDT' },
  { symbol: 'MATICUSDT', name: 'Polygon', displayName: 'MATIC/USDT' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', displayName: 'SHIB/USDT' },
  { symbol: 'PEPEUSDT', name: '1000PEPE', displayName: 'PEPE/USDT' }
];

const CryptoSelector: React.FC<CryptoSelectorProps> = ({ selectedCrypto, onCryptoChange }) => {
  return (
    <div className="trading-card p-4">
      <div className="flex items-center space-x-3 mb-3">
        <Coins className="w-5 h-5 trading-gold" />
        <h3 className="text-lg font-bold">Seleccionar Criptomoneda</h3>
      </div>
      
      <Select value={selectedCrypto} onValueChange={onCryptoChange}>
        <SelectTrigger className="w-full bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Selecciona una criptomoneda" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {AVAILABLE_CRYPTOS.map((crypto) => (
            <SelectItem 
              key={crypto.symbol} 
              value={crypto.symbol}
              className="text-white hover:bg-gray-700 focus:bg-gray-700"
            >
              <div className="flex items-center space-x-2">
                <Bitcoin className="w-4 h-4 trading-gold" />
                <span>{crypto.displayName}</span>
                <span className="text-gray-400 text-sm">({crypto.name})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CryptoSelector;
