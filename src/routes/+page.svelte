<script lang="ts">
    import { createQuery } from "@tanstack/svelte-query";
    import { TRACKED_ASSETS } from "$lib/config/assets";
    import { fetchAssetData } from "$lib/services/priceService";
    import AssetCard from "$lib/components/AssetCard.svelte";
    import PriceChart from "$lib/components/PriceChart.svelte";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    // State for selected asset
    let selectedAssetId = TRACKED_ASSETS[0].id;
    
    // State for visible assets
    let visibleAssetIds: string[] = TRACKED_ASSETS.map(a => a.id);
    let isMenuOpen = false;

    // Load preferences on mount
    onMount(() => {
        const saved = localStorage.getItem("visibleAssets");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    visibleAssetIds = parsed;
                }
            } catch (e) {
                console.error("Failed to parse saved preferences", e);
            }
        }
    });

    // Save preferences when changed
    $: if (browser) {
        localStorage.setItem("visibleAssets", JSON.stringify(visibleAssetIds));
    }

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

    // Handle visibility toggle
    function toggleAsset(assetId: string) {
        if (visibleAssetIds.includes(assetId)) {
            // Don't allow hiding the last asset
            if (visibleAssetIds.length <= 1) return;
            visibleAssetIds = visibleAssetIds.filter(id => id !== assetId);
            
            // If we hid the currently selected asset, select the first visible one
            if (selectedAssetId === assetId) {
                selectedAssetId = visibleAssetIds[0];
            }
        } else {
            visibleAssetIds = [...visibleAssetIds, assetId];
        }
    }
</script>

<div class="container mx-auto max-w-7xl p-4 md:p-8">
    <header class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
            <h1 class="text-3xl font-bold text-white">Market Dashboard</h1>
            <p class="text-slate-400">
                Real-time price tracking for crypto and commodities
            </p>
        </div>

        <!-- Asset Selection Menu -->
        <div class="relative">
            <button
                class="flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
                on:click={() => (isMenuOpen = !isMenuOpen)}
            >
                <span>Customize Assets</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 transition-transform {isMenuOpen ? 'rotate-180' : ''}"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {#if isMenuOpen}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-xl bg-slate-800 p-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div class="space-y-1">
                        {#each TRACKED_ASSETS as asset}
                            <button
                                type="button"
                                class="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-slate-700/50"
                                on:click={() => toggleAsset(asset.id)}
                            >
                                <div class="flex h-5 w-5 items-center justify-center rounded border border-slate-600 {visibleAssetIds.includes(asset.id) ? 'bg-indigo-500 border-indigo-500' : 'bg-transparent'}">
                                    {#if visibleAssetIds.includes(asset.id)}
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </div>
                                <span class="text-sm text-slate-200">{asset.name}</span>
                            </button>
                        {/each}
                    </div>
                </div>
                
                <!-- Backdrop to close menu -->
                <div class="fixed inset-0 z-0" on:click={() => (isMenuOpen = false)}></div>
            {/if}
        </div>
    </header>

    <!-- Asset Cards Grid -->
    <div
        class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
        {#each TRACKED_ASSETS as asset, index}
            {#if visibleAssetIds.includes(asset.id)}
                {@const query = queriesArray[index]}
                <AssetCard
                    {asset}
                    data={query.data}
                    selected={selectedAssetId === asset.id}
                    onClick={() => (selectedAssetId = asset.id)}
                />
            {/if}
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
