<script lang="ts">
    import { createQuery } from "@tanstack/svelte-query";
    import { TRACKED_ASSETS } from "$lib/config/assets";
    import { fetchAssetData } from "$lib/services/priceService";
    import AssetCard from "$lib/components/AssetCard.svelte";
    import PriceChart from "$lib/components/PriceChart.svelte";

    // State for selected asset
    let selectedAssetId = TRACKED_ASSETS[0].id;

    // Create individual queries
    const btcQuery = createQuery(() => ({
        queryKey: ["asset", "bitcoin"],
        queryFn: () => fetchAssetData(TRACKED_ASSETS[0]),
        refetchInterval: 60000,
    }));

    const ethQuery = createQuery(() => ({
        queryKey: ["asset", "ethereum"],
        queryFn: () => fetchAssetData(TRACKED_ASSETS[1]),
        refetchInterval: 60000,
    }));

    const goldQuery = createQuery(() => ({
        queryKey: ["asset", "gold"],
        queryFn: () => fetchAssetData(TRACKED_ASSETS[2]),
        refetchInterval: 60000,
    }));

    // Combine for easy access
    $: queriesArray = [btcQuery, ethQuery, goldQuery];

    // Derived state
    $: selectedAsset =
        TRACKED_ASSETS.find((a) => a.id === selectedAssetId) ||
        TRACKED_ASSETS[0];
    $: selectedQueryIndex = TRACKED_ASSETS.findIndex(
        (a) => a.id === selectedAssetId,
    );
    $: selectedQuery = queriesArray[selectedQueryIndex];
    $: selectedHistory = selectedQuery?.data?.history || [];

    // Determine chart color based on 24h change
    $: chartColor =
        (selectedQuery?.data?.change24h ?? 0) >= 0 ? "#10b981" : "#f43f5e"; // Emerald-500 or Rose-500
</script>

<div class="container mx-auto max-w-7xl p-4 md:p-8">
    <header class="mb-8">
        <h1 class="text-3xl font-bold text-white">Market Dashboard</h1>
        <p class="text-slate-400">
            Real-time price tracking for crypto and commodities
        </p>
    </header>

    <!-- Asset Cards Grid -->
    <div
        class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
        {#each TRACKED_ASSETS as asset, index}
            {@const query = queriesArray[index]}
            <AssetCard
                {asset}
                data={query.data}
                selected={selectedAssetId === asset.id}
                onClick={() => (selectedAssetId = asset.id)}
            />
        {/each}
    </div>

    <!-- Main Chart Section -->
    <section class="rounded-2xl bg-slate-800/30 p-1">
        <div class="mb-4 px-4 pt-4">
            <h2 class="text-xl font-semibold text-white">
                {selectedAsset.name} Price History
                <span class="ml-2 text-sm font-normal text-slate-400"
                    >(24h)</span
                >
            </h2>
        </div>

        <div class="min-h-[400px]">
            {#if selectedQuery.isLoading}
                <div
                    class="flex h-[400px] items-center justify-center text-slate-400"
                >
                    Loading chart data...
                </div>
            {:else if selectedQuery.isError}
                <div
                    class="flex h-[400px] items-center justify-center text-rose-400"
                >
                    Error loading data: {selectedQuery.error?.message}
                </div>
            {:else}
                <PriceChart data={selectedHistory} color={chartColor} />
            {/if}
        </div>
    </section>
</div>
