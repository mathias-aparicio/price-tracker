As a market observer,
I want to view an interactive graph and a summary of recent price changes for Gold, Bitcoin, and Ethereum, ... on a single webpage,
So that I can quickly visualize their performance history and compare current market trends without navigating multiple sites.

**Project Goal:** Build a scalable, real-time Price Tracker Dashboard.
**The Context:** Be able to track Gold, Bitcoin, and Ethereum, requires the architecture to allow adding new indexes (stocks, commodities) in the future by simply updating a configuration file, without rewriting component logic.

**Tech Stack:**

- **Framework:** SvelteKit (TypeScript)
- **Styling:** Tailwind CSS (Dark mode, clean financial aesthetic)
- **State/Fetching:** TanStack Query (Svelte version) for polling and caching.
- **Charts:** ApexCharts (via `svelte-apexcharts`) OR a similar responsive charting library.
- **Icons:** Lucide-Svelte.

**Architecture Requirement (Crucial):**
Do not hardcode "Bitcoin" or "Gold" into the HTML. You must implement a "Config-Driven" architecture.

---

### Step-by-Step Implementation Plan

**Step 1: Define the Configuration & Types**

- Create a file `src/lib/config/assets.ts`.
- Define an interface `AssetConfig` that includes: `id` (unique slug), `symbol` (ticker), `name`, `type` (crypto/commodity/index), and `apiProvider` (to handle different data sources later).
- Export an array `TRACKED_ASSETS` containing the initial data: Bitcoin (BTC), Ethereum (ETH), and Gold (XAU).

**Step 2: Create the Data Service Layer**

- Create a service file `src/lib/services/priceService.ts`.
- Implement a function `fetchAssetData(asset)` that accepts an asset config object.
- **IMPORTANT:** Since we are in MVP mode, use a public free API (like CoinGecko for crypto)
- The return data must be normalized. Return an object containing:
  - `currentPrice` (number)
  - `change24h` (percentage)
  - `history` (array of `{ timestamp, value }` for the graph).

**Step 3: Implement State Management (TanStack Query)**

- In `src/routes/+page.svelte`, set up a TanStack Query `createQuery` for the asset list.
- Configure `refetchInterval` to 60,000ms (1 minute) so the dashboard auto-updates.

**Step 4: Build the "Asset Card" Component**

- Create `src/lib/components/AssetCard.svelte`.
- This component should take an `Asset` object as a prop.
- Display: Name, Symbol, Big Bold Current Price, and a colored badge for 24h Change (Green for positive, Red for negative).
- Make the card clickable/selectable.

**Step 5: Build the "History Chart" Component**

- Create `src/lib/components/PriceChart.svelte`.
- Use the charting library to render a line area chart.
- The chart must accept an array of history points as props.
- Ensure the chart handles the Y-axis dynamically (so Gold @ $2500 and BTC @ $90000 both look good).

**Step 6: Assemble the Dashboard (+page.svelte)**

- **Layout:** Create a responsive grid layout using Tailwind.
- **Top Section:** Loop through `TRACKED_ASSETS` and render an `AssetCard` for each.
- **Interaction:** When a user clicks a card, update a local state variable `selectedAsset`.
- **Main Section:** Display the `PriceChart` for the `selectedAsset`. If no asset is selected, default to the first one in the config.
- **Future Proofing:** Ensure that if I add "S&P 500" to the `assets.ts` file in Step 1, a 4th card automatically appears on the dashboard without changing any HTML.

**Design Guidelines:**

- Use a dark theme background (`bg-slate-900`).
- Use standard financial colors (Green-500 for up, Red-500 for down).
- Ensure the UI is mobile-responsive (Stack cards on mobile, Grid on desktop).
