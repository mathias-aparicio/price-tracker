# 05 - UI Components

**Directory**: `src/lib/components`

This section covers the reusable UI building blocks of the application.

## 1. AssetCard.svelte
**Responsibility**: Displays a summary of a single asset (Icon, Name, Price, 24h Change).

### Props
-   `asset`: Configuration object (name, symbol, etc.).
-   `data`: The real-time price data (optional, can be undefined while loading).
-   `selected`: Boolean to highlight the card if it's currently selected.
-   `onClick`: Callback function when the card is clicked.

### Features
-   **Visual Feedback**: Changes border color and shadow when selected.
-   **Loading State**: Shows a pulse animation if `data` is undefined.
-   **Trend Indication**: Shows green (TrendingUp) or red (TrendingDown) icon based on 24h change.

## 2. PriceChart.svelte
**Responsibility**: Renders an interactive area chart using **ApexCharts**.

### Props
-   `data`: Array of `HistoryPoint` (timestamp, value).
-   `color`: Hex color string for the chart line and gradient (e.g., green for profit, red for loss).

### Implementation Details
-   **Reactive Updates**: The chart automatically updates when the `data` or `color` props change.
-   **Gradient Fill**: Uses a gradient fade effect for a modern look.
-   **Dark Mode**: Styled specifically for the dark theme of the application.
