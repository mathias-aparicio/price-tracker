import { type AssetConfig } from '../config/assets';

export interface HistoryPoint {
    timestamp: number;
    value: number;
}

export interface AssetData {
    currentPrice: number;
    change24h: number;
    history: HistoryPoint[];
}

export async function fetchAssetData(asset: AssetConfig): Promise<AssetData> {
    console.log(`Fetching data for ${asset.id}...`);
    try {
        const response = await fetch(`/api/price?id=${asset.id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch data for ${asset.id}`);
        }

        const data = await response.json();
        console.log(`Fetched data for ${asset.id}:`, data);
        return data;
    } catch (error) {
        console.error(`Error in fetchAssetData for ${asset.id}:`, error);
        throw error;
    }
}
