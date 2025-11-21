# 03 - API Layer

**File**: `src/routes/api/price/+server.ts`

## Responsibility
This file defines a **Server-Side API Endpoint** that acts as a bridge between the frontend and the server-side cache. It prevents the frontend from needing to call CoinGecko directly, which would expose API keys (if used) and hit rate limits immediately.

## How it Works
The file exports a `GET` request handler. When the frontend makes a request to `/api/price?id=bitcoin`:

1.  **Extract Parameter**: It reads the `id` query parameter.
2.  **Validate Asset**: Checks if the requested asset exists in our configuration.
3.  **Retrieve from Cache**: Calls `getCachedData(asset.id)` from the `priceCache` module.
4.  **Response**:
    -   **200 OK**: If data is found, returns it as JSON.
    -   **503 Service Unavailable**: If the server just started and hasn't fetched data yet. The frontend handles this by retrying.
    -   **404 Not Found**: If the asset ID is invalid.

## Code Snippet
```typescript
export const GET: RequestHandler = async ({ url }) => {
    const assetId = url.searchParams.get('id');
    // ... validation ...
    const cachedData = getCachedData(asset.id);
    
    if (cachedData) {
        return json(cachedData);
    }
    
    return json({ error: 'Initializing...' }, { status: 503 });
};
```

## Why this is important
This layer decouples the client from the external data source. We could swap CoinGecko for another provider in the backend without changing a single line of frontend code.
