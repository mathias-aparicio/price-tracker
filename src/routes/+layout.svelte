<script lang="ts">
  import "./layout.css"; // This imports your Tailwind styles
  import { QueryClient, QueryClientProvider } from "@tanstack/svelte-query";

  // Create a client for TanStack Query
  const queryClient = new QueryClient();
</script>

<!-- This provider makes the data fetching available everywhere in your app -->
<QueryClientProvider client={queryClient}>
  <div class="min-h-screen bg-slate-900 text-white">
    <slot />
  </div>
</QueryClientProvider>
