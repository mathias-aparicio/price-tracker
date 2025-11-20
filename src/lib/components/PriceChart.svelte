<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import type { HistoryPoint } from "$lib/services/priceService";

    export let data: HistoryPoint[] = [];
    export let color: string = "#3b82f6"; // Default blue

    let chartElement: HTMLElement;
    let chart: any;

    $: series = [
        {
            name: "Price",
            data: data.map((p) => [p.timestamp, p.value]),
        },
    ];

    $: options = {
        series: series,
        chart: {
            type: "area",
            height: 350,
            fontFamily: "inherit",
            toolbar: {
                show: false,
            },
            animations: {
                enabled: true,
            },
            background: "transparent",
        },
        colors: [color],
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 100],
            },
        },
        dataLabels: {
            enabled: false,
        },
        stroke: {
            curve: "smooth",
            width: 2,
        },
        xaxis: {
            type: "datetime",
            tooltip: {
                enabled: false,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            },
            labels: {
                style: {
                    colors: "#94a3b8",
                },
            },
        },
        yaxis: {
            labels: {
                style: {
                    colors: "#94a3b8",
                },
                formatter: (value: number) => {
                    return new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                    }).format(value);
                },
            },
        },
        grid: {
            borderColor: "#334155",
            strokeDashArray: 4,
            xaxis: {
                lines: {
                    show: false,
                },
            },
        },
        theme: {
            mode: "dark",
        },
        tooltip: {
            theme: "dark",
            x: {
                format: "dd MMM HH:mm",
            },
        },
    };

    onMount(async () => {
        const module = await import("apexcharts");
        const ApexCharts = module.default;

        if (chartElement) {
            chart = new ApexCharts(chartElement, options);
            chart.render();
        }
    });

    onDestroy(() => {
        if (chart) {
            chart.destroy();
        }
    });

    $: if (chart && options) {
        chart.updateOptions(options);
    }
</script>

<div
    class="rounded-xl border border-slate-700 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm"
>
    <div
        bind:this={chartElement}
        class="w-full text-slate-900 dark:text-slate-100"
    ></div>
</div>
