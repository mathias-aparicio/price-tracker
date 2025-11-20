export interface AssetConfig {
  id: string;
  symbol: string;
  name: string;
  type: 'crypto' | 'commodity' | 'index';
  apiProvider: 'coingecko' | 'mock'; // Extendable for other providers
  coingeckoId?: string; // Specific ID for CoinGecko
}

export const TRACKED_ASSETS: AssetConfig[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    type: 'crypto',
    apiProvider: 'coingecko',
    coingeckoId: 'bitcoin',
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    type: 'crypto',
    apiProvider: 'coingecko',
    coingeckoId: 'ethereum',
  },
  {
    id: 'gold',
    symbol: 'XAU',
    name: 'Gold',
    type: 'commodity',
    apiProvider: 'coingecko',
    coingeckoId: 'tether-gold',
  },
];
