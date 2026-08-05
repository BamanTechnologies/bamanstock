<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import IconKpiCard from "$lib/components/investor/reports/IconKpiCard.svelte";
  import StatKpiCard from "$lib/components/investor/reports/StatKpiCard.svelte";
  import ReportFilterBar from "$lib/components/investor/reports/ReportFilterBar.svelte";
  import { _ } from "svelte-i18n";
  import { getAuthClient } from "$graphql/client.ts";
  import SALES_REPORT_QUERY from "$graphql/queries/reports/sales/investor_sales_report.gql";
  import SALES_STAT_QUERY from "$graphql/queries/reports/sales/stat_reports.gql";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";
  import MERCHANT_QUERY from "$graphql/queries/selector/merchant.gql";
  import CATEGORY_QUERY from "$graphql/queries/selector/product_category.gql";
  import PRODUCT_QUERY from "$graphql/queries/selector/products.gql";
  import LOW_STOCK_QUERY from "$graphql/queries/reports/low_stock_products/low_stock_products.gql";
  import LOW_STOCK_STATS_QUERY from "$graphql/queries/reports/low_stock_products/stats.gql";

  const tabs = $derived([
    { key: "Sales",             label: $_('tabSales') },
    // { key: "Revenue & Profit",  label: $_('tabRevenueProfit') },
    { key: "Payments",          label: $_('tabPayments') },
    { key: "Stock Movement",    label: $_('tabStockMovement') },
    { key: "Low Stock",         label: $_('tabLowStock') },
  ]);

  let activeTab = $state($page.url.searchParams.get("tab") ?? "Sales");
  $effect(() => {
    const tab = $page.url.searchParams.get("tab");
    if (tab !== null) activeTab = tab;
  });

  function switchTab(key: string) {
    activeTab = key;
    goto(`?tab=${encodeURIComponent(key)}`, { replaceState: true, noScroll: true });
  }

  // Revenue & Profit tab data
  const revenueKpiCards = $derived([
    { label: $_('totalRevenue'), value: "$40,565,000", change: "25.5", changeType: "positive", changeLabel: $_('fromLastMonth') },
    { label: $_('growthProfit'), value: "$795,902.50", change: "12.2", changeType: "positive", changeLabel: $_('fromLastMonth') },
    { label: $_('growthMargin'), value: "4558", change: "16.3", changeType: "positive", changeLabel: $_('fromLastMonth') },
  ]);

  let chartTimeframe = $state("1Y");
  let revenueByCategoryPeriod = $state("this-week");
  const timeframeOptions = ["1D", "1W", "1M", "3M", "6M", "1Y"];

  const revenueChartData: Record<string, { labels: string[]; revenue: number[]; profit: number[]; yLabels: string[] }> = {
    "1D": { labels: ["6am","9am","12pm","3pm","6pm","9pm"], revenue: [10,28,48,38,55,25], profit: [4,11,20,15,22,10], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1W": { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], revenue: [32,45,38,58,50,62,40], profit: [12,18,15,24,20,25,16], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1M": { labels: ["Wk1","Wk2","Wk3","Wk4"], revenue: [42,58,48,70], profit: [16,23,19,28], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "3M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], revenue: [38,52,44,65,72,58], profit: [14,20,17,26,29,23], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "6M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], revenue: [28,42,55,72,85,62], profit: [10,16,22,29,34,25], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1Y": { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], revenue: [18,25,38,65,45,28,38,32,28,35,42,48], profit: [6,9,14,24,17,10,14,12,10,13,16,18], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
  };

  function toReportPath(values: number[], w = 860, h = 200, topPad = 18, botPad = 8) {
    const n = values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => ({
      x: Math.round((i / Math.max(n - 1, 1)) * w),
      y: Math.round(topPad + ((max - v) / range) * (h - topPad - botPad)),
    }));
    let line = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const cpx = (p.x + c.x) / 2;
      line += ` C${cpx},${p.y} ${cpx},${c.y} ${c.x},${c.y}`;
    }
    return { line, fill: `${line} L${pts[pts.length - 1].x},${h} L0,${h} Z`, pts };
  }

  const activeRevenueChart = $derived(revenueChartData[chartTimeframe] ?? revenueChartData["1Y"]);
  const hasRevenueData = $derived(activeRevenueChart.revenue.length > 0);
  const svgRevenue = $derived(hasRevenueData ? toReportPath(activeRevenueChart.revenue) : null);
  const svgProfit  = $derived(hasRevenueData ? toReportPath(activeRevenueChart.profit) : null);

  const CAT_CIRC = 351.9;
  const catColors = ["#3b82f6", "#ec4899", "#f59e0b", "#22c55e", "#a855f7"];
  const catBgColors = ["bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];

  const revenueByCategoryByPeriod: Record<string, { total: string; categories: Array<{ category: string; items: string; revenue: string; pct: number }> }> = {
    "this-week": {
      total: "$40.6M",
      categories: [
        { category: "Electronics",   items: "500+ items",   revenue: "$48,901.35 Revenue",    pct: 35 },
        { category: "Clothing",      items: "500+ items",   revenue: "$109,820.50 Revenue",   pct: 25 },
        { category: "Home Supplies", items: "190+ items",   revenue: "$548,900.12 Revenue",   pct: 22 },
        { category: "Beauty",        items: "350+ items",   revenue: "$36,700.50 Revenue",    pct: 10 },
        { category: "Groceries",     items: "1200+ items",  revenue: "$8,965 Revenue",        pct: 8  },
      ],
    },
    "this-month": {
      total: "$162M",
      categories: [
        { category: "Electronics",   items: "2000+ items",  revenue: "$195,605.40 Revenue",   pct: 30 },
        { category: "Clothing",      items: "1800+ items",  revenue: "$439,282.00 Revenue",   pct: 28 },
        { category: "Home Supplies", items: "750+ items",   revenue: "$2,195,600.48 Revenue", pct: 20 },
        { category: "Beauty",        items: "1400+ items",  revenue: "$146,802.00 Revenue",   pct: 14 },
        { category: "Groceries",     items: "4800+ items",  revenue: "$35,860.00 Revenue",    pct: 8  },
      ],
    },
    "this-year": {
      total: "$1.95B",
      categories: [
        { category: "Electronics",   items: "24000+ items", revenue: "$2,347,265 Revenue",    pct: 32 },
        { category: "Clothing",      items: "21600+ items", revenue: "$5,271,384 Revenue",    pct: 26 },
        { category: "Home Supplies", items: "9000+ items",  revenue: "$26,347,206 Revenue",   pct: 24 },
        { category: "Beauty",        items: "16800+ items", revenue: "$1,761,624 Revenue",    pct: 12 },
        { category: "Groceries",     items: "57600+ items", revenue: "$430,521 Revenue",      pct: 6  },
      ],
    },
  };

  const activeRevenueByCat = $derived(revenueByCategoryByPeriod[revenueByCategoryPeriod] ?? revenueByCategoryByPeriod["this-week"]);

  const revenueCatSegments = $derived.by(() => {
    let offset = 0;
    return activeRevenueByCat.categories.map((cat, i) => {
      const dash = (cat.pct / 100) * CAT_CIRC;
      const seg = { dash, offset: -offset, color: catColors[i] };
      offset += dash;
      return seg;
    });
  });

  let revenueDateRange = $state("01-Jan-2025 - 12-Dec-2025");

  // === Payments Tab: Queries and Stats ===
  import PAYMENTS_QUERY from "$graphql/queries/reports/payments/payments.gql";
  import PAYMENT_STATS_QUERY from "$graphql/queries/reports/payments/stats.gql";

  let paymentStatsData = $state<Record<string, any> | null>(null);
  let paymentStatsLoading = $state(true);

  async function loadPaymentStats() {
    paymentStatsLoading = true;
    try {
      const client = getAuthClient("investor");
      const result = await client.query({
        query: PAYMENT_STATS_QUERY,
      });
      paymentStatsData = result.data as Record<string, any>;
    } catch {
      paymentStatsData = null;
    } finally {
      paymentStatsLoading = false;
    }
  }

  $effect(() => {
    void activeTab;
    if (activeTab !== "Payments") return;
    loadPaymentStats();
  });

  const paymentsKpiCards = $derived.by(() => {
    if (!paymentStatsData) return [];
    const s = paymentStatsData;
    const totalAmount = parseMoney(s.total_payment?.aggregate?.sum?.amount);
    const totalPaid = parseMoney(s.total_payed?.aggregate?.sum?.amount);
    return [
      { label: $_('totalAmount'), value: fmtCurrency(totalAmount), icon: "icon/bar-chart" as any, iconBgClass: "bg-green-50 dark:bg-green-900/40", iconColor: "#16a34a" },
      { label: $_('totalPaid'), value: fmtCurrency(totalPaid), icon: "icon/credit-card" as any, iconBgClass: "bg-blue-50 dark:bg-blue-900/40", iconColor: "#3b82f6" },
      { label: $_('totalUnpaid'), value: fmtCurrency(totalAmount - totalPaid), icon: "icon/dollar-sign" as any, iconBgClass: "bg-orange-50 dark:bg-orange-900/40", iconColor: "#f97316" },
      { label: $_('overdue'), value: fmtCurrency(parseMoney(s.total_overdue?.aggregate?.sum?.outstanding_amount)), icon: "icon/alert-triangle" as any, iconBgClass: "bg-red-50 dark:bg-red-900/40", iconColor: "#ef4444" },
    ];
  });

  // === Payments Tab: Filters from URL ===
  let paymentsDateFrom = $state($page.url.searchParams.get("dateFrom") ?? "");
  let paymentsDateTo = $state($page.url.searchParams.get("dateTo") ?? "");
  let paymentsLocationId = $state($page.url.searchParams.get("location") ?? "");
  let paymentsMerchantId = $state($page.url.searchParams.get("merchant") ?? "");

  // === Payments Tab: Table ===
  let paymentsSearchQuery = $state($page.url.searchParams.get("search") ?? "");
  let paymentsCurrentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let paymentsRowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let paymentsSortColumn = $state($page.url.searchParams.get("sort") || "created_at");
  let paymentsSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let paymentsData = $state<any[]>([]);
  let paymentsTotalCount = $state(0);
  let paymentsLoading = $state(false);

  let paymentsDebouncedSearch = $state(paymentsSearchQuery);
  let paymentsDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(paymentsDebounceTimer);
    if (paymentsSearchQuery === paymentsDebouncedSearch) return;
    paymentsDebounceTimer = setTimeout(() => {
      paymentsDebouncedSearch = paymentsSearchQuery;
      paymentsCurrentPage = 1;
    }, 400);
    return () => clearTimeout(paymentsDebounceTimer);
  });

  const paymentsTotalPages = $derived(Math.max(1, Math.ceil(paymentsTotalCount / paymentsRowsPerPage)));

  function paymentsBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (paymentsDateFrom) {
      conditions.push({ created_at: { _gte: paymentsDateFrom } });
    }
    if (paymentsDateTo) {
      conditions.push({ created_at: { _lte: paymentsDateTo } });
    }
    if (paymentsLocationId) {
      conditions.push({ order: { merchant: { branch: { _eq: paymentsLocationId } } } });
    }
    if (paymentsMerchantId) {
      conditions.push({ order: { merchant: { id: { _eq: paymentsMerchantId } } } });
    }
    if (paymentsDebouncedSearch) {
      conditions.push({
        _or: [
          { order: { merchant: { first_name: { _ilike: `%${paymentsDebouncedSearch}%` } } } },
          { order: { merchant: { last_name: { _ilike: `%${paymentsDebouncedSearch}%` } } } },
          { order: { customer: { first_name: { _ilike: `%${paymentsDebouncedSearch}%` } } } },
          { order: { customer: { last_name: { _ilike: `%${paymentsDebouncedSearch}%` } } } },
          { order: { stock: { product: { name: { _ilike: `%${paymentsDebouncedSearch}%` } } } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function paymentsBuildOrder(): Record<string, unknown>[] {
    switch (paymentsSortColumn) {
      case "merchant":
        return [{ order: { merchant: { first_name: paymentsSortDirection } } }];
      case "customer":
        return [{ order: { customer: { first_name: paymentsSortDirection } } }];
      case "product":
        return [{ order: { stock: { product: { name: paymentsSortDirection } } } }];
      case "amount":
        return [{ amount: paymentsSortDirection }];
      case "status":
        return [{ order: { status: paymentsSortDirection } }];
      case "created_at":
        return [{ created_at: paymentsSortDirection }];
      default:
        return [{ created_at: paymentsSortDirection }];
    }
  }

  function paymentsSyncUrl() {
    const params = new URLSearchParams();
    params.set("tab", "Payments");
    if (paymentsDebouncedSearch) params.set("search", paymentsDebouncedSearch);
    if (paymentsCurrentPage > 1) params.set("page", String(paymentsCurrentPage));
    if (paymentsRowsPerPage !== 10) params.set("limit", String(paymentsRowsPerPage));
    if (paymentsSortColumn !== "created_at") params.set("sort", paymentsSortColumn);
    if (paymentsSortDirection !== "desc") params.set("dir", paymentsSortDirection);
    if (paymentsDateFrom) params.set("dateFrom", paymentsDateFrom);
    if (paymentsDateTo) params.set("dateTo", paymentsDateTo);
    if (paymentsLocationId) params.set("location", paymentsLocationId);
    if (paymentsMerchantId) params.set("merchant", paymentsMerchantId);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void activeTab;
    void paymentsDebouncedSearch;
    void paymentsCurrentPage;
    void paymentsRowsPerPage;
    void paymentsSortColumn;
    void paymentsSortDirection;
    void paymentsDateFrom;
    void paymentsDateTo;
    void paymentsLocationId;
    void paymentsMerchantId;

    if (activeTab !== "Payments") return;
    paymentsLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          payment: any[];
          payment_aggregate: { aggregate: { count: number } };
        }>({
          query: PAYMENTS_QUERY,
          variables: {
            limit: paymentsRowsPerPage,
            offset: (paymentsCurrentPage - 1) * paymentsRowsPerPage,
            filter: paymentsBuildFilter(),
            order: paymentsBuildOrder(),
          },
        });
        paymentsData = result.data?.payment ?? [];
        paymentsTotalCount = result.data?.payment_aggregate?.aggregate?.count ?? 0;
        paymentsSyncUrl();
      } catch {
        paymentsData = [];
        paymentsTotalCount = 0;
      } finally {
        paymentsLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function paymentsMerchantLabel(item: any): string {
    if (!item?.order?.merchant) return "-";
    return [item.order.merchant.first_name, item.order.merchant.last_name].filter(Boolean).join(" ");
  }

  function paymentsCustomerLabel(item: any): string {
    if (!item?.order?.customer) return "-";
    return [item.order.customer.first_name, item.order.customer.last_name].filter(Boolean).join(" ");
  }

  function paymentsHandleSort(column: string) {
    if (paymentsSortColumn === column) {
      paymentsSortDirection = paymentsSortDirection === "asc" ? "desc" : "asc";
    } else {
      paymentsSortColumn = column;
      paymentsSortDirection = "asc";
    }
    paymentsCurrentPage = 1;
  }

  // === Stock Movement Tab: Queries and Stats ===
  import STOCK_MOVEMENT_QUERY from "$graphql/queries/reports/stock_movement/stock_movement.gql";
  import STOCK_MOVEMENT_STATS_QUERY from "$graphql/queries/reports/stock_movement/stats.gql";

  let stockMovementStatsData = $state<Record<string, any> | null>(null);
  let stockMovementStatsLoading = $state(true);

  async function loadStockMovementStats() {
    stockMovementStatsLoading = true;
    try {
      const client = getAuthClient("investor");
      const result = await client.query({
        query: STOCK_MOVEMENT_STATS_QUERY,
      });
      stockMovementStatsData = result.data as Record<string, any>;
    } catch {
      stockMovementStatsData = null;
    } finally {
      stockMovementStatsLoading = false;
    }
  }

  $effect(() => {
    void activeTab;
    if (activeTab !== "Stock Movement") return;
    loadStockMovementStats();
  });

  const stockMovementKpiCards = $derived.by(() => {
    if (!stockMovementStatsData) return [];
    const s = stockMovementStatsData;
    const totalIn = Math.abs(Number(s.total_stocks_in?.aggregate?.sum?.quantity_delta) || 0);
    const totalOut = Math.abs(Number(s.total_stocks_out?.aggregate?.sum?.quantity_delta) || 0);
    const totalTransfers = Number(s.number_of_transfers?.aggregate?.count) || 0;
    return [
      { label: $_('totalStockIn'),  value: `${totalIn} Units`, icon: "icon/package",     iconBgClass: "bg-green-100 dark:bg-green-900/40", iconColor: "#16a34a" },
      { label: $_('totalStockOut'), value: `${totalOut} Units`, icon: "icon/shopping-bag", iconBgClass: "bg-blue-100 dark:bg-blue-900/40",  iconColor: "#3b82f6" },
      { label: $_('numTransfers'),  value: `${totalTransfers}`, icon: "icon/refresh-cw",  iconBgClass: "bg-pink-100 dark:bg-pink-900/40", iconColor: "#ec4899" },
    ];
  });

  // === Stock Movement Tab: Filters from URL ===
  let stockDateFrom = $state($page.url.searchParams.get("dateFrom") ?? "");
  let stockDateTo = $state($page.url.searchParams.get("dateTo") ?? "");
  let stockLocationId = $state($page.url.searchParams.get("location") ?? "");
  let stockMerchantId = $state($page.url.searchParams.get("merchant") ?? "");
  let stockMovementType = $state($page.url.searchParams.get("type") ?? "");

  // === Stock Movement Tab: Table ===
  let stockSearchQuery = $state($page.url.searchParams.get("search") ?? "");
  let stockCurrentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let stockRowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let stockSortColumn = $state($page.url.searchParams.get("sort") || "created_at");
  let stockSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let stockMovementsData = $state<any[]>([]);
  let stockMovementsTotalCount = $state(0);
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

  const stockTotalPages = $derived(Math.max(1, Math.ceil(stockMovementsTotalCount / stockRowsPerPage)));

  const movementTypeOptions = $derived([
    { value: "", label: $_('filterAll') },
    { value: "PURCHASE", label: "Purchase" },
    { value: "SALE", label: "Sale" },
    { value: "TRANSFER_IN", label: "Transfer In" },
    { value: "TRANSFER_OUT", label: "Transfer Out" },
  ]);

  function stockBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (stockDateFrom) {
      conditions.push({ created_at: { _gte: stockDateFrom } });
    }
    if (stockDateTo) {
      conditions.push({ created_at: { _lte: stockDateTo } });
    }
    if (stockLocationId) {
      conditions.push({ branch: { id: { _eq: stockLocationId } } });
    }
    if (stockMerchantId) {
      conditions.push({ merchant: { id: { _eq: stockMerchantId } } });
    }
    if (stockMovementType) {
      conditions.push({ movement_type: { _eq: stockMovementType } });
    }
    if (stockDebouncedSearch) {
      conditions.push({
        _or: [
          { stock: { product: { name: { _ilike: `%${stockDebouncedSearch}%` } } } },
          { stock: { batch_number: { _ilike: `%${stockDebouncedSearch}%` } } },
          { reference_type: { _ilike: `%${stockDebouncedSearch}%` } },
          { merchant: { first_name: { _ilike: `%${stockDebouncedSearch}%` } } },
          { merchant: { last_name: { _ilike: `%${stockDebouncedSearch}%` } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function stockBuildOrder(): Record<string, unknown>[] {
    switch (stockSortColumn) {
      case "movement_type":
        return [{ movement_type: stockSortDirection }];
      case "product":
        return [{ stock: { product: { name: stockSortDirection } } }];
      case "branch":
        return [{ branch: { name: stockSortDirection } }];
      case "merchant":
        return [{ merchant: { first_name: stockSortDirection } }];
      case "quantity":
        return [{ quantity_delta: stockSortDirection }];
      case "created_at":
        return [{ created_at: stockSortDirection }];
      default:
        return [{ created_at: stockSortDirection }];
    }
  }

  function stockSyncUrl() {
    const params = new URLSearchParams();
    params.set("tab", "Stock Movement");
    if (stockDebouncedSearch) params.set("search", stockDebouncedSearch);
    if (stockCurrentPage > 1) params.set("page", String(stockCurrentPage));
    if (stockRowsPerPage !== 10) params.set("limit", String(stockRowsPerPage));
    if (stockSortColumn !== "created_at") params.set("sort", stockSortColumn);
    if (stockSortDirection !== "desc") params.set("dir", stockSortDirection);
    if (stockDateFrom) params.set("dateFrom", stockDateFrom);
    if (stockDateTo) params.set("dateTo", stockDateTo);
    if (stockLocationId) params.set("location", stockLocationId);
    if (stockMerchantId) params.set("merchant", stockMerchantId);
    if (stockMovementType) params.set("type", stockMovementType);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void activeTab;
    void stockDebouncedSearch;
    void stockCurrentPage;
    void stockRowsPerPage;
    void stockSortColumn;
    void stockSortDirection;
    void stockDateFrom;
    void stockDateTo;
    void stockLocationId;
    void stockMerchantId;
    void stockMovementType;

    if (activeTab !== "Stock Movement") return;
    stockLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          stock_movements: any[];
          stock_movements_aggregate: { aggregate: { count: number } };
        }>({
          query: STOCK_MOVEMENT_QUERY,
          variables: {
            limit: stockRowsPerPage,
            offset: (stockCurrentPage - 1) * stockRowsPerPage,
            filter: stockBuildFilter(),
            order: stockBuildOrder(),
          },
        });
        stockMovementsData = result.data?.stock_movements ?? [];
        stockMovementsTotalCount = result.data?.stock_movements_aggregate?.aggregate?.count ?? 0;
        stockSyncUrl();
      } catch {
        stockMovementsData = [];
        stockMovementsTotalCount = 0;
      } finally {
        stockLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function stockMerchantLabel(item: any): string {
    if (!item?.merchant) return "-";
    return [item.merchant.first_name, item.merchant.last_name].filter(Boolean).join(" ");
  }

  function stockHandleSort(column: string) {
    if (stockSortColumn === column) {
      stockSortDirection = stockSortDirection === "asc" ? "desc" : "asc";
    } else {
      stockSortColumn = column;
      stockSortDirection = "asc";
    }
    stockCurrentPage = 1;
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

  // === Low Stock Tab: Queries and Stats ===
  let lowStockStatsData = $state<Record<string, any> | null>(null);
  let lowStockStatsLoading = $state(true);

  async function loadLowStockStats() {
    lowStockStatsLoading = true;
    try {
      const client = getAuthClient("investor");
      const result = await client.query({
        query: LOW_STOCK_STATS_QUERY,
      });
      lowStockStatsData = result.data as Record<string, any>;
    } catch {
      lowStockStatsData = null;
    } finally {
      lowStockStatsLoading = false;
    }
  }

  function fmtCurrencyShort(val: unknown): string {
    if (val == null) return "ETB 0";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    if (num >= 1_000_000) return `ETB ${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `ETB ${(num / 1_000).toFixed(1)}K`;
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  const lowStockKpiCards = $derived.by(() => {
    if (!lowStockStatsData) return [];
    const s = lowStockStatsData;
    const totalLow = Number(s.low_stock_products?.aggregate?.count) || 0;
    const critical = Number(s.critical_low_stock_products?.aggregate?.count) || 0;
    const valueAtRisk = parseMoney(s.low_stock_properties_prices?.aggregate?.sum?.purchased_price);
    return [
      { label: $_('totalLowStockItems'), value: String(totalLow),             icon: "icon/alert-triangle" as any, iconBgClass: "bg-orange-100 dark:bg-orange-900/40", iconColor: "#D7AD4A" },
      { label: $_('criticalStockItems'), value: String(critical),             icon: "icon/shopping-bag"      as any, iconBgClass: "bg-blue-100 dark:bg-blue-900/40",  iconColor: "#3b82f6" },
      { label: $_('valueAtRisk'),       value: fmtCurrencyShort(valueAtRisk), icon: "icon/eye"               as any, iconBgClass: "bg-pink-100 dark:bg-pink-900/40",  iconColor: "#ec4899" },
    ];
  });

  $effect(() => {
    void activeTab;
    if (activeTab !== "Low Stock") return;
    loadLowStockStats();
  });

  // === Low Stock Tab: Filters from URL ===
  let lowStockLocationId = $state($page.url.searchParams.get("location") ?? "");
  let lowStockMerchantId = $state($page.url.searchParams.get("merchant") ?? "");
  let lowStockCategoryId = $state($page.url.searchParams.get("category") ?? "");
  let lowStockProductId = $state($page.url.searchParams.get("product") ?? "");

  // === Low Stock Tab: Table ===
  let lowStockSearchQuery = $state($page.url.searchParams.get("search") ?? "");
  let lowStockCurrentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let lowStockRowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let lowStockSortColumn = $state($page.url.searchParams.get("sort") || "created_at");
  let lowStockSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let lowStockData = $state<any[]>([]);
  let lowStockTotalCount = $state(0);
  let lowStockLoading = $state(false);

  let lowStockDebouncedSearch = $state(lowStockSearchQuery);
  let lowStockDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(lowStockDebounceTimer);
    if (lowStockSearchQuery === lowStockDebouncedSearch) return;
    lowStockDebounceTimer = setTimeout(() => {
      lowStockDebouncedSearch = lowStockSearchQuery;
      lowStockCurrentPage = 1;
    }, 400);
    return () => clearTimeout(lowStockDebounceTimer);
  });

  const lowStockTotalPages = $derived(Math.max(1, Math.ceil(lowStockTotalCount / lowStockRowsPerPage)));

  function lowStockBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (lowStockLocationId) {
      conditions.push({ company: { branches: { id: { _eq: lowStockLocationId } } } });
    }
    if (lowStockMerchantId) {
      conditions.push({ created_by: { _eq: lowStockMerchantId } });
    }
    if (lowStockCategoryId) {
      conditions.push({ product_type_id: { _eq: lowStockCategoryId } });
    }
    if (lowStockProductId) {
      conditions.push({ id: { _eq: lowStockProductId } });
    }
    if (lowStockDebouncedSearch) {
      conditions.push({
        _or: [
          { name: { _ilike: `%${lowStockDebouncedSearch}%` } },
          { merchantByCreatedBy: { first_name: { _ilike: `%${lowStockDebouncedSearch}%` } } },
          { merchantByCreatedBy: { last_name: { _ilike: `%${lowStockDebouncedSearch}%` } } },
          { company: { name: { _ilike: `%${lowStockDebouncedSearch}%` } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function lowStockBuildOrder(): Record<string, unknown>[] {
    switch (lowStockSortColumn) {
      case "name":
        return [{ name: lowStockSortDirection }];
      case "type":
        return [{ product_type: { name: lowStockSortDirection } }];
      case "company":
        return [{ company: { name: lowStockSortDirection } }];
      case "merchant":
        return [{ merchantByCreatedBy: { first_name: lowStockSortDirection } }];
      case "quantity":
        return [{ current_available_stock: lowStockSortDirection }];
      case "threshold":
        return [{ treshold_quantity: lowStockSortDirection }];
      case "unit":
        return [{ default_unit: lowStockSortDirection }];
      case "created_at":
        return [{ created_at: lowStockSortDirection }];
      default:
        return [{ created_at: lowStockSortDirection }];
    }
  }

  function lowStockSyncUrl() {
    const params = new URLSearchParams();
    params.set("tab", "Low Stock");
    if (lowStockDebouncedSearch) params.set("search", lowStockDebouncedSearch);
    if (lowStockCurrentPage > 1) params.set("page", String(lowStockCurrentPage));
    if (lowStockRowsPerPage !== 10) params.set("limit", String(lowStockRowsPerPage));
    if (lowStockSortColumn !== "created_at") params.set("sort", lowStockSortColumn);
    if (lowStockSortDirection !== "desc") params.set("dir", lowStockSortDirection);
    if (lowStockLocationId) params.set("location", lowStockLocationId);
    if (lowStockMerchantId) params.set("merchant", lowStockMerchantId);
    if (lowStockCategoryId) params.set("category", lowStockCategoryId);
    if (lowStockProductId) params.set("product", lowStockProductId);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void activeTab;
    void lowStockDebouncedSearch;
    void lowStockCurrentPage;
    void lowStockRowsPerPage;
    void lowStockSortColumn;
    void lowStockSortDirection;
    void lowStockLocationId;
    void lowStockMerchantId;
    void lowStockCategoryId;
    void lowStockProductId;

    if (activeTab !== "Low Stock") return;
    lowStockLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          products: any[];
          products_aggregate: { aggregate: { count: number } };
        }>({
          query: LOW_STOCK_QUERY,
          variables: {
            limit: lowStockRowsPerPage,
            offset: (lowStockCurrentPage - 1) * lowStockRowsPerPage,
            filter: lowStockBuildFilter(),
            order: lowStockBuildOrder(),
          },
        });
        lowStockData = result.data?.products ?? [];
        lowStockTotalCount = result.data?.products_aggregate?.aggregate?.count ?? 0;
        lowStockSyncUrl();
      } catch {
        lowStockData = [];
        lowStockTotalCount = 0;
      } finally {
        lowStockLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function lowStockMerchantLabel(item: any): string {
    if (!item?.merchantByCreatedBy) return "-";
    return [item.merchantByCreatedBy.first_name, item.merchantByCreatedBy.last_name].filter(Boolean).join(" ");
  }

  function lowStockHandleSort(column: string) {
    if (lowStockSortColumn === column) {
      lowStockSortDirection = lowStockSortDirection === "asc" ? "desc" : "asc";
    } else {
      lowStockSortColumn = column;
      lowStockSortDirection = "asc";
    }
    lowStockCurrentPage = 1;
  }

  function lowStockTypeClass(stock: number, threshold: number): string {
    if (stock <= 0) return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
    if (stock <= threshold * 0.5) return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
    return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300";
  }

  // Revenue Breakdown table data
  let revenueBreakdownData = $state([
    {
      id: 1,
      category: "Electronics",
      totalRevenue: "$3000",
      percentOfTotal: "12%",
      numberOfProducts: 100,
      highestSellingProduct: "Lenovo IdeaPad 3",
      icon: "icon/laptop",
    },
    {
      id: 2,
      category: "Clothing",
      totalRevenue: "$1600",
      percentOfTotal: "12%",
      numberOfProducts: 140,
      highestSellingProduct: "Nike Jordan",
      icon: "icon/shoe",
    },
    {
      id: 3,
      category: "Home Supplies",
      totalRevenue: "$880",
      percentOfTotal: "12%",
      numberOfProducts: 300,
      highestSellingProduct: "Sanford Chair Sofa",
      icon: "icon/chair",
    },
    {
      id: 4,
      category: "Beauty",
      totalRevenue: "$1200",
      percentOfTotal: "12%",
      numberOfProducts: 450,
      highestSellingProduct: "Red Premium Satchel",
      icon: "icon/briefcase",
    },
    {
      id: 5,
      category: "Furniture",
      totalRevenue: "$400",
      percentOfTotal: "12%",
      numberOfProducts: 320,
      highestSellingProduct: "Sanford Chair Sofa",
      icon: "icon/chair",
    },
    ...Array(5).fill({
      id: 6,
      category: "Electronics",
      totalRevenue: "$3000",
      percentOfTotal: "12%",
      numberOfProducts: 100,
      highestSellingProduct: "Lenovo IdeaPad 3",
      icon: "icon/laptop",
    }),
  ]);

  let revenueBreakdownPage = $state(1);
  let revenueBreakdownRowsPerPage = $state(10);
  let revenueCategoryFilter = $state("");

  const filteredRevenueBreakdownData = $derived(
    revenueBreakdownData.filter((row) =>
      !revenueCategoryFilter || row.category.toLowerCase() === revenueCategoryFilter
    )
  );

  const revenueBreakdownTotalPages = $derived(
    Math.ceil(filteredRevenueBreakdownData.length / revenueBreakdownRowsPerPage),
  );

  $effect(() => { revenueCategoryFilter; revenueBreakdownPage = 1; });

  // Revenue Breakdown table columns
  const revenueBreakdownColumns = $derived([
    { key: "category",              label: $_('category'),              sortable: true },
    { key: "totalRevenue",          label: $_('totalRevenue'),          sortable: true },
    { key: "percentOfTotal",        label: $_('percentOfTotal'),        sortable: true },
    { key: "numberOfProducts",      label: $_('numberOfProducts'),      sortable: true },
    {
      key: "highestSellingProduct",
      label: $_('highestSellingProduct'),
      sortable: true,
      render: (row: (typeof revenueBreakdownData)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.highestSellingProduct}</span>
          </div>
        `;
      },
    },
  ]);

  function handleRevenueBreakdownPageChange(page: number) {
    revenueBreakdownPage = page;
  }

  function handleRevenueBreakdownRowsPerPageChange(rows: number) {
    revenueBreakdownRowsPerPage = rows;
    revenueBreakdownPage = 1;
  }

  // === Sales Tab: Filters from URL ===
  let salesLocationId = $state($page.url.searchParams.get("location") ?? "");
  let salesMerchantId = $state($page.url.searchParams.get("merchant") ?? "");
  let salesCategoryId = $state($page.url.searchParams.get("category") ?? "");
  let salesProductId = $state($page.url.searchParams.get("product") ?? "");

  // === Sales Tab: Stats ===
  let statsData = $state<Record<string, any> | null>(null);
  let statsLoading = $state(true);

  function getPastMonthEndISO(): string {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth(), 1);
    d.setDate(d.getDate() - 1);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  async function loadStats() {
    statsLoading = true;
    try {
      const client = getAuthClient("investor");
      const result = await client.query({
        query: SALES_STAT_QUERY,
        variables: { pastMonthEndDate: getPastMonthEndISO() },
      });
      statsData = result.data as Record<string, any>;
    } catch {
      statsData = null;
    } finally {
      statsLoading = false;
    }
  }

  $effect(() => {
    void activeTab;
    if (activeTab !== "Sales") return;
    loadStats();
  });

  function fmtCurrency(val: unknown): string {
    if (val == null) return "ETB 0";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function parseMoney(val: unknown): number {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.\-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  function pctChange(current: unknown, previous: unknown): { change: string; type: "positive" | "negative" } {
    const curr = Number(current) || 0;
    const prev = Number(previous) || 0;
    if (prev === 0) return { change: "0", type: "positive" };
    const pct = ((curr - prev) / prev) * 100;
    return {
      change: Math.abs(pct).toFixed(1),
      type: pct >= 0 ? "positive" : "negative",
    };
  }

  const salesKpiCards = $derived.by(() => {
    if (!statsData) return [];
    const s = statsData;
    const salesChange = pctChange(
      s.total_sales?.aggregate?.sum?.amount,
      s.previous_month_sales?.aggregate?.sum?.amount,
    );
    const ordersChange = pctChange(
      s.total_orders?.aggregate?.count,
      s.previous_month_orders?.aggregate?.count,
    );
    const txChange = pctChange(
      s.total_transactions?.aggregate?.count,
      s.previous_month_transactions?.aggregate?.count,
    );
    const unitsChange = pctChange(
      s.total_units_sold?.aggregate?.sum?.order_quantity,
      s.previous_month_units?.aggregate?.sum?.order_quantity,
    );
    return [
      { label: $_('totalSales'),       value: fmtCurrency(s.total_sales?.aggregate?.sum?.amount),       change: salesChange.change, changeType: salesChange.type, changeLabel: $_('fromLastMonth') },
      { label: $_('totalOrders'),      value: String(s.total_orders?.aggregate?.count ?? 0),             change: ordersChange.change, changeType: ordersChange.type, changeLabel: $_('fromLastMonth') },
      { label: $_('totalTransaction'), value: String(s.total_transactions?.aggregate?.count ?? 0),       change: txChange.change,     changeType: txChange.type,     changeLabel: $_('fromLastMonth') },
      { label: $_('unitsSold'),        value: String(s.total_units_sold?.aggregate?.sum?.order_quantity ?? 0), change: unitsChange.change, changeType: unitsChange.type, changeLabel: $_('fromLastMonth') },
    ];
  });

  // === Sales Tab: Table ===
  let salesSearchQuery = $state($page.url.searchParams.get("search") ?? "");
  let salesCurrentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let salesRowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let salesSortColumn = $state($page.url.searchParams.get("sort") || "created_at");
  let salesSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let salesOrders = $state<any[]>([]);
  let salesTotalCount = $state(0);
  let salesLoading = $state(false);

  let salesDebouncedSearch = $state(salesSearchQuery);
  let salesDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(salesDebounceTimer);
    if (salesSearchQuery === salesDebouncedSearch) return;
    salesDebounceTimer = setTimeout(() => {
      salesDebouncedSearch = salesSearchQuery;
      salesCurrentPage = 1;
    }, 400);
    return () => clearTimeout(salesDebounceTimer);
  });

  const salesTotalPages = $derived(Math.max(1, Math.ceil(salesTotalCount / salesRowsPerPage)));

  function salesBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (salesLocationId) {
      conditions.push({ merchant: { branchByBranch: { id: { _eq: salesLocationId } } } });
    }
    if (salesMerchantId) {
      conditions.push({ merchant:{id: { _eq: salesMerchantId }} });
    }
    if (salesCategoryId) {
      conditions.push({ order_items: { product: { product_type_id: { _eq: salesCategoryId } } } });
    }
    if (salesProductId) {
      conditions.push({ order_items: { product_id: { _eq: salesProductId } } });
    }
    if (salesDebouncedSearch) {
      conditions.push({
        _or: [
          { customer_name: { _ilike: `%${salesDebouncedSearch}%` } },
          { merchant: { first_name: { _ilike: `%${salesDebouncedSearch}%` } } },
          { merchant: { last_name: { _ilike: `%${salesDebouncedSearch}%` } } },
          { merchant: { branchByBranch: { name: { _ilike: `%${salesDebouncedSearch}%` } } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function salesBuildOrder(): Record<string, unknown>[] {
    switch (salesSortColumn) {
      case "customer":
        return [{ customer_name: salesSortDirection }];
      case "merchant":
        return [{ merchant: { first_name: salesSortDirection } }];
      case "location":
        return [{ merchant: { branchByBranch: { name: salesSortDirection } } }];
      case "amount":
        return [{ total_amount: salesSortDirection }];
      case "quantity":
        return [{ order_quantity: salesSortDirection }];
      case "status":
        return [{ status: salesSortDirection }];
      case "created_at":
        return [{ created_at: salesSortDirection }];
      default:
        return [{ created_at: salesSortDirection }];
    }
  }

  function salesSyncUrl() {
    const params = new URLSearchParams();
    if (activeTab !== "Sales") params.set("tab", activeTab);
    if (salesDebouncedSearch) params.set("search", salesDebouncedSearch);
    if (salesCurrentPage > 1) params.set("page", String(salesCurrentPage));
    if (salesRowsPerPage !== 10) params.set("limit", String(salesRowsPerPage));
    if (salesSortColumn !== "created_at") params.set("sort", salesSortColumn);
    if (salesSortDirection !== "desc") params.set("dir", salesSortDirection);
    if (salesLocationId) params.set("location", salesLocationId);
    if (salesMerchantId) params.set("merchant", salesMerchantId);
    if (salesCategoryId) params.set("category", salesCategoryId);
    if (salesProductId) params.set("product", salesProductId);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void activeTab;
    void salesDebouncedSearch;
    void salesCurrentPage;
    void salesRowsPerPage;
    void salesSortColumn;
    void salesSortDirection;
    void salesLocationId;
    void salesMerchantId;
    void salesCategoryId;
    void salesProductId;

    if (activeTab !== "Sales") return;
    salesLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          orders: any[];
          total: { aggregate: { count: number } };
        }>({
          query: SALES_REPORT_QUERY,
          variables: {
            limit: salesRowsPerPage,
            offset: (salesCurrentPage - 1) * salesRowsPerPage,
            filter: salesBuildFilter(),
            order: salesBuildOrder(),
          },
        });
        salesOrders = result.data?.orders ?? [];
        salesTotalCount = result.data?.total?.aggregate?.count ?? 0;
        salesSyncUrl();
      } catch {
        salesOrders = [];
        salesTotalCount = 0;
      } finally {
        salesLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function salesMerchantLabel(item: any): string {
    if (!item) return "";
    return [item.first_name, item.last_name].filter(Boolean).join(" ");
  }

  function salesHandleSort(column: string) {
    if (salesSortColumn === column) {
      salesSortDirection = salesSortDirection === "asc" ? "desc" : "asc";
    } else {
      salesSortColumn = column;
      salesSortDirection = "asc";
    }
    salesCurrentPage = 1;
  }

  function handleExportPDF() {
    console.log("Exporting to PDF");
  }

  function handleExportXLS() {
    console.log("Exporting to XLS");
  }

  function handlePrint() {
    window.print();
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

<div class="flex-1 p-3 sm:p-6 space-y-3 sm:space-y-6">
  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
      {#each tabs as tab}
        <button
          onclick={() => switchTab(tab.key)}
          class="pb-2 sm:pb-4 text-xs sm:text-base px-1 border-b-2 transition-colors {activeTab === tab.key
            ? 'border-info text-info font-medium'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          {tab.label}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab Content -->
    {#if activeTab === "Sales"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#if statsLoading}
          {#each [1,2,3,4] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3"></div>
              <div class="h-8 bg-muted rounded w-32 mb-3"></div>
              <div class="h-5 bg-muted rounded w-36"></div>
            </div>
          {/each}
        {:else}
          {#each salesKpiCards as kpi}
            <StatKpiCard label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} />
          {/each}
        {/if}
      </div>

      <!-- Filters Section -->
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('navLocation')}</label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchLocation')}
              initialValue={salesLocationId}
              onSelect={(item) => { salesLocationId = item?.id ?? ""; salesCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('merchant')}</label>
            <SearchSelect
              query={MERCHANT_QUERY}
              dataKey="merchant"
              filterBuilder={(s) => ({
                _or: [
                  { first_name: { _ilike: `%${s}%` } },
                  { last_name: { _ilike: `%${s}%` } },
                ]
              })}
              displayLabel={(item) => [item.first_name, item.last_name].filter(Boolean).join(" ")}
              placeholder={$_('searchMerchant')}
              initialValue={salesMerchantId}
              onSelect={(item) => { salesMerchantId = item?.id ?? ""; salesCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('category')}</label>
            <SearchSelect
              query={CATEGORY_QUERY}
              dataKey="product_types"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchCategory')}
              initialValue={salesCategoryId}
              onSelect={(item) => { salesCategoryId = item?.id ?? ""; salesCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('products')}</label>
            <SearchSelect
              query={PRODUCT_QUERY}
              dataKey="products"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchProduct')}
              initialValue={salesProductId}
              onSelect={(item) => { salesProductId = item?.id ?? ""; salesCurrentPage = 1; }}
            />
          </div>
        </div>
      </div>

      <!-- Sales Report Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">{$_('salesReport')}</h3>
          <div class="flex items-center gap-2">
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="PDF" onclick={handleExportPDF}>
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="XLS" onclick={handleExportXLS}>
              <Icon iconName="icon/file-text" size={20} class="text-green-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="Print" onclick={handlePrint}>
              <Icon iconName="icon/file-text" size={20} class="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={$_('search')}
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={salesSearchQuery}
            />
          </div>
        </div>

        {#if salesLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("customer")}>
                    {$_('customer')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'customer' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'customer' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("merchant")}>
                    {$_('merchant')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'merchant' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'merchant' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("location")}>
                    {$_('navLocation')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'location' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'location' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("amount")}>
                    {$_('salesValue')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'amount' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'amount' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("quantity")}>
                    {$_('soldQty')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'quantity' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'quantity' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("status")}>
                    {$_('filterStatus')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'status' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'status' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => salesHandleSort("created_at")}>
                    {$_('date')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={salesSortColumn === 'created_at' && salesSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={salesSortColumn === 'created_at' && salesSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if salesOrders.length === 0 && !salesLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>{$_('noSalesFound')}</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each salesOrders as order}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-foreground">{order.customer_name || (order.order_items?.[0]?.product?.name ?? "-")}</span>
                        {#if order.customer_name && order.order_items?.[0]?.product?.name}
                          <span class="text-xs text-muted-foreground">{order.order_items[0].product.name}</span>
                        {/if}
                      </div>
                    </td>
                    <td class="px-4 py-3 text-foreground">{salesMerchantLabel(order.merchant)}</td>
                    <td class="px-4 py-3 text-foreground">{order.merchant?.branch?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(order.total_amount)}</td>
                    <td class="px-4 py-3 text-foreground">{order.order_quantity ?? 0}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium {order.status === 'completed' || order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'}">
                        <span class="w-1.5 h-1.5 rounded-full {order.status === 'completed' || order.status === 'delivered' ? 'bg-green-600' : order.status === 'cancelled' ? 'bg-red-600' : 'bg-yellow-600'}"></span>
                        {order.status}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex flex-col gap-2 sm:flex-row items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={salesRowsPerPage}
              onchange={() => { salesCurrentPage = 1; }}
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
              disabled={salesCurrentPage === 1}
              onclick={() => salesCurrentPage = salesCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(salesCurrentPage, salesTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === salesCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === salesCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => salesCurrentPage = p}
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
              disabled={salesCurrentPage === salesTotalPages}
              onclick={() => salesCurrentPage = salesCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#if activeTab === "Revenue & Profit"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each revenueKpiCards as kpi}
          <StatKpiCard label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} />
        {/each}
      </div>

      <!-- Chart and Revenue by Category Section -->
      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <!-- Revenue vs Profit Over Time Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">
              {$_('revenueVsProfit')}
            </h3>
            <!-- Timeframe Selector -->
            <div class="flex gap-2">
              {#each timeframeOptions as timeframe}
                <button
                  type="button"
                  onclick={() => (chartTimeframe = timeframe)}
                  class="px-3 py-1.5 text-sm rounded transition-colors {chartTimeframe ===
                  timeframe
                    ? 'bg-info text-info-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
                >
                  {timeframe}
                </button>
              {/each}
            </div>
          </div>

          <!-- Chart Legend -->
          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-sm text-foreground">{$_('revenue')}</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-pink-500"></div>
              <span class="text-sm text-foreground">{$_('profit')}</span>
            </div>
          </div>

          <!-- Revenue vs Profit SVG Chart -->
          {#if hasRevenueData}
            <div class="flex gap-3">
              <!-- Y-axis labels -->
              <div class="flex flex-col justify-between text-[10px] text-muted-foreground pb-5 w-10 shrink-0 text-right">
                {#each activeRevenueChart.yLabels as lbl}
                  <span>{lbl}</span>
                {/each}
              </div>
              <div class="flex-1 relative h-64">
                <svg viewBox="0 0 860 200" class="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="revGradReport" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stop-color="#3b82f6" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01" />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stop-color="#ec4899" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#ec4899" stop-opacity="0.01" />
                    </linearGradient>
                  </defs>
                  {#each [0, 40, 80, 120, 160, 200] as y}
                    <line x1="0" y1={y} x2="860" y2={y} stroke="currentColor" stroke-opacity="0.07" stroke-width="1" />
                  {/each}
                  <path d={svgRevenue.fill} fill="url(#revGradReport)" />
                  <path d={svgRevenue.line} fill="none" stroke="#3b82f6" stroke-width="2.5" />
                  <path d={svgProfit.fill}  fill="url(#profitGrad)" />
                  <path d={svgProfit.line}  fill="none" stroke="#ec4899" stroke-width="2.5" />
                  {#each svgRevenue.pts as pt}
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#3b82f6" />
                  {/each}
                  {#each svgProfit.pts as pt}
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#ec4899" />
                  {/each}
                </svg>
                <div class="absolute bottom-0 left-0 right-0 flex justify-between">
                  {#each activeRevenueChart.labels as m}
                    <span class="text-[10px] text-muted-foreground">{m}</span>
                  {/each}
                </div>
              </div>
            </div>
          {:else}
            <div class="flex flex-col items-center justify-center py-16 text-center">
              <Icon iconName="icon/bar-chart" size={48} class="text-muted-foreground mb-4" />
              <p class="text-foreground font-medium">No Revenue Data</p>
              <p class="text-muted-foreground text-sm mt-1">There is no revenue data available for the selected period.</p>
            </div>
          {/if}
        </div>

        <!-- Revenue by Category -->
        <div class="bg-card border border-border rounded-lg px-8 py-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">
              {$_('revenueByCategoryLabel')}
            </h3>
            <Dropdown
              options={[
                { value: "this-week",  label: $_('last7Days') },
                { value: "this-month", label: $_('last30Days') },
                { value: "this-year",  label: $_('last12Months') },
              ]}
              bind:value={revenueByCategoryPeriod}
              class="min-w-30"
            />
          </div>

          <!-- Donut chart for category distribution -->
          <div class="flex justify-center mb-4">
            <svg viewBox="0 0 160 160" class="w-36 h-36">
              {#each revenueCatSegments as seg}
                <circle cx="80" cy="80" r="56" fill="none" stroke={seg.color} stroke-width="26"
                  stroke-dasharray="{seg.dash.toFixed(1)} {CAT_CIRC}" stroke-dashoffset={seg.offset.toFixed(1)} transform="rotate(-90 80 80)" />
              {/each}
              <circle cx="80" cy="80" r="43" class="fill-card" />
              <text x="80" y="76" font-size="11" fill="currentColor" text-anchor="middle" font-weight="700">{activeRevenueByCat.total}</text>
              <text x="80" y="90" font-size="8" fill="#6b7280" text-anchor="middle">{$_('totalLabel')}</text>
            </svg>
          </div>

          <!-- Legend + list -->
          <div class="space-y-3">
            {#each activeRevenueByCat.categories as item, i}
              <div class="flex items-center justify-between pb-3 border-b border-border last:border-0">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full {catBgColors[i]} shrink-0"></span>
                  <div>
                    <p class="text-sm font-medium text-foreground">{item.category}</p>
                    <p class="text-xs text-muted-foreground">{item.items}</p>
                  </div>
                </div>
                <p class="text-sm font-semibold text-foreground">{item.revenue}</p>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="revenue-date-range"
        bind:dateRange={revenueDateRange}
        filters={[
          { id: "revenue-category-filter", label: $_('category'), options: [
              { value: "", label: $_('filterAll') },
              { value: "electronics", label: "Electronics" },
              { value: "clothing", label: "Clothing" },
              { value: "home supplies", label: "Home Supplies" },
              { value: "beauty", label: "Beauty" },
              { value: "furniture", label: "Furniture" },
            ], value: revenueCategoryFilter, onchange: (v) => { revenueCategoryFilter = v; } },
        ]}
      />

      <!-- Revenue Breakdown Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">
            {$_('revenueBreakdown')}
          </h3>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to PDF"
              onclick={handleExportPDF}
            >
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to XLS"
              onclick={handleExportXLS}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-green-500"
              />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Print"
              onclick={handlePrint}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-muted-foreground"
              />
            </button>
          </div>
        </div>

        {#if true}
          {@const paginatedRevenueData = filteredRevenueBreakdownData.slice(
            (revenueBreakdownPage - 1) * revenueBreakdownRowsPerPage,
            revenueBreakdownPage * revenueBreakdownRowsPerPage,
          )}
          <DataTable
            columns={revenueBreakdownColumns}
            data={paginatedRevenueData}
            searchable={false}
            filters={[]}
            pagination={{
              currentPage: revenueBreakdownPage,
              totalPages: revenueBreakdownTotalPages,
              rowsPerPage: revenueBreakdownRowsPerPage,
              onPageChange: handleRevenueBreakdownPageChange,
              onRowsPerPageChange: handleRevenueBreakdownRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
  {#if activeTab === "Payments"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#if paymentStatsLoading}
          {#each [1,2,3,4] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3"></div>
              <div class="h-8 bg-muted rounded w-32 mb-3"></div>
              <div class="h-5 bg-muted rounded w-36"></div>
            </div>
          {/each}
        {:else}
          {#each paymentsKpiCards as kpi}
            <IconKpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} iconBgClass={kpi.iconBgClass} iconColor={kpi.iconColor} />
          {/each}
        {/if}
      </div>

      <!-- Filters Section -->
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterFrom')}</label>
            <input
              type="date"
              bind:value={paymentsDateFrom}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterTo')}</label>
            <input
              type="date"
              bind:value={paymentsDateTo}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('merchant')}</label>
            <SearchSelect
              query={MERCHANT_QUERY}
              dataKey="merchant"
              filterBuilder={(s) => ({
                _or: [
                  { first_name: { _ilike: `%${s}%` } },
                  { last_name: { _ilike: `%${s}%` } },
                ]
              })}
              displayLabel={(item) => [item.first_name, item.last_name].filter(Boolean).join(" ")}
              placeholder={$_('searchMerchant')}
              initialValue={paymentsMerchantId}
              onSelect={(item) => { paymentsMerchantId = item?.id ?? ""; paymentsCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('navLocation')}</label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchLocation')}
              initialValue={paymentsLocationId}
              onSelect={(item) => { paymentsLocationId = item?.id ?? ""; paymentsCurrentPage = 1; }}
            />
          </div>
        </div>
      </div>

      <!-- Payment Report Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">{$_('paymentReport')}</h3>
          <div class="flex items-center gap-2">
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="PDF" onclick={handleExportPDF}>
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="XLS" onclick={handleExportXLS}>
              <Icon iconName="icon/file-text" size={20} class="text-green-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="Print" onclick={handlePrint}>
              <Icon iconName="icon/file-text" size={20} class="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={$_('search')}
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={paymentsSearchQuery}
            />
          </div>
        </div>

        {#if paymentsLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("merchant")}>
                    {$_('merchant')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'merchant' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'merchant' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("customer")}>
                    {$_('customer')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'customer' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'customer' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("product")}>
                    {$_('productName')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'product' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'product' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium uppercase">
                  {$_('paymentMethod')}
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("amount")}>
                    {$_('amount')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'amount' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'amount' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("status")}>
                    {$_('filterStatus')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'status' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'status' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => paymentsHandleSort("created_at")}>
                    {$_('date')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={paymentsSortColumn === 'created_at' && paymentsSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={paymentsSortColumn === 'created_at' && paymentsSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if paymentsData.length === 0 && !paymentsLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>{$_('noPaymentsFound')}</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each paymentsData as payment}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground">{paymentsMerchantLabel(payment)}</td>
                    <td class="px-4 py-3 text-foreground">{paymentsCustomerLabel(payment)}</td>
                    <td class="px-4 py-3 text-foreground">{payment.order?.stock?.product?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{payment.payment_method ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(payment.amount)}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium {payment.order?.status === 'paid' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : payment.order?.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'}">
                        <span class="w-1.5 h-1.5 rounded-full {payment.order?.status === 'paid' ? 'bg-green-600' : payment.order?.status === 'cancelled' ? 'bg-red-600' : 'bg-yellow-600'}"></span>
                        {payment.order?.status ?? "-"}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={paymentsRowsPerPage}
              onchange={() => { paymentsCurrentPage = 1; }}
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
              disabled={paymentsCurrentPage === 1}
              onclick={() => paymentsCurrentPage = paymentsCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(paymentsCurrentPage, paymentsTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === paymentsCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === paymentsCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => paymentsCurrentPage = p}
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
              disabled={paymentsCurrentPage === paymentsTotalPages}
              onclick={() => paymentsCurrentPage = paymentsCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
  {#if activeTab === "Stock Movement"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#if stockMovementStatsLoading}
          {#each [1,2,3] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3"></div>
              <div class="h-8 bg-muted rounded w-32 mb-3"></div>
              <div class="h-5 bg-muted rounded w-36"></div>
            </div>
          {/each}
        {:else}
          {#each stockMovementKpiCards as kpi}
            <IconKpiCard label={kpi.label} value={kpi.value} icon={kpi.icon} iconBgClass={kpi.iconBgClass} iconColor={kpi.iconColor} />
          {/each}
        {/if}
      </div>

      <!-- Filters Section -->
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterFrom')}</label>
            <input
              type="date"
              bind:value={stockDateFrom}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterTo')}</label>
            <input
              type="date"
              bind:value={stockDateTo}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('navLocation')}</label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchLocation')}
              initialValue={stockLocationId}
              onSelect={(item) => { stockLocationId = item?.id ?? ""; stockCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('merchant')}</label>
            <SearchSelect
              query={MERCHANT_QUERY}
              dataKey="merchant"
              filterBuilder={(s) => ({
                _or: [
                  { first_name: { _ilike: `%${s}%` } },
                  { last_name: { _ilike: `%${s}%` } },
                ]
              })}
              displayLabel={(item) => [item.first_name, item.last_name].filter(Boolean).join(" ")}
              placeholder={$_('searchMerchant')}
              initialValue={stockMerchantId}
              onSelect={(item) => { stockMerchantId = item?.id ?? ""; stockCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('movementType')}</label>
            <select
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={stockMovementType}
              onchange={() => { stockCurrentPage = 1; }}
            >
              {#each movementTypeOptions as opt}
                <option value={opt.value}>{opt.label}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>

      <!-- Stock Movement Report Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">{$_('stockMovementReport')}</h3>
          <div class="flex items-center gap-2">
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="PDF" onclick={handleExportPDF}>
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="XLS" onclick={handleExportXLS}>
              <Icon iconName="icon/file-text" size={20} class="text-green-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="Print" onclick={handlePrint}>
              <Icon iconName="icon/file-text" size={20} class="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={$_('search')}
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={stockSearchQuery}
            />
          </div>
        </div>

        {#if stockLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">{$_('referenceNumber')}</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("movement_type")}>
                    {$_('movementType')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'movement_type' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'movement_type' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("product")}>
                    {$_('productName')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'product' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'product' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">{$_('batchNumber')}</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("branch")}>
                    {$_('navLocation')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'branch' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'branch' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("merchant")}>
                    {$_('merchant')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'merchant' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'merchant' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("quantity")}>
                    {$_('qty')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("created_at")}>
                    {$_('date')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if stockMovementsData.length === 0 && !stockLoading}
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>{$_('noStockMovementsFound')}</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each stockMovementsData as movement}
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
                    <td class="px-4 py-3 text-foreground">{stockMerchantLabel(movement)}</td>
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

        <div class="p-4 border-t border-border flex flex-col sm:flex-row gap-2 items-center justify-between">
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
  {/if}
  {#if activeTab === "Low Stock"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#if lowStockStatsLoading}
          {#each [1,2,3] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3"></div>
              <div class="h-8 bg-muted rounded w-32 mb-3"></div>
              <div class="h-5 bg-muted rounded w-36"></div>
            </div>
          {/each}
        {:else}
          {#each lowStockKpiCards as kpi}
            <IconKpiCard
              label={kpi.label}
              value={kpi.value}
              icon={kpi.icon}
              iconBgClass={kpi.iconBgClass}
              iconColor={kpi.iconColor}
            />
          {/each}
        {/if}
      </div>

      <!-- Filters Section -->
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('navLocation')}</label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchLocation')}
              initialValue={lowStockLocationId}
              onSelect={(item) => { lowStockLocationId = item?.id ?? ""; lowStockCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('merchant')}</label>
            <SearchSelect
              query={MERCHANT_QUERY}
              dataKey="merchant"
              filterBuilder={(s) => ({
                _or: [
                  { first_name: { _ilike: `%${s}%` } },
                  { last_name: { _ilike: `%${s}%` } },
                ]
              })}
              displayLabel={(item) => [item.first_name, item.last_name].filter(Boolean).join(" ")}
              placeholder={$_('searchMerchant')}
              initialValue={lowStockMerchantId}
              onSelect={(item) => { lowStockMerchantId = item?.id ?? ""; lowStockCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('category')}</label>
            <SearchSelect
              query={CATEGORY_QUERY}
              dataKey="product_types"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchCategory')}
              initialValue={lowStockCategoryId}
              onSelect={(item) => { lowStockCategoryId = item?.id ?? ""; lowStockCurrentPage = 1; }}
            />
          </div>
          <div class="flex-1 min-w-0">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">{$_('products')}</label>
            <SearchSelect
              query={PRODUCT_QUERY}
              dataKey="products"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder={$_('searchProduct')}
              initialValue={lowStockProductId}
              onSelect={(item) => { lowStockProductId = item?.id ?? ""; lowStockCurrentPage = 1; }}
            />
          </div>
        </div>
      </div>

      <!-- Low Stock Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex items-center justify-between">
          <h3 class="text-lg font-semibold text-foreground">{$_('lowStockProducts')}</h3>
          <div class="flex items-center gap-2">
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="PDF" onclick={handleExportPDF}>
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="XLS" onclick={handleExportXLS}>
              <Icon iconName="icon/file-text" size={20} class="text-green-500" />
            </button>
            <button type="button" class="p-2 hover:bg-muted rounded transition-colors" aria-label="Print" onclick={handlePrint}>
              <Icon iconName="icon/file-text" size={20} class="text-muted-foreground" />
            </button>
          </div>
        </div>
        <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div class="relative w-72 shrink-0">
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder={$_('search')}
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={lowStockSearchQuery}
            />
          </div>
        </div>

        {#if lowStockLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("name")}>
                    {$_('productName')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'name' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'name' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("type")}>
                    {$_('category')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'type' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'type' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("company")}>
                    {$_('navLocation')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'company' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'company' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("merchant")}>
                    {$_('merchant')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'merchant' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'merchant' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("unit")}>
                    {$_('unit')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'unit' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'unit' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("quantity")}>
                    {$_('qty')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'quantity' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'quantity' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("threshold")}>
                    {$_('qtyAlert')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'threshold' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'threshold' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => lowStockHandleSort("created_at")}>
                    {$_('date')}
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={lowStockSortColumn === 'created_at' && lowStockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={lowStockSortColumn === 'created_at' && lowStockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if lowStockData.length === 0 && !lowStockLoading}
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>{$_('noLowStockFound')}</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each lowStockData as product}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                          <Icon iconName="icon/package" size={16} class="text-muted-foreground" />
                        </div>
                        <span class="text-sm font-medium text-foreground">{product.name ?? "-"}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-foreground">{product.type?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{product.company?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{lowStockMerchantLabel(product)}</td>
                    <td class="px-4 py-3 text-foreground">{product.default_unit ?? "-"}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {lowStockTypeClass(product.current_available_stock, product.treshold_quantity)}">
                        {product.current_available_stock ?? 0}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-foreground">{product.treshold_quantity ?? 0}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {product.created_at ? new Date(product.created_at).toLocaleDateString() : "-"}
                    </td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        </div>

        <div class="p-4 border-t border-border flex flex-col sm:flex-row gap-2 items-center justify-between">
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
              <option value={100}>100</option>
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
      </div>
    </div>
  {/if}
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
