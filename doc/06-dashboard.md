# 06 - Dashboard Page

**File**: `src/routes/+page.svelte`

## Responsibility
This is the main entry point of the application. It orchestrates the data fetching, state management, and layout of the dashboard.

## State Management (TanStack Query)
We use `createQuery` from TanStack Query to manage async data.

```typescript
const btcQuery = createQuery(() => ({
    queryKey: ["asset", "bitcoin"],
    queryFn: () => fetchAssetData(TRACKED_ASSETS[0]),
    refetchInterval: 60000, // Auto-refresh every minute
}));
```

### Why TanStack Query?
-   **Auto Refetching**: Keeps data fresh without manual reloading.
-   **Loading/Error States**: Provides easy flags (`isLoading`, `isError`) to show UI feedback.
-   **Caching**: Prevents redundant network requests.

## Layout Structure
1.  **Header**: Title and subtitle.
2.  **Asset Grid**: Iterates through `TRACKED_ASSETS` and renders an `AssetCard` for each.
3.  **Main Chart**: Displays the `PriceChart` for the currently selected asset.

## Interactivity
-   Clicking an `AssetCard` updates the `selectedAssetId` variable.
-   This triggers a reactive update to `selectedQuery` and `chartColor`.
-   The `PriceChart` re-renders with the new data and color.
