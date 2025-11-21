# 02 - Server Cache Module

**File**: `src/lib/server/priceCache.ts`

## Responsibility
This module is the heart of the backend data fetching. Its primary responsibility is to:
1.  **Fetch data** from the CoinGecko API.
2.  **Cache data** in memory to serve multiple users without hitting API limits.
3.  **Manage Rate Limits** by implementing a polite polling loop with backoff strategies.

## Key Concepts

### 1. The Polling Loop
The `runPollingLoop` function is an infinite loop that runs in the background. It iterates through the list of tracked assets and fetches data for each one.

```typescript
async function runPollingLoop() {
    for (const asset of TRACKED_ASSETS) {
        // Fetch and cache data...
        // Wait 4 seconds between assets to be gentle
    }
    // Schedule next run in 60 seconds
}
```

### 2. In-Memory Cache
We use a simple JavaScript object to store the latest data. This is efficient for this use case as the data size is small.

```typescript
const cache: Record<string, CacheEntry> = {};
```

### 3. Rate Limit Handling
The CoinGecko free API has strict rate limits. This module handles `429 Too Many Requests` errors by:
-   Detecting the error.
-   Setting a flag `hitRateLimit`.
-   Backing off for a longer period (2 minutes instead of 1) before the next cycle.

## Usage
This module is initialized in `hooks.server.ts` (or similar server entry point) by calling `startPolling()`. The cached data is retrieved by the API route using `getCachedData(assetId)`.
