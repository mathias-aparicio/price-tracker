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

import { invoke } from '@tauri-apps/api/core';

export async function fetchAssetData(asset: AssetConfig): Promise<AssetData> {
    console.log(`Fetching data for ${asset.id}...`);
    try {
        const data = await invoke<AssetData>('get_asset_data', { id: asset.id });

        if (!data) {
            throw new Error(`No data returned for ${asset.id}`);
        }

        console.log(`Fetched data for ${asset.id}:`, data);
        return data;
    } catch (error) {
        console.error(`Error in fetchAssetData for ${asset.id}:`, error);
        throw error;
    }
}
