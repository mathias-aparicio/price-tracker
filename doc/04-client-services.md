# 04 - Client Services

**File**: `src/lib/services/priceService.ts`

## Responsibility
This module provides a clean, typed interface for the frontend to fetch data from our internal API. It abstracts away the `fetch` calls and JSON parsing.

## Key Interfaces
We define TypeScript interfaces here to ensure type safety throughout the UI components.

```typescript
export interface HistoryPoint {
    timestamp: number;
    value: number;
}

export interface AssetData {
    currentPrice: number;
    change24h: number;
    history: HistoryPoint[];
}
```

## The Fetch Function
`fetchAssetData` is the main function used by the frontend.

```typescript
export async function fetchAssetData(asset: AssetConfig): Promise<AssetData> {
    const response = await fetch(`/api/price?id=${asset.id}`);
    // ... error handling ...
    return await response.json();
}
```

## Usage
This function is passed to **TanStack Query** in the main page to handle the actual data fetching, caching, and refetching intervals.
