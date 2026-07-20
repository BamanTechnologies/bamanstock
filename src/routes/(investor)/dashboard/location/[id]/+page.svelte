<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import DeleteLocationModal from "$lib/components/investor/DeleteLocationModal.svelte";
  import AddLocationModal from "$lib/components/investor/AddLocationModal.svelte";
  import AssignStockToLocationModal from "$lib/components/investor/AssignStockToLocationModal.svelte";
  import TransferStockModal from "$lib/components/investor/TransferStockModal.svelte";
  import RemoveStockItemModal from "$lib/components/investor/RemoveStockItemModal.svelte";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.js";
  import { browser } from "$app/environment";
  import { jwtDecode } from "jwt-decode";
  import ApexCharts from "apexcharts";
  import LOCATION_DETAIL_QUERY from "$graphql/queries/locations/detail/id.gql";
  import BRANCH_SALES_TREND_QUERY from "$graphql/queries/locations/detail/branch_sales_trend.gql";
  import STOCK_CATEGORY_PROPORTION_QUERY from "$graphql/queries/locations/detail/stock_product_category_proportion.gql";
  import LOW_STOCK_ALERT_QUERY from "$graphql/queries/locations/detail/low_stock_alert.gql";
  import STOCK_MOVEMENT_QUERY from "$graphql/queries/reports/stock_movement/stock_movement.gql";
  import STOCKS_QUERY from "$graphql/queries/stocks/stocks.gql";
  import MERCHANTS_QUERY from "$graphql/queries/merchants/investor_merchants.gql";
  import CATEGORY_QUERY from "$graphql/queries/selector/product_category.gql";

  const locationId = $derived($page.params.id);

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

  let activeTab = $state($page.url.searchParams.get("tab") ?? "Overview");
  const tabs = ["Overview", "Stock", "Merchants", "Stock Movement"];

  function switchTab(tab: string) {
    activeTab = tab;
    const params = new URLSearchParams($page.url.searchParams);
    params.set("tab", tab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let isDeleteLocationModalOpen = $state(false);
  let isEditLocationModalOpen = $state(false);
  let isAssignStockToLocationModalOpen = $state(false);
  let isTransferStockModalOpen = $state(false);
  let isRemoveStockItemModalOpen = $state(false);
  let stockItemToRemove = $state<any>(undefined);

  function handleBack() {
    goto("/dashboard/location");
  }

  // ===================== Overview Tab =====================
  let detailData = $state<any>(null);
  let detailLoading = $state(true);
  let salesTrendData = $state<any[]>([]);
  let chartYear = $state(new Date().getFullYear());
  let trendLoading = $state(false);
  let categoryProportion = $state<any[]>([]);

  $effect(() => {
    if (activeTab !== "Overview") return;
    detailLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({ query: LOCATION_DETAIL_QUERY, variables: { id: locationId } });
        detailData = (result.data as any) ?? null;
      } catch {
        detailData = null;
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
          query: BRANCH_SALES_TREND_QUERY,
          variables: { year: chartYear, branchId: locationId, investorId },
        }) : null;
        salesTrendData = (trendRes?.data as any)?.investor_branch_sales_trend_report ?? [];
      } catch {
        salesTrendData = [];
      } finally {
        trendLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  $effect(() => {
    if (activeTab !== "Overview") return;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const res = investorId ? await client.query({
          query: STOCK_CATEGORY_PROPORTION_QUERY,
          variables: { branchId: locationId, investorId },
        }) : null;
        categoryProportion = (res?.data as any)?.merchant_branch_stock_product_category_proportion_report ?? [];
      } catch {
        categoryProportion = [];
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  const overviewKpiCards = $derived.by(() => {
    if (!detailData) return [];
    const d = detailData;
    const totalRevenue = d.payment_aggregate?.aggregate?.sum?.amount ?? 0;
    const stockValue = d.branches_by_pk?.stocks_aggregate?.aggregate?.sum?.selling_price ?? 0;
    const activeMerchants = d.branches_by_pk?.total_merchants?.aggregate?.count ?? 0;
    const lowStockCount = d.total_low_stock_products?.aggregate?.count ?? 0;
    return [
      { label: "Total Revenue", value: fmtCurrency(totalRevenue), change: "", changeType: "positive" as const, icon: "icon/bar-chart" as const, iconColor: "bg-green-100 dark:bg-green-900/40" },
      { label: "Total Stock Value", value: fmtCurrency(stockValue), change: "", changeType: "positive" as const, icon: "icon/trending-up" as const, iconColor: "bg-blue-100 dark:bg-blue-900/40" },
      { label: "Active Merchants", value: String(activeMerchants), change: "", changeType: "positive" as const, icon: "icon/building" as const, iconColor: "bg-purple-100 dark:bg-purple-900/40" },
      { label: "Low Stock Items", value: String(lowStockCount), change: "", changeType: "negative" as const, icon: "icon/box" as const, iconColor: "bg-orange-100 dark:bg-orange-900/40" },
    ];
  });

  const CHART_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

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
      yaxis: { labels: { style: { colors: "#9ca3af", fontSize: "11px" }, formatter: (v: number) => v >= 1000 ? `ETB ${(v / 1000).toFixed(1)}K` : `ETB ${v}` } },
      colors: ["#4DA0E6"],
      fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.25, opacityTo: 0.05, stops: [0, 100] } },
      stroke: { curve: "smooth", width: 2.5 },
      dataLabels: { enabled: false },
      grid: { show: true, borderColor: "rgba(156,163,175,0.12)", strokeDashArray: 4 },
      tooltip: { y: { formatter: (v: number) => `ETB ${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}` } },
    };
    chartInstance = new ApexCharts(node, options);
    chartInstance.render();
    return {
      destroy() { if (chartInstance) { chartInstance.destroy(); chartInstance = null; } },
    };
  }

  $effect(() => {
    void chartData;
    void salesTrendData;
    if (!chartInstance || !salesTrendData.length) return;
    chartInstance.updateSeries([{ data: chartData }]);
  });

  // Stock Distribution Donut Chart
  const DONUT_COLORS = ["#4DA0E6", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"];
  let donutChartInstance: any = null;

  const donutLabels = $derived(categoryProportion.map((c) => c.category));
  const donutSeries = $derived(categoryProportion.map((c) => Number(c.total_products) || 0));

  function donutChartAction(node: HTMLDivElement) {
    const options = {
      chart: { type: "donut", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
      labels: donutLabels,
      series: donutSeries,
      colors: DONUT_COLORS,
      plotOptions: {
        pie: {
          donut: {
            size: "55%",
            labels: {
              show: true,
              total: { show: true, label: "Total", formatter: () => String(donutSeries.reduce((a: number, b: number) => a + b, 0)) },
            },
          },
        },
      },
      dataLabels: { enabled: true, style: { fontSize: "11px" }, dropShadow: { enabled: false } },
      legend: { show: true, position: "bottom", fontSize: "12px", labels: { colors: "#9ca3af" } },
      tooltip: { y: { formatter: (v: number) => `${v} products` } },
      stroke: { width: 0 },
      responsive: [{ breakpoint: 480, options: { chart: { height: 220 }, legend: { show: false } } }],
    };
    donutChartInstance = new ApexCharts(node, options);
    donutChartInstance.render();
    return {
      destroy() { if (donutChartInstance) { donutChartInstance.destroy(); donutChartInstance = null; } },
    };
  }

  $effect(() => {
    void donutLabels;
    void donutSeries;
    if (!donutChartInstance || !donutSeries.length) return;
    donutChartInstance.updateOptions({
      labels: donutLabels,
      series: donutSeries,
    });
  });

  // Low Stock Alert
  let lowStockData = $state<any[]>([]);
  let lowStockTotalCount = $state(0);
  let lowStockLoading = $state(false);
  let lowStockCurrentPage = $state(1);
  let lowStockRowsPerPage = $state(10);

  const lowStockTotalPages = $derived(Math.max(1, Math.ceil(lowStockTotalCount / lowStockRowsPerPage)));

  $effect(() => {
    if (activeTab !== "Overview") return;
    void lowStockCurrentPage;
    void lowStockRowsPerPage;
    lowStockLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: LOW_STOCK_ALERT_QUERY,
          variables: { id: locationId, limit: lowStockRowsPerPage, offset: (lowStockCurrentPage - 1) * lowStockRowsPerPage },
        });
        const d = result.data as any;
        lowStockData = d?.products ?? [];
        lowStockTotalCount = d?.total?.aggregate?.count ?? 0;
      } catch {
        lowStockData = [];
        lowStockTotalCount = 0;
      } finally {
        lowStockLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  // ===================== Stock Tab =====================
  function stockSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (stockDebouncedSearch) params.set("stk_search", stockDebouncedSearch); else params.delete("stk_search");
    if (stockCurrentPage > 1) params.set("stk_page", String(stockCurrentPage)); else params.delete("stk_page");
    if (stockRowsPerPage !== 10) params.set("stk_limit", String(stockRowsPerPage)); else params.delete("stk_limit");
    if (stockSortColumn !== "created_at") params.set("stk_sort", stockSortColumn); else params.delete("stk_sort");
    if (stockSortDirection !== "desc") params.set("stk_dir", stockSortDirection); else params.delete("stk_dir");
    if (stockCategoryId) params.set("stk_category", stockCategoryId); else params.delete("stk_category");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let stockSearchQuery = $state($page.url.searchParams.get("stk_search") ?? "");
  let stockCurrentPage = $state(Number($page.url.searchParams.get("stk_page")) || 1);
  let stockRowsPerPage = $state(Number($page.url.searchParams.get("stk_limit")) || 10);
  let stockSortColumn = $state($page.url.searchParams.get("stk_sort") || "created_at");
  let stockSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("stk_dir") as "asc" | "desc") || "desc"
  );
  let stockCategoryId = $state($page.url.searchParams.get("stk_category") ?? "");

  let stockData = $state<any[]>([]);
  let stockTotalCount = $state(0);
  let stockLoading = $state(false);

  let stockDebouncedSearch = $state($page.url.searchParams.get("stk_search") ?? "");
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
    const conditions: Record<string, unknown>[] = [
      { _or: [
        { branchByBranch: { id: { _eq: locationId } } },
        { branchByOrigin: { id: { _eq: locationId } } },
      ]}
    ];
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
      case "product": return [{ product: { name: stockSortDirection } }];
      case "category": return [{ product: { product_type: { name: stockSortDirection } } }];
      case "quantity": return [{ quantity: stockSortDirection }];
      case "price": return [{ purchased_price: stockSortDirection }];
      case "created_at": return [{ created_at: stockSortDirection }];
      default: return [{ created_at: stockSortDirection }];
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

    if (activeTab !== "Stock") return;
    stockLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: STOCKS_QUERY,
          variables: {
            limit: stockRowsPerPage,
            offset: (stockCurrentPage - 1) * stockRowsPerPage,
            filter: stockBuildFilter(),
            order: stockBuildOrder(),
          },
        });
        const d = result.data as any;
        stockData = d?.stock ?? [];
        stockTotalCount = d?.stock_aggregate?.aggregate?.count ?? 0;
        stockSyncUrl();
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

  // ===================== Merchants Tab =====================
  function merchantSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (merchantDebouncedSearch) params.set("mch_search", merchantDebouncedSearch); else params.delete("mch_search");
    if (merchantCurrentPage > 1) params.set("mch_page", String(merchantCurrentPage)); else params.delete("mch_page");
    if (merchantRowsPerPage !== 10) params.set("mch_limit", String(merchantRowsPerPage)); else params.delete("mch_limit");
    if (merchantSortColumn !== "created_at") params.set("mch_sort", merchantSortColumn); else params.delete("mch_sort");
    if (merchantSortDirection !== "desc") params.set("mch_dir", merchantSortDirection); else params.delete("mch_dir");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let merchantSearchQuery = $state($page.url.searchParams.get("mch_search") ?? "");
  let merchantCurrentPage = $state(Number($page.url.searchParams.get("mch_page")) || 1);
  let merchantRowsPerPage = $state(Number($page.url.searchParams.get("mch_limit")) || 10);
  let merchantSortColumn = $state($page.url.searchParams.get("mch_sort") || "created_at");
  let merchantSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("mch_dir") as "asc" | "desc") || "desc"
  );

  let merchantData = $state<any[]>([]);
  let merchantTotalCount = $state(0);
  let merchantLoading = $state(false);

  let merchantDebouncedSearch = $state($page.url.searchParams.get("mch_search") ?? "");
  let merchantDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(merchantDebounceTimer);
    if (merchantSearchQuery === merchantDebouncedSearch) return;
    merchantDebounceTimer = setTimeout(() => {
      merchantDebouncedSearch = merchantSearchQuery;
      merchantCurrentPage = 1;
    }, 400);
    return () => clearTimeout(merchantDebounceTimer);
  });

  const merchantTotalPages = $derived(Math.max(1, Math.ceil(merchantTotalCount / merchantRowsPerPage)));

  function merchantBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [{ branch: { _eq: locationId } }];
    if (merchantDebouncedSearch) {
      conditions.push({
        _or: [
          { first_name: { _ilike: `%${merchantDebouncedSearch}%` } },
          { last_name: { _ilike: `%${merchantDebouncedSearch}%` } },
          { phone_number: { _ilike: `%${merchantDebouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function merchantBuildOrder(): Record<string, unknown>[] {
    switch (merchantSortColumn) {
      case "name": return [{ first_name: merchantSortDirection }];
      case "sales": return [{ orders_aggregate: { sum: { total_amount: merchantSortDirection } } }];
      case "outstanding": return [{ orders_aggregate: { sum: { outstanding_amount: merchantSortDirection } } }];
      case "orders": return [{ orders_aggregate: { count: merchantSortDirection } }];
      case "created_at": return [{ created_at: merchantSortDirection }];
      default: return [{ created_at: merchantSortDirection }];
    }
  }

  $effect(() => {
    void activeTab;
    void merchantDebouncedSearch;
    void merchantCurrentPage;
    void merchantRowsPerPage;
    void merchantSortColumn;
    void merchantSortDirection;

    if (activeTab !== "Merchants") return;
    merchantLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: MERCHANTS_QUERY,
          variables: {
            limit: merchantRowsPerPage,
            offset: (merchantCurrentPage - 1) * merchantRowsPerPage,
            filter: merchantBuildFilter(),
            order: merchantBuildOrder(),
          },
        });
        const d = result.data as any;
        merchantData = d?.merchant ?? [];
        merchantTotalCount = d?.total?.aggregate?.count ?? 0;
        merchantSyncUrl();
      } catch {
        merchantData = [];
        merchantTotalCount = 0;
      } finally {
        merchantLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  function merchantHandleSort(column: string) {
    if (merchantSortColumn === column) {
      merchantSortDirection = merchantSortDirection === "asc" ? "desc" : "asc";
    } else {
      merchantSortColumn = column;
      merchantSortDirection = "asc";
    }
    merchantCurrentPage = 1;
  }

  function handleMerchantView(item: any) {
    goto(`/dashboard/merchants/${item.id}`);
  }

  // ===================== Stock Movement Tab =====================
  function smSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (smDebouncedSearch) params.set("sm_search", smDebouncedSearch); else params.delete("sm_search");
    if (smCurrentPage > 1) params.set("sm_page", String(smCurrentPage)); else params.delete("sm_page");
    if (smRowsPerPage !== 10) params.set("sm_limit", String(smRowsPerPage)); else params.delete("sm_limit");
    if (smSortColumn !== "created_at") params.set("sm_sort", smSortColumn); else params.delete("sm_sort");
    if (smSortDirection !== "desc") params.set("sm_dir", smSortDirection); else params.delete("sm_dir");
    if (smDateFrom) params.set("sm_from", smDateFrom); else params.delete("sm_from");
    if (smDateTo) params.set("sm_to", smDateTo); else params.delete("sm_to");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let smDateFrom = $state($page.url.searchParams.get("sm_from") ?? "");
  let smDateTo = $state($page.url.searchParams.get("sm_to") ?? "");

  let smSearchQuery = $state($page.url.searchParams.get("sm_search") ?? "");
  let smCurrentPage = $state(Number($page.url.searchParams.get("sm_page")) || 1);
  let smRowsPerPage = $state(Number($page.url.searchParams.get("sm_limit")) || 10);
  let smSortColumn = $state($page.url.searchParams.get("sm_sort") || "created_at");
  let smSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("sm_dir") as "asc" | "desc") || "desc"
  );

  let smData = $state<any[]>([]);
  let smTotalCount = $state(0);
  let smLoading = $state(false);

  let smDebouncedSearch = $state($page.url.searchParams.get("sm_search") ?? "");
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
    const conditions: Record<string, unknown>[] = [{ branch: { id: { _eq: locationId } } }];
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
      case "movement_type": return [{ movement_type: smSortDirection }];
      case "product": return [{ stock: { product: { name: smSortDirection } } }];
      case "branch": return [{ branch: { name: smSortDirection } }];
      case "quantity": return [{ quantity_delta: smSortDirection }];
      case "created_at": return [{ created_at: smSortDirection }];
      default: return [{ created_at: smSortDirection }];
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
        const result = await client.query({
          query: STOCK_MOVEMENT_QUERY,
          variables: {
            limit: smRowsPerPage,
            offset: (smCurrentPage - 1) * smRowsPerPage,
            filter: smBuildFilter(),
            order: smBuildOrder(),
          },
        });
        const d = result.data as any;
        smData = d?.stock_movements ?? [];
        smTotalCount = d?.stock_movements_aggregate?.aggregate?.count ?? 0;
        smSyncUrl();
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

  // ===================== Shared Utilities =====================
  const AVATAR_COLORS = [
    "#4DA0E6","#D15B7A","#34A853","#FBBC05",
    "#FF6B6B","#6B5B95","#88B04B","#F7CAC9",
    "#92A8D1","#955251","#B565A7","#009B77",
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

  function getVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("..."); pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1); pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1); pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("..."); pages.push(total);
    }
    return pages;
  }

  function handleOrder(item: any) {
    console.log("Order item:", item);
  }

  function formatLocationName(name: string | null | undefined): string {
    if (!name) return "-";
    return name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  }

  function formatBranch(name: string | null | undefined): string {
    if (!name) return "-";
    return name.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Location</span>
  </button>

  <!-- Location Profile Card -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div>
        {#if detailLoading}
          <div class="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div class="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        {:else}
          <h2 class="text-2xl font-semibold text-foreground mb-2">
            {formatLocationName(detailData?.branches_by_pk?.name)}
          </h2>
          <div class="flex items-center gap-2 mb-2">
            <p class="text-sm text-muted-foreground">{detailData?.branches_by_pk?.address ?? "-"}</p>
            <span class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active
            </span>
          </div>
          <p class="text-xs text-muted-foreground">
            Company: {detailData?.branches_by_pk?.company?.name ?? "-"}
          </p>
        {/if}
      </div>
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="border-[#4DA0E6] text-[#4DA0E6] hover:bg-[#4DA0E6]/10"
          onclick={() => (isDeleteLocationModalOpen = true)}
        >
          Close Location
        </Button>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#4DA0E6]/90"
          onclick={() => (isEditLocationModalOpen = true)}
        >
          Edit Location
        </Button>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      {#each tabs as tab}
        <button
          onclick={() => switchTab(tab)}
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
                <div class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center">
                  <Icon iconName={kpi.icon} size={20} class="text-foreground" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Over Time Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-foreground mb-1">Revenue Over Time</h3>
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

        <!-- Stock Distribution -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-foreground mb-6">Stock Distribution</h3>
          {#if categoryProportion.length > 0}
            <div use:donutChartAction class="w-full" />
          {:else}
            <div class="h-48 bg-muted/30 rounded flex items-center justify-center">
              <p class="text-muted-foreground">No stock distribution data</p>
            </div>
          {/if}
        </div>
      </div>

      <!-- Low Stock Alert Section -->
      <div class="bg-card border border-border rounded-lg p-6">
        <h3 class="text-lg font-semibold text-foreground mb-6">Low Stock Alert</h3>
        {#if lowStockLoading}
          <div class="space-y-4">
            {#each [1,2,3] as _}
              <div class="flex items-center justify-between p-4 border border-border rounded-lg animate-pulse">
                <div class="space-y-2">
                  <div class="h-4 w-32 bg-muted rounded" />
                  <div class="h-3 w-48 bg-muted/60 rounded" />
                </div>
                <div class="h-8 w-20 bg-muted rounded" />
              </div>
            {/each}
          </div>
        {:else if lowStockData.length === 0}
          <div class="text-center py-8">
            <Icon iconName="icon/box" size={40} class="text-muted-foreground mx-auto mb-3" />
            <p class="text-muted-foreground">No low stock items found</p>
          </div>
        {:else}
          <div class="space-y-4">
            {#each lowStockData as item}
              <div class="flex items-center justify-between p-4 border border-border rounded-lg bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/30 transition-colors">
                <div>
                  <p class="text-sm font-medium text-foreground mb-1">{item.name}</p>
                  <p class="text-xs text-muted-foreground">
                    Qty: {item.current_available_stock} / Threshold: {item.treshold_quantity}
                  </p>
                </div>
                <Button
                  variant="outline"
                  class="border-info text-info hover:bg-info/10"
                  onclick={() => handleOrder(item)}
                >
                  Order
                </Button>
              </div>
            {/each}
          </div>

          <!-- Low Stock Pagination -->
          <div class="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted-foreground">Row Per Page</span>
              <select
                class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
                bind:value={lowStockRowsPerPage}
                onchange={() => { lowStockCurrentPage = 1; }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span class="text-sm text-muted-foreground">Entries</span>
            </div>
            <div class="flex items-center gap-1">
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
                style="background-color:#4DA0E620; color:#4DA0E6;"
                disabled={lowStockCurrentPage === 1}
                onclick={() => lowStockCurrentPage = lowStockCurrentPage - 1}
              >
                <Icon iconName="icon/chevron-left" size={16} />
              </button>
              {#each getVisiblePages(lowStockCurrentPage, lowStockTotalPages) as p}
                {#if typeof p === "number"}
                  <button
                    class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === lowStockCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                    style={p === lowStockCurrentPage ? 'background-color:#4DA0E6;' : ''}
                    onclick={() => lowStockCurrentPage = p}
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
                disabled={lowStockCurrentPage === lowStockTotalPages}
                onclick={() => lowStockCurrentPage = lowStockCurrentPage + 1}
              >
                <Icon iconName="icon/chevron-right" size={16} />
              </button>
            </div>
          </div>
        {/if}
      </div>
    </div>

  <!-- ==================== Tab: Stock ==================== -->
  {:else if activeTab === "Stock"}
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
            filterBuilder={(s: string) => ({ name: { _ilike: `%${s}%` } })}
            displayLabel={(item: any) => item.name}
            placeholder="All Categories"
            initialValue={stockCategoryId}
            onSelect={(item: any) => { stockCategoryId = item?.id ?? ""; stockCurrentPage = 1; }}
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
                      <p>No stock found for this location</p>
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

  <!-- ==================== Tab: Merchants ==================== -->
  {:else if activeTab === "Merchants"}
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
              placeholder="Search merchants..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={merchantSearchQuery}
            />
          </div>
        </div>

        {#if merchantLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => merchantHandleSort("name")}>
                    Merchant
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={merchantSortColumn === 'name' && merchantSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={merchantSortColumn === 'name' && merchantSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Phone</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => merchantHandleSort("sales")}>
                    Sales
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={merchantSortColumn === 'sales' && merchantSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={merchantSortColumn === 'sales' && merchantSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => merchantHandleSort("outstanding")}>
                    Outstanding
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={merchantSortColumn === 'outstanding' && merchantSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={merchantSortColumn === 'outstanding' && merchantSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors" onclick={() => merchantHandleSort("orders")}>
                    Orders
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={merchantSortColumn === 'orders' && merchantSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={merchantSortColumn === 'orders' && merchantSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if merchantData.length === 0 && !merchantLoading}
                <tr>
                  <td colspan="6" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/users" size={32} class="text-muted-foreground" />
                      <p>No merchants found for this location</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each merchantData as item}
                  <tr class="hover:bg-muted/20 transition-colors cursor-pointer" onclick={() => handleMerchantView(item)}>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style="background-color: {avatarColor(item.first_name ?? 'M')}"
                        >
                          {initials(item.first_name, item.last_name)}
                        </div>
                        <div>
                          <span class="text-sm font-medium text-foreground">{item.first_name} {item.last_name}</span>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{item.phone_number ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(item.sales?.aggregate?.sum?.total_amount)}</td>
                    <td class="px-4 py-3 text-foreground">{fmtCurrency(item.total_outstanding?.aggregate?.sum?.outstanding_amount)}</td>
                    <td class="px-4 py-3 text-foreground">{item.total_orders?.aggregate?.count ?? 0}</td>
                    <td class="px-4 py-3">
                      <button
                        type="button"
                        class="p-1.5 hover:bg-muted rounded transition-colors"
                        onclick={(e) => { e.stopPropagation(); handleMerchantView(item); }}
                        aria-label="View"
                      >
                        <Icon iconName="icon/eye" size={16} class="text-muted-foreground" />
                      </button>
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
              bind:value={merchantRowsPerPage}
              onchange={() => { merchantCurrentPage = 1; }}
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
              disabled={merchantCurrentPage === 1}
              onclick={() => merchantCurrentPage = merchantCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(merchantCurrentPage, merchantTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === merchantCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === merchantCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => merchantCurrentPage = p}
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
              disabled={merchantCurrentPage === merchantTotalPages}
              onclick={() => merchantCurrentPage = merchantCurrentPage + 1}
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
                <th class="px-4 py-3 font-medium">Merchant</th>
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
                  <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">
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
                    <td class="px-4 py-3 text-foreground">
                      {movement.merchant ? `${movement.merchant.first_name ?? ""} ${movement.merchant.last_name ?? ""}` : "-"}
                    </td>
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
  {/if}

  <!-- Delete Location Modal -->
  <DeleteLocationModal
    bind:isOpen={isDeleteLocationModalOpen}
    locationName={formatLocationName(detailData?.branches_by_pk?.name)}
    onConfirm={() => {
      console.log("Removing location:", detailData?.branches_by_pk?.name);
      goto("/dashboard/location");
    }}
  />

  <!-- Edit Location Modal -->
  <AddLocationModal
    bind:isOpen={isEditLocationModalOpen}
    location={{
      name: formatLocationName(detailData?.branches_by_pk?.name) ?? "",
      address: detailData?.branches_by_pk?.address ?? "",
      description: "",
      status: true,
    }}
    onSubmit={(data: any) => {
      console.log("Updating location:", data);
    }}
  />

  <!-- Assign Stock to Location Modal -->
  <AssignStockToLocationModal
    bind:isOpen={isAssignStockToLocationModalOpen}
    targetLocation={formatLocationName(detailData?.branches_by_pk?.name)}
    onAssign={(data: any) => {
      console.log("Assigning stock to location:", data);
    }}
  />

  <!-- Transfer Stock Modal -->
  <TransferStockModal
    bind:isOpen={isTransferStockModalOpen}
    sourceLocation={formatLocationName(detailData?.branches_by_pk?.name)}
    onTransfer={(data: any) => {
      console.log("Transferring stock:", data);
    }}
  />

  <!-- Remove Stock Item Modal -->
  <RemoveStockItemModal
    bind:isOpen={isRemoveStockItemModalOpen}
    stockItemName={stockItemToRemove?.product?.name}
    onConfirm={() => {
      if (stockItemToRemove) {
        console.log("Removing stock item:", stockItemToRemove);
        stockItemToRemove = undefined;
      }
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
