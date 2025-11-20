import { json } from '@sveltejs/kit';
import { TRACKED_ASSETS } from '$lib/config/assets';
import { getCachedData } from '$lib/server/priceCache';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    const assetId = url.searchParams.get('id');
    const asset = TRACKED_ASSETS.find((a) => a.id === assetId);

    if (!asset) {
        return json({ error: 'Asset not found' }, { status: 404 });
    }

    // Get data from the background cache
    const cachedData = getCachedData(asset.id);

    if (cachedData) {
        return json(cachedData);
    }

    // If no data in cache (e.g. server just started), return 503 Service Unavailable
    // The frontend will retry automatically
    return json({ error: 'Data initializing, please try again shortly' }, { status: 503 });
};
