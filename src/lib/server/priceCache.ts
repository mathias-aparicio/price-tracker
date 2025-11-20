import { TRACKED_ASSETS } from '$lib/config/assets';

interface CacheEntry {
    data: any;
    timestamp: number;
}

const CACHE_TTL = 60 * 1000; // 60 seconds
const cache: Record<string, CacheEntry> = {};

// Use globalThis to persist the polling state across HMR in dev
const GLOBAL_POLLING_KEY = Symbol.for('PRICE_TRACKER_POLLING');

async function fetchAssetData(asset: any) {
    if (asset.apiProvider !== 'coingecko' || !asset.coingeckoId) return null;

    try {
        const headers = {
            'User-Agent': 'PriceTrackerDashboard/1.0',
            'Accept': 'application/json'
        };

        // Fetch current price and 24h change
        const priceRes = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${asset.coingeckoId}&vs_currencies=usd&include_24hr_change=true`,
            { headers }
        );

        if (!priceRes.ok) throw new Error(`Price API error: ${priceRes.status}`);
        const priceData = await priceRes.json();

        if (!priceData[asset.coingeckoId]) throw new Error('Price data missing');

        const currentPrice = priceData[asset.coingeckoId].usd;
        const change24h = priceData[asset.coingeckoId].usd_24h_change;

        // Wait 2 seconds before fetching history to avoid burst limit
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fetch history (1 day)
        const historyRes = await fetch(
            `https://api.coingecko.com/api/v3/coins/${asset.coingeckoId}/market_chart?vs_currency=usd&days=1`,
            { headers }
        );

        if (!historyRes.ok) throw new Error(`History API error: ${historyRes.status}`);
        const historyData = await historyRes.json();

        const history = historyData.prices.map((point: [number, number]) => ({
            timestamp: point[0],
            value: point[1],
        }));

        return {
            currentPrice,
            change24h,
            history,
        };
    } catch (error) {
        console.error(`Failed to fetch data for ${asset.id}:`, error);
        throw error; // Re-throw to handle 429 in the loop
    }
}

async function runPollingLoop() {
    console.log('Starting background price update...');
    let hitRateLimit = false;

    for (const asset of TRACKED_ASSETS) {
        try {
            const data = await fetchAssetData(asset);
            if (data) {
                cache[asset.id] = {
                    data,
                    timestamp: Date.now()
                };
                console.log(`Updated cache for ${asset.id}`);
            }
        } catch (error: any) {
            if (error.message && error.message.includes('429')) {
                console.warn(`Rate limit hit for ${asset.id}. Backing off...`);
                hitRateLimit = true;
                break; // Stop fetching other assets to let the API cool down
            }
            console.error(`Failed to update ${asset.id}:`, error);
        }

        // Wait 4 seconds between assets to be very gentle
        if (!hitRateLimit) {
            await new Promise(resolve => setTimeout(resolve, 4000));
        }
    }

    // Schedule next run
    // If we hit a rate limit, wait 2 minutes. Otherwise, wait 1 minute.
    const nextDelay = hitRateLimit ? 120 * 1000 : 60 * 1000;
    console.log(`Update complete. Next update in ${nextDelay / 1000}s.`);

    setTimeout(runPollingLoop, nextDelay);
}

export function startPolling() {
    if ((globalThis as any)[GLOBAL_POLLING_KEY]) {
        console.log('Polling already active.');
        return;
    }

    console.log('Initializing background polling (delayed start)...');
    (globalThis as any)[GLOBAL_POLLING_KEY] = true;

    // Delay initial start by 5 seconds to avoid "eager fetch" warning during server startup
    setTimeout(runPollingLoop, 5000);
}

export function getCachedData(assetId: string) {
    const entry = cache[assetId];
    if (!entry) return null;
    return entry.data;
}
