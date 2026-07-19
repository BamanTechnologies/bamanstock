<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import AssignStockModal from "$lib/components/investor/AssignStockModal.svelte";
  import EditLocationModal from "$lib/components/investor/EditLocationModal.svelte";
  import { getAuthClient } from "$graphql/client.js";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import { browser } from "$app/environment";
  import { jwtDecode } from "jwt-decode";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import CATEGORY_QUERY from "$graphql/queries/selector/product_category.gql";
  import MERCHANT_DETAIL_QUERY from "$graphql/queries/merchants/detail/id.gql";
  import SALES_TREND_QUERY from "$graphql/queries/merchants/detail/sales_trend.gql";
  import MERCHANT_STOCKS_QUERY from "$graphql/queries/merchants/detail/merchant_stocks.gql";
  import STOCK_MOVEMENT_QUERY from "$graphql/queries/reports/stock_movement/stock_movement.gql";
  import MERCHANT_REPORTS_QUERY from "$graphql/queries/merchants/detail/reports.gql";

  const merchantId = $derived($page.params.id);

  function getInvestorIdFromToken(): string {
    if (!browser) return "";
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) return "";
      const payload = jwtDecode<Record<string, any>>(token);
      return payload?.metadata?.["x-hasura-investor-id"] ?? payload?.investorId ?? "";
    } catch {
      return "";
    }
  }

  let investorId = $state(getInvestorIdFromToken());

  // ===================== General State =====================
  let activeTab = $state("Overview");
  const tabs = ["Overview", "Assigned Stock", "Stock Movement", "Reports"];

  let isAssignStockModalOpen = $state(false);
  let isEditLocationModalOpen = $state(false);

  function handleBack() {
    goto("/dashboard/merchants");
  }

  // ===================== Overview Tab =====================
  let merchantDetail = $state<any>(null);
  let productsAggregate = $state<any>(null);
  let detailLoading = $state(true);
  let salesTrendData = $state<any[]>([]);
  let chartYear = $state(new Date().getFullYear());
  let trendLoading = $state(false);

  $effect(() => {
    if (activeTab !== "Overview") return;
    detailLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const detailRes = await client.query({ query: MERCHANT_DETAIL_QUERY, variables: { id: merchantId } });
        const data = detailRes.data as any;
        merchantDetail = data?.merchant_by_pk ?? null;
        productsAggregate = data?.products_aggregate ?? null;
      } catch {
        merchantDetail = null;
        productsAggregate = null;
      } finally {
        detailLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (activeTab !== "Overview") return;
    void chartYear;
    trendLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const trendRes = investorId ? await client.query({
          query: SALES_TREND_QUERY,
          variables: { year: chartYear, merchantId, investorId },
        }) : null;
        salesTrendData = (trendRes?.data as any)?.investor_merchant_sales_trend_report ?? [];
      } catch {
        salesTrendData = [];
      } finally {
        trendLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  const overviewKpiCards = $derived.by(() => {
    if (!merchantDetail) return [];
    const d = merchantDetail;
    return [
      {
        label: "Total Revenue",
        value: fmtCurrency(d.total_revenue?.aggregate?.sum?.amount),
        change: "",
        changeType: "positive" as const,
        icon: "icon/bar-chart" as const,
        iconColor: "bg-green-100 dark:bg-green-900/40",
      },
      {
        label: "Total Transactions",
        value: fmtCurrency(d.total_transactions?.aggregate?.sum?.amount),
        change: "",
        changeType: "positive" as const,
        icon: "icon/trending-up" as const,
        iconColor: "bg-blue-100 dark:bg-blue-900/40",
      },
      {
        label: "Products Assigned",
        value: String(productsAggregate?.aggregate?.count ?? 0),
        change: "",
        changeType: "positive" as const,
        icon: "icon/package" as const,
        iconColor: "bg-orange-100 dark:bg-orange-900/40",
      },
      {
        label: "Stock Value",
        value: fmtCurrency(d.stocks_aggregate?.aggregate?.sum?.purchased_price),
        change: "",
        changeType: "positive" as const,
        icon: "icon/trending-up" as const,
        iconColor: "bg-purple-100 dark:bg-purple-900/40",
      },
    ];
  });

  // Overview chart — ApexCharts
  import ApexCharts from "apexcharts";

  const CHART_MONTHS = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const yearOptions = $derived.by(() => {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = 2024; y <= current; y++) years.push(y);
    return years;
  });

  const chartData = $derived.by(() => {
    const values: number[] = new Array(12).fill(0);
    for (const item of salesTrendData) {
      const monthDate = new Date(item.month);
      const idx = monthDate.getMonth();
      values[idx] = Number(item.total_sales) || 0;
    }
    return values;
  });

  const totalSales = $derived(chartData.reduce((a, b) => a + b, 0));

  let chartInstance: any = null;

  function chartAction(node: HTMLDivElement) {
    const options = {
      chart: { type: "area", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
      animations: { enabled: true, dynamicAnimation: { enabled: true, speed: 500 } },
      series: [{ name: "Sales", data: chartData }],
      xaxis: { categories: CHART_MONTHS, labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
      yaxis: {
        labels: {
          style: { colors: "#9ca3af", fontSize: "11px" },
          formatter: (v: number) => v >= 1000 ? `ETB ${(v / 1000).toFixed(1)}K` : `ETB ${v}`,
        },
      },
      colors: ["#4DA0E6"],
      fill: {
        type: "gradient",
        gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.05, stops: [0, 100] },
      },
      stroke: { curve: "smooth", width: 2.5 },
      dataLabels: { enabled: false },
      grid: { show: true, borderColor: "rgba(156,163,175,0.12)", strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (v: number) => `ETB ${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
      },
    };
    chartInstance = new ApexCharts(node, options);
    chartInstance.render();
    return {
      destroy() {
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
      },
    };
  }

  $effect(() => {
    void chartData;
    void salesTrendData;
    if (!chartInstance || !salesTrendData.length) return;
    chartInstance.updateSeries([{ data: chartData }]);
  });

  // ===================== Assigned Stock Tab =====================
  let stockSearchQuery = $state("");
  let stockCurrentPage = $state(1);
  let stockRowsPerPage = $state(10);
  let stockSortColumn = $state("created_at");
  let stockSortDirection = $state<"asc" | "desc">("desc");
  let stockCategoryId = $state("");

  let stockData = $state<any[]>([]);
  let stockTotalCount = $state(0);
  let stockLoading = $state(false);

  let stockDebouncedSearch = $state(stockSearchQuery);
  let stockDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(stockDebounceTimer);
    if (stockSearchQuery === stockDebouncedSearch) return;
    stockDebounceTimer = setTimeout(() => {
      stockDebouncedSearch = stockSearchQuery;
      stockCurrentPage = 1;
    }, 400);
    return () => clearTimeout(stockDebounceTimer);
  });

  const stockTotalPages = $derived(Math.max(1, Math.ceil(stockTotalCount / stockRowsPerPage)));

  function stockBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [{ created_by: { _eq: merchantId } }];
    if (stockDebouncedSearch) {
      conditions.push({
        _or: [
          { product: { name: { _ilike: `%${stockDebouncedSearch}%` } } },
          { batch_number: { _ilike: `%${stockDebouncedSearch}%` } },
          { product: { product_type: { name: { _ilike: `%${stockDebouncedSearch}%` } } } },
        ],
      });
    }
    if (stockCategoryId) {
      conditions.push({ product: { product_type_id: { _eq: stockCategoryId } } });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function stockBuildOrder(): Record<string, unknown>[] {
    switch (stockSortColumn) {
      case "product":
        return [{ product: { name: stockSortDirection } }];
      case "category":
        return [{ product: { product_type: { name: stockSortDirection } } }];
      case "quantity":
        return [{ quantity: stockSortDirection }];
      case "price":
        return [{ purchased_price: stockSortDirection }];
      case "created_at":
        return [{ created_at: stockSortDirection }];
      default:
        return [{ created_at: stockSortDirection }];
    }
  }

  $effect(() => {
    void activeTab;
    void stockDebouncedSearch;
    void stockCurrentPage;
    void stockRowsPerPage;
    void stockSortColumn;
    void stockSortDirection;
    void stockCategoryId;

    if (activeTab !== "Assigned Stock") return;
    stockLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          stock: any[];
          stock_aggregate: { aggregate: { count: number } };
        }>({
          query: MERCHANT_STOCKS_QUERY,
          variables: {
            limit: stockRowsPerPage,
            offset: (stockCurrentPage - 1) * stockRowsPerPage,
            filter: stockBuildFilter(),
            order: stockBuildOrder(),
          },
        });
        stockData = result.data?.stock ?? [];
        stockTotalCount = result.data?.stock_aggregate?.aggregate?.count ?? 0;
      } catch {
        stockData = [];
        stockTotalCount = 0;
      } finally {
        stockLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function stockHandleSort(column: string) {
    if (stockSortColumn === column) {
      stockSortDirection = stockSortDirection === "asc" ? "desc" : "asc";
    } else {
      stockSortColumn = column;
      stockSortDirection = "asc";
    }
    stockCurrentPage = 1;
  }

  // ===================== Stock Movement Tab =====================
  let smDateFrom = $state("");
  let smDateTo = $state("");

  let smSearchQuery = $state("");
  let smCurrentPage = $state(1);
  let smRowsPerPage = $state(10);
  let smSortColumn = $state("created_at");
  let smSortDirection = $state<"asc" | "desc">("desc");

  let smData = $state<any[]>([]);
  let smTotalCount = $state(0);
  let smLoading = $state(false);

  let smDebouncedSearch = $state(smSearchQuery);
  let smDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(smDebounceTimer);
    if (smSearchQuery === smDebouncedSearch) return;
    smDebounceTimer = setTimeout(() => {
      smDebouncedSearch = smSearchQuery;
      smCurrentPage = 1;
    }, 400);
    return () => clearTimeout(smDebounceTimer);
  });

  const smTotalPages = $derived(Math.max(1, Math.ceil(smTotalCount / smRowsPerPage)));

  function smBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [{ merchant: { id: { _eq: merchantId } } }];
    if (smDateFrom) {
      conditions.push({ created_at: { _gte: smDateFrom } });
    }
    if (smDateTo) {
      conditions.push({ created_at: { _lte: smDateTo } });
    }
    if (smDebouncedSearch) {
      conditions.push({
        _or: [
          { stock: { product: { name: { _ilike: `%${smDebouncedSearch}%` } } } },
          { stock: { batch_number: { _ilike: `%${smDebouncedSearch}%` } } },
          { reference_type: { _ilike: `%${smDebouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function smBuildOrder(): Record<string, unknown>[] {
    switch (smSortColumn) {
      case "movement_type":
        return [{ movement_type: smSortDirection }];
      case "product":
        return [{ stock: { product: { name: smSortDirection } } }];
      case "branch":
        return [{ branch: { name: smSortDirection } }];
      case "quantity":
        return [{ quantity_delta: smSortDirection }];
      case "created_at":
        return [{ created_at: smSortDirection }];
      default:
        return [{ created_at: smSortDirection }];
    }
  }

  $effect(() => {
    void activeTab;
    void smDebouncedSearch;
    void smCurrentPage;
    void smRowsPerPage;
    void smSortColumn;
    void smSortDirection;
    void smDateFrom;
    void smDateTo;

    if (activeTab !== "Stock Movement") return;
    smLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          stock_movements: any[];
          stock_movements_aggregate: { aggregate: { count: number } };
        }>({
          query: STOCK_MOVEMENT_QUERY,
          variables: {
            limit: smRowsPerPage,
            offset: (smCurrentPage - 1) * smRowsPerPage,
            filter: smBuildFilter(),
            order: smBuildOrder(),
          },
        });
        smData = result.data?.stock_movements ?? [];
        smTotalCount = result.data?.stock_movements_aggregate?.aggregate?.count ?? 0;
      } catch {
        smData = [];
        smTotalCount = 0;
      } finally {
        smLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function smHandleSort(column: string) {
    if (smSortColumn === column) {
      smSortDirection = smSortDirection === "asc" ? "desc" : "asc";
    } else {
      smSortColumn = column;
      smSortDirection = "asc";
    }
    smCurrentPage = 1;
  }

  function movementTypeClass(type: string): string {
    switch (type) {
      case "PURCHASE": return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
      case "SALE": return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
      case "TRANSFER_IN": return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300";
      case "TRANSFER_OUT": return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
      default: return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300";
    }
  }

  function smMerchantLabel(item: any): string {
    if (!item?.merchant) return "-";
    return [item.merchant.first_name, item.merchant.last_name].filter(Boolean).join(" ");
  }

  // ===================== Reports Tab =====================
  let rptSearchQuery = $state("");
  let rptCurrentPage = $state(1);
  let rptRowsPerPage = $state(10);
  let rptSortColumn = $state("created_at");
  let rptSortDirection = $state<"asc" | "desc">("desc");

  let rptData = $state<any[]>([]);
  let rptTotalCount = $state(0);
  let rptLoading = $state(false);

  let rptDebouncedSearch = $state(rptSearchQuery);
  let rptDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(rptDebounceTimer);
    if (rptSearchQuery === rptDebouncedSearch) return;
    rptDebounceTimer = setTimeout(() => {
      rptDebouncedSearch = rptSearchQuery;
      rptCurrentPage = 1;
    }, 400);
    return () => clearTimeout(rptDebounceTimer);
  });

  const rptTotalPages = $derived(Math.max(1, Math.ceil(rptTotalCount / rptRowsPerPage)));

  function rptBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [{ merchant_id: { _eq: merchantId } }];
    if (rptDebouncedSearch) {
      conditions.push({
        _or: [
          { message: { _ilike: `%${rptDebouncedSearch}%` } },
          { sms_status: { _ilike: `%${rptDebouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function rptBuildOrder(): Record<string, unknown>[] {
    switch (rptSortColumn) {
      case "message":
        return [{ message: rptSortDirection }];
      case "status":
        return [{ sms_status: rptSortDirection }];
      case "created_at":
        return [{ created_at: rptSortDirection }];
      default:
        return [{ created_at: rptSortDirection }];
    }
  }

  $effect(() => {
    void activeTab;
    void rptDebouncedSearch;
    void rptCurrentPage;
    void rptRowsPerPage;
    void rptSortColumn;
    void rptSortDirection;

    if (activeTab !== "Reports") return;
    rptLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          reports: any[];
          reports_aggregate: { aggregate: { count: number } };
        }>({
          query: MERCHANT_REPORTS_QUERY,
          variables: {
            limit: rptRowsPerPage,
            offset: (rptCurrentPage - 1) * rptRowsPerPage,
            filter: rptBuildFilter(),
            order: rptBuildOrder(),
          },
        });
        rptData = result.data?.reports ?? [];
        rptTotalCount = result.data?.reports_aggregate?.aggregate?.count ?? 0;
      } catch {
        rptData = [];
        rptTotalCount = 0;
      } finally {
        rptLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function rptHandleSort(column: string) {
    if (rptSortColumn === column) {
      rptSortDirection = rptSortDirection === "asc" ? "desc" : "asc";
    } else {
      rptSortColumn = column;
      rptSortDirection = "asc";
    }
    rptCurrentPage = 1;
  }

  // ===================== Shared Utilities =====================
  const AVATAR_COLORS = [
    "#4DA0E6", "#D15B7A", "#34A853", "#FBBC05",
    "#FF6B6B", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77",
  ];

  function avatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  }

  function initials(first_name: string, last_name: string): string {
    return (first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "");
  }

  function fmtCurrency(val: unknown): string {
    if (val == null) return "ETB 0";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function formatBranch(name: string | null | undefined): string {
    if (!name) return "-";
    return name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }

  function getVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
    return pages;
  }


</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Merchants</span>
  </button>

  <!-- Merchant Profile Card -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
          style="background-color: {avatarColor(merchantDetail?.first_name ?? 'M')}"
        >
          {merchantDetail ? initials(merchantDetail.first_name, merchantDetail.last_name) : 'M'}
        </div>
        <div>
          {#if detailLoading}
            <div class="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
            <div class="h-4 w-32 bg-muted/60 rounded animate-pulse" />
          {:else if merchantDetail}
            <h2 class="text-2xl font-semibold text-foreground">
              {merchantDetail.first_name} {merchantDetail.last_name}
            </h2>
            <div class="flex items-center gap-4 mt-1">
              <span class="text-sm text-muted-foreground">
                {formatBranch(merchantDetail.branch?.name)}
              </span>
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active
              </span>
            </div>
          {:else}
            <h2 class="text-2xl font-semibold text-foreground">Merchant</h2>
          {/if}
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="border-info text-info"
          onclick={() => (isEditLocationModalOpen = true)}
        >
          Edit Location
        </Button>
        <Button
          class="bg-[var(--primary-blue)] text-white hover:opacity-90"
          onclick={() => (isAssignStockModalOpen = true)}
        >
          Assign Stock
        </Button>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      {#each tabs as tab}
        <button
          onclick={() => (activeTab = tab)}
          class="pb-4 px-1 border-b-2 transition-colors {activeTab === tab
            ? 'border-info text-info font-medium'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <!-- ==================== Tab: Overview ==================== -->
  {#if activeTab === "Overview"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#if detailLoading}
          {#each [1,2,3,4] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3" />
              <div class="h-8 bg-muted rounded w-32 mb-3" />
              <div class="h-5 bg-muted rounded w-36" />
            </div>
          {/each}
        {:else}
          {#each overviewKpiCards as kpi}
            <div class="bg-card border border-border rounded-lg p-6">
              <div class="flex items-center justify-between mb-4">
                <span class="text-sm text-muted-foreground">{kpi.label}</span>
                <div
                  class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center"
                >
                  <Icon iconName={kpi.icon} size={20} class="text-foreground" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Charts and Info Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Over Time Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-foreground mb-1">
                Revenue Over Time
              </h3>
              <p class="text-2xl font-bold text-foreground">{fmtCurrency(totalSales)}</p>
              {#if chartYear}
                <p class="text-sm text-muted-foreground">Year {chartYear}</p>
              {/if}
            </div>
            <select
              class="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={chartYear}
            >
              {#each yearOptions as year}
                <option value={year}>{year}</option>
              {/each}
            </select>
          </div>
          {#if salesTrendData.length > 0}
            <div class="relative">
              <div use:chartAction class="w-full" />
              {#if trendLoading}
                <div class="absolute inset-0 bg-background/50 flex items-center justify-center rounded">
                  <div class="animate-spin h-8 w-8 border-2 border-info border-t-transparent rounded-full" />
                </div>
              {/if}
            </div>
          {:else if trendLoading}
            <div class="h-[280px] bg-muted/30 rounded animate-pulse" />
          {:else}
            <div class="h-[280px] bg-muted/30 rounded flex items-center justify-center">
              <p class="text-muted-foreground">No sales data available</p>
            </div>
          {/if}
        </div>

        <!-- Merchant Information -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-foreground mb-6">
            Merchant Information
          </h3>
          {#if detailLoading}
            <div class="space-y-4">
              {#each [1,2,3,4] as _}
                <div>
                  <div class="h-3 w-24 bg-muted rounded mb-1 animate-pulse" />
                  <div class="h-4 w-48 bg-muted/60 rounded animate-pulse" />
                </div>
              {/each}
            </div>
          {:else if merchantDetail}
            <div class="space-y-4">
              <div>
                <p class="text-sm text-muted-foreground mb-1">Contact Phone</p>
                <p class="text-sm text-foreground">{merchantDetail.phone_number ?? "-"}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Address</p>
                <p class="text-sm text-foreground">{merchantDetail.address ?? "-"}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Location</p>
                <p class="text-sm text-foreground">{formatBranch(merchantDetail.branch?.name)}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Company</p>
                <p class="text-sm text-foreground">{merchantDetail.branch?.company?.name ?? "-"}</p>
              </div>
              <div>
                <p class="text-sm text-muted-foreground mb-1">Joined</p>
                <p class="text-sm text-foreground">
                  {merchantDetail.created_at ? new Date(merchantDetail.created_at).toLocaleDateString() : "-"}
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Assigned Stock ==================== -->
  {:else if activeTab === "Assigned Stock"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by stock name, batch..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={stockSearchQuery}
            />
          </div>
          <SearchSelect
            query={CATEGORY_QUERY}
            dataKey="product_types"
            filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
            displayLabel={(item) => item.name}
            placeholder="All Categories"
            initialValue={stockCategoryId}
            onSelect={(item) => { stockCategoryId = item?.id ?? ""; stockCurrentPage = 1; }}
          />
        </div>

        {#if stockLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => stockHandleSort("product")}>
                    Product
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'product' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'product' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => stockHandleSort("category")}>
                    Category
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'category' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'category' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Batch #</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => stockHandleSort("quantity")}>
                    Qty
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => stockHandleSort("price")}>
                    Unit Price
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'price' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'price' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Branch</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => stockHandleSort("created_at")}>
                    Date Added
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if stockData.length === 0 && !stockLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>No stock assigned to this merchant</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each stockData as item}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon iconName="icon/package" size={16} class="text-muted-foreground" />
                        </div>
                        <span class="text-sm font-medium text-foreground">{item.product?.name ?? "-"}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-foreground">{item.product?.type?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{item.batch_number ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{item.quantity ?? 0}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(item.purchased_price)}</td>
                    <td class="px-4 py-3 text-foreground">{item.branch?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={stockRowsPerPage}
              onchange={() => { stockCurrentPage = 1; }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={stockCurrentPage === 1}
              onclick={() => stockCurrentPage = stockCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(stockCurrentPage, stockTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === stockCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === stockCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => stockCurrentPage = p}
                >
                  {p}
                </button>
              {:else}
                <span class="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              {/if}
            {/each}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={stockCurrentPage === stockTotalPages}
              onclick={() => stockCurrentPage = stockCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Stock Movement ==================== -->
  {:else if activeTab === "Stock Movement"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0 max-w-[200px]">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">From</label>
            <input
              type="date"
              bind:value={smDateFrom}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0 max-w-[200px]">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">To</label>
            <input
              type="date"
              bind:value={smDateTo}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
        </div>
      </div>

      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by product, batch..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={smSearchQuery}
            />
          </div>
        </div>

        {#if smLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">Reference</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => smHandleSort("movement_type")}>
                    Type
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'movement_type' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'movement_type' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => smHandleSort("product")}>
                    Product
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'product' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'product' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Batch #</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => smHandleSort("branch")}>
                    Location
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'branch' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'branch' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => smHandleSort("quantity")}>
                    Qty
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'quantity' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'quantity' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => smHandleSort("created_at")}>
                    Date
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'created_at' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'created_at' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if smData.length === 0 && !smLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>No stock movements found</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each smData as movement}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground text-xs">{movement.reference_type ?? "-"}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {movementTypeClass(movement.movement_type)}">
                        {movement.movement_type}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-foreground">{movement.stock?.product?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{movement.stock?.batch_number ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{movement.branch?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{movement.quantity_delta ?? 0}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {movement.created_at ? new Date(movement.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={smRowsPerPage}
              onchange={() => { smCurrentPage = 1; }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={smCurrentPage === 1}
              onclick={() => smCurrentPage = smCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(smCurrentPage, smTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === smCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === smCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => smCurrentPage = p}
                >
                  {p}
                </button>
              {:else}
                <span class="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              {/if}
            {/each}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={smCurrentPage === smTotalPages}
              onclick={() => smCurrentPage = smCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Reports ==================== -->
  {:else if activeTab === "Reports"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search reports..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={rptSearchQuery}
            />
          </div>
        </div>

        {#if rptLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => rptHandleSort("message")}>
                    Message
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={rptSortColumn === 'message' && rptSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={rptSortColumn === 'message' && rptSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => rptHandleSort("status")}>
                    Status
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={rptSortColumn === 'status' && rptSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={rptSortColumn === 'status' && rptSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => rptHandleSort("created_at")}>
                    Date
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={rptSortColumn === 'created_at' && rptSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={rptSortColumn === 'created_at' && rptSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if rptData.length === 0 && !rptLoading}
                <tr>
                  <td colspan="3" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/file-text" size={32} class="text-muted-foreground" />
                      <p>No reports found</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each rptData as report}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon iconName="icon/file-text" size={16} class="text-muted-foreground" />
                        </div>
                        <span class="text-sm text-foreground">{report.message ?? "-"}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {report.sms_status === 'sent' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : report.sms_status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}">
                        {report.sms_status ?? "-"}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {report.created_at ? new Date(report.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={rptRowsPerPage}
              onchange={() => { rptCurrentPage = 1; }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={rptCurrentPage === 1}
              onclick={() => rptCurrentPage = rptCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(rptCurrentPage, rptTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === rptCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === rptCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => rptCurrentPage = p}
                >
                  {p}
                </button>
              {:else}
                <span class="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              {/if}
            {/each}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={rptCurrentPage === rptTotalPages}
              onclick={() => rptCurrentPage = rptCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Assign Stock Modal -->
  <AssignStockModal
    bind:isOpen={isAssignStockModalOpen}
    merchantName={merchantDetail ? `${merchantDetail.first_name} ${merchantDetail.last_name}` : "Merchant"}
    onAssign={(data) => {
      console.log("Assigning stock:", data);
    }}
  />

  <!-- Edit Location Modal -->
  <EditLocationModal
    bind:isOpen={isEditLocationModalOpen}
    merchantName={merchantDetail ? `${merchantDetail.first_name} ${merchantDetail.last_name}` : "Merchant"}
    currentLocation={formatBranch(merchantDetail?.branch?.name)}
    onConfirm={(location) => {
      console.log("Changing location to:", location);
    }}
  />
</div>

<style>
  :global(.loading-slide) {
    animation: loading-slide 1.5s infinite linear;
  }
  @keyframes loading-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>
