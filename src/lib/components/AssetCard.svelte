<script lang="ts">
  import type { AssetConfig } from '$lib/config/assets';
  import type { AssetData } from '$lib/services/priceService';
  import { TrendingUp, TrendingDown } from 'lucide-svelte';

  export let asset: AssetConfig;
  export let data: AssetData | undefined;
  export let selected: boolean = false;
  export let onClick: () => void;

  $: isPositive = data ? data.change24h >= 0 : true;
  $: formattedPrice = data
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.currentPrice)
    : 'Loading...';
  $: formattedChange = data
    ? `${Math.abs(data.change24h).toFixed(2)}%`
    : '...';
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="cursor-pointer rounded-xl border p-5 transition-all duration-200 hover:scale-[1.02] {selected
    ? 'border-blue-500 bg-slate-800 shadow-lg shadow-blue-500/10'
    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'}"
  on:click={onClick}
>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <!-- Placeholder Icon logic could go here, using first letter for now -->
      <div class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 font-bold text-slate-300">
        {asset.symbol[0]}
      </div>
      <div>
        <h3 class="font-semibold text-slate-200">{asset.name}</h3>
        <p class="text-xs font-medium text-slate-400">{asset.symbol}</p>
      </div>
    </div>
    
    {#if data}
      <div class="flex flex-col items-end">
        <span class="text-lg font-bold text-white">{formattedPrice}</span>
        <div class="flex items-center gap-1 text-xs font-medium {isPositive ? 'text-emerald-400' : 'text-rose-400'}">
          {#if isPositive}
            <TrendingUp size={14} />
          {:else}
            <TrendingDown size={14} />
          {/if}
          <span>{formattedChange}</span>
        </div>
      </div>
    {:else}
      <div class="h-8 w-24 animate-pulse rounded bg-slate-700"></div>
    {/if}
  </div>
</div>
