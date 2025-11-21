# 01 - Project Overview

## Introduction
Welcome to the **Price Tracker** project! This application is a real-time dashboard for tracking the prices of various assets (Cryptocurrencies like Bitcoin, Ethereum, and commodities like Gold).

This documentation is designed to help you understand the codebase from the ground up, starting with the high-level architecture and moving into the specific modules that make it work.

## Architecture
The project is built with **SvelteKit** and uses a **Client-Server** architecture with a caching layer to respect API rate limits.

### Data Flow
1.  **External API (CoinGecko)**: The source of truth for price data.
2.  **Server-Side Polling (`src/lib/server`)**: A background process running on the server that fetches data from CoinGecko every 60 seconds.
3.  **Server Cache**: The latest data is stored in memory on the server. This prevents us from hitting CoinGecko's rate limits by serving multiple users from a single fetch.
4.  **API Route (`src/routes/api/price`)**: An internal API endpoint that exposes the cached data to the frontend.
5.  **Frontend (`src/routes/+page.svelte`)**: The user interface that fetches data from our internal API and displays it using charts and cards.

## Key Technologies
-   **SvelteKit**: The full-stack framework powering the app.
-   **TypeScript**: For type safety across the entire stack.
-   **TanStack Query**: Manages async state (fetching, caching, updating) on the frontend.
-   **ApexCharts**: Renders the interactive price history charts.
-   **Tailwind CSS**: Utility-first CSS framework for styling.

## Project Structure
-   `src/lib/server`: Backend logic (Polling, Caching).
-   `src/routes/api`: Internal API endpoints.
-   `src/lib/services`: Client-side services for fetching data.
-   `src/lib/components`: Reusable UI components.
-   `src/routes`: Application pages.

In the next section, we will dive into the **Server-Side Logic** to understand how data is fetched and cached.
