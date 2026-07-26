<script lang="ts">
  import { browser } from '$app/environment';
  import { jwtDecode } from 'jwt-decode';
  import { goto } from '$app/navigation';
  import { getAuthClient } from '$lib/graphql/client';
  import ApexCharts from "apexcharts";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import { _ } from "svelte-i18n";
  import STATS_QUERY from '$graphql/queries/dashboard/stats.gql';
  import SALES_TREND_QUERY from '$graphql/queries/dashboard/sales_trend.gql';
  import TOP_MERCHANTS_QUERY from '$graphql/queries/dashboard/top_merchants.gql';
  import TOP_CUSTOMERS_QUERY from '$graphql/queries/dashboard/top_customers.gql';
  import PRODUCT_PROPORTION_QUERY from '$graphql/queries/dashboard/sales_per_product_proportion.gql';

  function parseMoney(val: unknown): number {
    if (val == null) return 0;
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[^0-9.\-]/g, '');
      return parseFloat(cleaned) || 0;
    }
    return 0;
  }

  function extractFromToken<T>(extractor: (payload: Record<string, unknown>) => T): T | null {
    if (!browser) return null;
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const payload = jwtDecode<Record<string, unknown>>(token);
      return extractor(payload);
    } catch {
      return null;
    }
  }

  const investorId = extractFromToken((p) => (p.metadata as Record<string, unknown>)?.['x-hasura-investor-id'] as string) ?? '';

  function fmtCurrency(val: unknown): string {
    const n = parseMoney(val);
    if (n >= 1_000_000) return `ETB ${(n / 1_000_000).toFixed(1)}M`;
    return `ETB ${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function fmtInt(n: number): string {
    return n.toLocaleString('en-US');
  }

  function computeChange(current: number, previous: number): { pct: string; type: 'positive' | 'negative' } | null {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    if (Math.abs(change) < 0.01) return null;
    const sign = change >= 0 ? '+' : '';
    return { pct: `${sign}${change.toFixed(1)}%`, type: change >= 0 ? 'positive' : 'negative' };
  }

  let chartInstance: any = null;

  function chartAction(node: HTMLDivElement) {
    const options = {
      chart: { type: "area", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
      animations: { enabled: true, dynamicAnimation: { enabled: true, speed: 500 } },
      series: [{ name: "Sales", data: chartMonthData.values }],
      xaxis: { categories: chartMonthData.labels, labels: { style: { colors: "#9ca3af", fontSize: "11px" } } },
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

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const COL = "grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6";

  // ---------- state ----------
  let loading = $state(true);

  let statsData: {
    total_sales?: { aggregate?: { sum?: { amount?: number } } };
    previous_month_sales?: { aggregate?: { sum?: { amount?: number } } };
    total_orders?: { aggregate?: { count?: number } };
    previous_month_orders?: { aggregate?: { count?: number } };
    total_merchants?: { aggregate?: { count?: number } };
    previous_month_merchants?: { aggregate?: { count?: number } };
    total_units_sold?: { aggregate?: { sum?: { order_quantity?: number } } };
    previous_month_units?: { aggregate?: { sum?: { order_quantity?: number } } };
  } | null = $state(null);

  let salesTrendData: {
    overall_orders?: { aggregate?: { sum?: { total_amount?: number } } };
    last_twelve_month?: { aggregate?: { sum?: { total_amount?: number } } };
    investor_sales_trend_global_report?: Array<{ month: number; total_sales: number }>;
  } | null = $state(null);

  let topMerchantsData: {
    merchant?: Array<{
      id: string; first_name: string; last_name: string; phone_number: string; created_at: string;
      total_orders: { aggregate: { count: number } };
      total_sales: { aggregate: { sum: { total_amount: number } } };
      total_outstanding: { aggregate: { sum: { outstanding_amount: number } } };
    }>;
    total?: { aggregate: { count: number } };
  } | null = $state(null);

  let topCustomersData: {
    customers?: Array<{
      id: string; first_name: string; last_name: string; address: string;
      orders_aggregate: { aggregate: { count: number } };
      revenue: { aggregate: { sum: { total_amount: number } } };
    }>;
    total?: { aggregate: { count: number } };
  } | null = $state(null);

  let productProportionData: {
    investor_sales_per_product_type_report?: Array<{
      product_type_id: string; product_type_name: string; total_sales: number; total_quantity_sold: number;
    }>;
  } | null = $state(null);

  let chartYear = $state(new Date().getFullYear());
  const yearOptions = $derived.by(() => {
    const current = new Date().getFullYear();
    const years: number[] = [];
    for (let y = 2024; y <= current; y++) years.push(y);
    return years;
  });

  // ---------- initial data fetch (stats, customers, product proportion, merchants) ----------
  $effect(() => {
    const client = getAuthClient('investor');
    const now = new Date();
    const pastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    Promise.all([
      client.query({ query: STATS_QUERY, variables: { pastMonthEndDate: pastMonthEnd.toISOString() }, fetchPolicy: 'network-only' }),
      client.query({ query: TOP_CUSTOMERS_QUERY, variables: { limit: 5, offset: 0, filter: {} }, fetchPolicy: 'network-only' }),
      client.query({ query: PRODUCT_PROPORTION_QUERY, variables: { investorId }, fetchPolicy: 'network-only' }),
      client.query({ query: TOP_MERCHANTS_QUERY, variables: { limit: 5, offset: 0, filter: {} }, fetchPolicy: 'network-only' }),
    ]).then(([stats, customers, proportion, merchants]) => {
      statsData = stats.data ?? null;
      topCustomersData = customers.data ?? null;
      productProportionData = proportion.data ?? null;
      topMerchantsData = merchants.data ?? null;
    }).catch((err: Error) => {
      console.error('Dashboard data fetch failed', err);
    }).finally(() => {
      loading = false;
    });
  });

  // ---------- refetch sales trend when year changes ----------
  let trendLoading = $state(true);

  $effect(() => {
    const year = chartYear;
    const client = getAuthClient('investor');
    const now = new Date();
    const lastTwelveMonth = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();

    trendLoading = true;

    client.query({
      query: SALES_TREND_QUERY,
      variables: { investorId, year, lastTwelveMonth },
      fetchPolicy: 'network-only',
    }).then((result) => {
      salesTrendData = result.data ?? null;
    }).catch((err: Error) => {
      console.error('Failed to fetch sales trend', err);
    }).finally(() => {
      trendLoading = false;
    });
  });

  // ---------- derived: KPI cards ----------
  const kpiCards = $derived.by(() => {
    if (!statsData) return [];

    const totalSales = parseMoney(statsData.total_sales?.aggregate?.sum?.amount);
    const prevSales = parseMoney(statsData.previous_month_sales?.aggregate?.sum?.amount);
    const totalOrders = statsData.total_orders?.aggregate?.count ?? 0;
    const prevOrders = statsData.previous_month_orders?.aggregate?.count ?? 0;
    const totalMerchants = statsData.total_merchants?.aggregate?.count ?? 0;
    const prevMerchants = statsData.previous_month_merchants?.aggregate?.count ?? 0;
    const totalUnits = statsData.total_units_sold?.aggregate?.sum?.order_quantity ?? 0;
    const prevUnits = statsData.previous_month_units?.aggregate?.sum?.order_quantity ?? 0;

    const salesChange = prevSales ? computeChange(totalSales, prevSales) : null;
    const ordersChange = prevOrders ? computeChange(totalOrders, prevOrders) : null;
    const merchantsChange = prevMerchants ? computeChange(totalMerchants, prevMerchants) : null;
    const unitsChange = prevUnits ? computeChange(totalUnits, prevUnits) : null;

    return [
      { label: $_('totalRevenue'),   value: fmtCurrency(totalSales), change: salesChange ? `${salesChange.pct} ${$_('vsLastMonth')}` : null, changeType: salesChange?.type ?? 'positive', icon: "icon/bar-chart" as const, iconColor: "bg-green-100 dark:bg-green-900/40" },
      { label: $_('totalOrders'),    value: fmtInt(totalOrders),     change: ordersChange ? `${ordersChange.pct} ${$_('vsLastMonth')}` : null, changeType: ordersChange?.type ?? 'positive', icon: "icon/shopping-cart" as const, iconColor: "bg-blue-100 dark:bg-blue-900/40" },
      { label: $_('totalMerchants'), value: fmtInt(totalMerchants),  change: merchantsChange ? `${merchantsChange.pct} ${$_('vsLastMonth')}` : null, changeType: merchantsChange?.type ?? 'positive', icon: "icon/users" as const, iconColor: "bg-orange-100 dark:bg-orange-900/40" },
      { label: $_('totalStock'),     value: fmtInt(totalUnits),      change: unitsChange ? `${unitsChange.pct} ${$_('vsLastMonth')}` : null, changeType: unitsChange?.type ?? 'positive', icon: "icon/box" as const, iconColor: "bg-red-100 dark:bg-red-900/40" },
    ];
  });

  // ---------- derived: revenue chart data ----------
  const chartMonthData = $derived.by(() => {
    const trend = salesTrendData?.investor_sales_trend_global_report;
    if (!trend || trend.length === 0) return { labels: ['Jan'], values: [0], revenue: 'ETB 0', change: '', changePct: '', positive: true, yLabels: [] };

    const sorted = [...trend].sort((a, b) => a.month - b.month);
    const labels = sorted.map(d => MONTH_LABELS[d.month - 1] ?? `M${d.month}`);
    const values = sorted.map(d => parseMoney(d.total_sales));
    const totalRevenue = values.reduce((s, v) => s + v, 0);

    const overall = parseMoney(salesTrendData?.overall_orders?.aggregate?.sum?.total_amount);
    const lastTwelve = parseMoney(salesTrendData?.last_twelve_month?.aggregate?.sum?.total_amount);
    const rawChange = lastTwelve ? ((overall - lastTwelve) / lastTwelve * 100) : null;
    const changePct = (rawChange != null && Math.abs(rawChange) >= 0.01) ? `${rawChange >= 0 ? '+' : ''}${rawChange.toFixed(1)}%` : '';

    const maxVal = Math.max(...values, 1);
    const steps = 5;
    const yLabels = Array.from({ length: steps + 1 }, (_, i) => {
      const v = Math.round((maxVal / steps) * (steps - i));
      return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v);
    });

    return {
      labels,
      values,
      revenue: fmtCurrency(totalRevenue),
      change: $_('last12Months'),
      changePct,
      positive: rawChange != null && rawChange >= 0,
      yLabels,
    };
  });

  // ---------- update ApexCharts when data changes ----------
  $effect(() => {
    void chartMonthData.values;
    void chartMonthData.labels;
    if (!chartInstance || !chartMonthData.values.length) return;
    chartInstance.updateSeries([{ data: chartMonthData.values }]);
    chartInstance.updateOptions({
      xaxis: { categories: chartMonthData.labels },
    });
  });

  // ---------- mock: top merchants ----------
  const topMerchantsByPeriod: Record<string, Array<{ name: string; initials: string; avatarBg: string; avatar: string; branch: string; sales: string; revenue: string }>> = {
    "Today": [
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "12+ Sales", revenue: "$420.00" },
      { name: "Beth Noah",      initials: "BN", avatarBg: "bg-rose-500",   avatar: "",                                               branch: "Branch 7",  sales: "9+ Sales",  revenue: "$318.50" },
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "7+ Sales",  revenue: "$280.00" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "5+ Sales",  revenue: "$195.40" },
      { name: "Emma Collins",   initials: "EC", avatarBg: "bg-purple-500", avatar: "",                                               branch: "Branch 2",  sales: "4+ Sales",  revenue: "$148.00" },
    ],
    "Last 7 Days": [
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "247+ Sales", revenue: "$8,965.00" },
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "160+ Sales", revenue: "$8,024.05" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "89+ Sales",  revenue: "$6,245.80" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-amber-500",  avatar: "",                                               branch: "Branch 9",  sales: "78+ Sales",  revenue: "$3,490.48" },
      { name: "Beth Noah",      initials: "BN", avatarBg: "bg-rose-500",   avatar: "",                                               branch: "Branch 7",  sales: "46+ Sales",  revenue: "$1,590.78" },
    ],
    "Last 30 Days": [
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "620+ Sales", revenue: "$31,204.20" },
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "940+ Sales", revenue: "$34,086.00" },
      { name: "Emma Collins",   initials: "EC", avatarBg: "bg-purple-500", avatar: "",                                               branch: "Branch 2",  sales: "510+ Sales", revenue: "$20,146.50" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "340+ Sales", revenue: "$23,816.80" },
      { name: "James Morgan",   initials: "JM", avatarBg: "bg-blue-500",   avatar: "",                                               branch: "Branch 5",  sales: "280+ Sales", revenue: "$13,304.00" },
    ],
    "3 Months": [
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "2800+ Sales", revenue: "$102,258.00" },
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "1860+ Sales", revenue: "$93,612.60" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "1020+ Sales", revenue: "$71,474.40" },
      { name: "Emma Collins",   initials: "EC", avatarBg: "bg-purple-500", avatar: "",                                               branch: "Branch 2",  sales: "890+ Sales",  revenue: "$60,439.50" },
      { name: "Beth Noah",      initials: "BN", avatarBg: "bg-rose-500",   avatar: "",                                               branch: "Branch 7",  sales: "560+ Sales",  revenue: "$19,090.56" },
    ],
    "6 Months": [
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "3720+ Sales", revenue: "$187,225.20" },
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "5600+ Sales", revenue: "$204,516.00" },
      { name: "Emma Collins",   initials: "EC", avatarBg: "bg-purple-500", avatar: "",                                               branch: "Branch 2",  sales: "3060+ Sales", revenue: "$120,879.00" },
      { name: "James Morgan",   initials: "JM", avatarBg: "bg-blue-500",   avatar: "",                                               branch: "Branch 5",  sales: "2240+ Sales", revenue: "$106,408.00" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "2040+ Sales", revenue: "$142,948.80" },
    ],
    "Year": [
      { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "11200+ Sales", revenue: "$409,032.00" },
      { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "7440+ Sales",  revenue: "$374,450.40" },
      { name: "Emma Collins",   initials: "EC", avatarBg: "bg-purple-500", avatar: "",                                               branch: "Branch 2",  sales: "6120+ Sales",  revenue: "$241,758.00" },
      { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "4080+ Sales",  revenue: "$285,897.60" },
      { name: "James Morgan",   initials: "JM", avatarBg: "bg-blue-500",   avatar: "",                                               branch: "Branch 5",  sales: "4480+ Sales",  revenue: "$212,816.00" },
    ],
  };

  const tableRows = [
    { merchant: "Stan Gaunter", date: "24 Dec 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "10 Dec 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "27 Nov 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "18 Nov 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "06 Nov 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "25 Oct 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "14 Oct 2024", period: "Q2 2025", status: "Active" },
    { merchant: "Stan Gaunter", date: "03 Oct 2024", period: "Q2 2025", status: "Active" },
  ];

  let merchantsPeriod = $state("Today");
  let showMerchantsDropdown = $state(false);
  const merchantsPeriodOptions = $derived([
    { key: "Today",       label: $_('today') },
    { key: "Last 7 Days", label: $_('last7Days') },
    { key: "Last 30 Days",label: $_('last30Days') },
    { key: "3 Months",    label: $_('threeMonths') },
    { key: "6 Months",    label: $_('sixMonths') },
    { key: "Year",        label: $_('year') },
  ]);

  const activeTopMerchants = $derived(topMerchantsByPeriod[merchantsPeriod] ?? topMerchantsByPeriod["Last 7 Days"]);

  // ---------- derived: customers table ----------
  const customerRows = $derived.by(() => {
    const customers = topCustomersData?.customers;
    if (!customers) return [];
    const avatarColors = ['bg-indigo-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500'];
    return customers.map(c => {
      const firstName = c.first_name ?? '';
      const lastName = c.last_name ?? '';
      const name = `${firstName} ${lastName}`.trim() || 'Unknown';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
      const avatarBg = avatarColors[Math.abs((c.id || '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)) % avatarColors.length];
      return {
        name,
        initials,
        avatarBg,
        address: c.address || '-',
        orders: c.orders_aggregate?.aggregate?.count ?? 0,
        revenue: c.revenue?.aggregate?.sum?.total_amount ?? 0,
      };
    });
  });

  // ---------- derived: merchants list ----------
  const merchantRows = $derived.by(() => {
    const merchants = topMerchantsData?.merchant;
    if (!merchants) return [];
    const avatarColors = ['bg-indigo-500', 'bg-rose-500', 'bg-teal-500', 'bg-orange-500', 'bg-purple-500', 'bg-amber-500', 'bg-blue-500'];
    return merchants.map(m => {
      const firstName = m.first_name ?? '';
      const lastName = m.last_name ?? '';
      const name = `${firstName} ${lastName}`.trim() || 'Unknown';
      const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';
      const avatarBg = avatarColors[Math.abs((m.id || '').split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)) % avatarColors.length];
      return {
        id: m.id,
        name,
        initials,
        avatarBg,
        phone: m.phone_number ?? '',
        salesCount: m.total_orders?.aggregate?.count ?? 0,
        revenue: m.total_sales?.aggregate?.sum?.total_amount ?? 0,
        outstanding: m.total_outstanding?.aggregate?.sum?.outstanding_amount ?? 0,
      };
    });
  });

  // ---------- derived: stock distribution donut ----------
  let donutChartInstance: any = null;

  function donutChartAction(node: HTMLDivElement) {
    const options = {
      chart: { type: "donut", height: 280, toolbar: { show: false }, fontFamily: "inherit" },
      labels: donutLabels,
      series: donutSeries,
      colors: ["#3b82f6", "#facc15", "#22c55e", "#a855f7", "#f43f5e", "#06b6d4"],
      plotOptions: {
        pie: {
          donut: {
            size: "55%",
            labels: {
              show: true,
              total: { show: true, label: "Total", formatter: () => { const total = donutSeries.reduce((a: number, b: number) => a + b, 0); return total >= 1_000_000 ? `ETB ${(total / 1_000_000).toFixed(1)}M` : total >= 1_000 ? `ETB ${(total / 1_000).toFixed(1)}K` : `ETB ${total.toFixed(2)}`; } },
            },
          },
        },
      },
      dataLabels: { enabled: true, style: { fontSize: "11px" }, dropShadow: { enabled: false } },
      legend: { show: true, position: "bottom", fontSize: "12px", labels: { colors: "#9ca3af" } },
      tooltip: { y: { formatter: (v: number) => `ETB ${v.toLocaleString("en-US", { minimumFractionDigits: 2 })}` } },
      stroke: { width: 0 },
      responsive: [{ breakpoint: 480, options: { chart: { height: 220 }, legend: { show: false } } }],
    };
    donutChartInstance = new ApexCharts(node, options);
    donutChartInstance.render();
    return {
      destroy() { if (donutChartInstance) { donutChartInstance.destroy(); donutChartInstance = null; } },
    };
  }

  const donutLabels = $derived.by(() => {
    const report = productProportionData?.investor_sales_per_product_type_report;
    if (!report) return [];
    return report.map(r => r.product_type_name || `Type ${r.product_type_id}`);
  });

  const donutSeries = $derived.by(() => {
    const report = productProportionData?.investor_sales_per_product_type_report;
    if (!report) return [];
    return report.map(r => parseMoney(r.total_sales));
  });

  $effect(() => {
    void donutLabels;
    void donutSeries;
    if (!donutChartInstance || !donutSeries.length) return;
    donutChartInstance.updateOptions({
      labels: donutLabels,
      series: donutSeries,
    });
  });

  const stockDistributionData = $derived.by(() => {
    const report = productProportionData?.investor_sales_per_product_type_report;
    if (!report || report.length === 0) return [];
    const total = report.reduce((s, r) => s + parseMoney(r.total_sales), 0) || 1;
    const colors = [
      { color: "bg-blue-500", dotColor: "#3b82f6", stroke: "#3b82f6" },
      { color: "bg-yellow-400", dotColor: "#facc15", stroke: "#facc15" },
      { color: "bg-green-500", dotColor: "#22c55e", stroke: "#22c55e" },
      { color: "bg-purple-500", dotColor: "#a855f7", stroke: "#a855f7" },
      { color: "bg-rose-500", dotColor: "#f43f5e", stroke: "#f43f5e" },
      { color: "bg-cyan-500", dotColor: "#06b6d4", stroke: "#06b6d4" },
    ];
    return report.map((r, i) => {
      const pct = Math.round((parseMoney(r.total_sales) / total) * 100);
      return {
        label: r.product_type_name || `Type ${r.product_type_id}`,
        percent: pct,
        value: `${r.total_quantity_sold} ${$_('sales')}`,
        ...colors[i % colors.length],
      };
    });
  });

  const categoryStats = $derived.by(() => {
    const report = productProportionData?.investor_sales_per_product_type_report;
    const categories = report?.length ?? 0;
    const products = report?.reduce((s, r) => s + r.total_quantity_sold, 0) ?? 0;
    return { categories, products };
  });
</script>

<div class="flex-1 p-6 space-y-6">

  <!-- ── ROW 1: Welcome + KPI cards ── -->
  <div class="bg-card p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-foreground">{$_('welcome')}, Investor</h2>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {#if loading}
        {#each [1,2,3,4] as _}
          <div class="bg-background border border-border rounded-lg p-5 flex flex-col gap-2">
            <Skeleton class="h-8 w-24" />
            <Skeleton class="h-4 w-32" />
            <div class="border-t border-border pt-2">
              <Skeleton class="h-3 w-20" />
            </div>
          </div>
        {/each}
      {:else}
        {#each kpiCards as kpi}
          <div class="bg-background border border-border rounded-lg p-5 flex flex-col gap-2">
            <div class="flex items-start justify-between">
              <p class="text-2xl font-bold text-foreground">{kpi.value}</p>
              <div class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <Icon iconName={kpi.icon} size={20} class="text-foreground" />
              </div>
            </div>
            <p class="text-sm text-muted-foreground">{kpi.label}</p>
            {#if kpi.change}
              <div class="border-t border-border"></div>
              <p class="text-xs font-medium {kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-500'}">
                {kpi.change}
              </p>
            {/if}
          </div>
        {/each}
      {/if}
    </div>
  </div>

  <!-- ── ROW 2: Revenue Over Time  |  Top Merchants ── -->
  <div class={COL}>

    <div class="bg-card border border-border rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">{$_('revenueOverTime')}</p>
          <p class="text-2xl font-bold text-foreground">{chartMonthData.revenue}</p>
          {#if chartMonthData.changePct}
            <p class="text-sm {chartMonthData.positive ? 'text-green-600' : 'text-red-500'}">{chartMonthData.change} <span class="font-medium">{chartMonthData.changePct}</span></p>
          {/if}
        </div>
        <div>
          <select
            bind:value={chartYear}
            class="text-xs border border-border rounded px-2 py-1 bg-background text-foreground"
          >
            {#each yearOptions as y}
              <option value={y}>{y}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if loading || trendLoading}
        <div class="h-52 flex items-center justify-center">
          <Skeleton class="h-44 w-full" />
        </div>
      {:else if chartMonthData.values.length > 1}
        <div class="relative">
          <div use:chartAction class="w-full"></div>
        </div>
      {/if}
    </div>

    <div class="bg-card border border-border rounded-lg p-6 space-y-4" id="topCustomersSection">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon iconName="icon/users" size={15} class="text-orange-400" />
          {$_('topCustomers')}
        </h3>
        <!-- <a href="/dashboard/merchants" class="text-xs text-info hover:underline">{$_('viewAll')}</a> -->
      </div>

      <div class="space-y-4">
        {#if loading}
          {#each [1,2,3,4] as _}
            <div class="flex items-center justify-between animate-pulse">
              <div class="flex items-center gap-3">
                <Skeleton class="w-9 h-9 rounded-full" />
                <div class="space-y-1.5">
                  <Skeleton class="h-4 w-28" />
                  <Skeleton class="h-3 w-20" />
                </div>
              </div>
              <div class="text-right space-y-1.5">
                <Skeleton class="h-4 w-16 ml-auto" />
                <Skeleton class="h-3 w-10 ml-auto" />
              </div>
            </div>
          {/each}
        {:else}
          {#each customerRows as row}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full {row.avatarBg} flex items-center justify-center shrink-0 text-white text-xs font-bold select-none">
                  {row.initials}
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">{row.name}</p>
                  <p class="text-xs text-muted-foreground flex items-center gap-1">
                    <Icon iconName="icon/map-pin" size={10} />
                    {row.address} • {row.orders} {$_('totalOrders')}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-foreground">{fmtCurrency(row.revenue)}</p>
                <p class="text-[10px] text-muted-foreground">{$_('revenue')}</p>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  </div>

    <!-- ── ROW 3: Customers Table  |  Stock Distribution ── -->
    <div class="{COL} items-stretch" id="topMerchantsSection">

    <div class="bg-card border border-border rounded-lg p-4 h-full" id="topMerchantsSection">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon iconName="icon/users" size={15} class="text-orange-400" />
          {$_('topMerchants')}
        </h3>
        <a href="/dashboard/merchants" class="text-xs text-info hover:underline">{$_('viewAll')}</a>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr class="text-left text-xs text-muted-foreground uppercase">
              <th class="px-3 py-2 font-medium">{$_('merchant')}</th>
              <th class="px-3 py-2 font-medium text-right">{$_('revenue')}</th>
              <th class="px-3 py-2 font-medium text-right">{$_('totalOrders')}</th>
              <th class="px-3 py-2 font-medium text-right">{$_('totalOutstanding')}</th>
              <th class="px-3 py-2 font-medium text-center">{$_('actions')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            {#if loading}
              {#each [1,2,3,4,5] as _}
                <tr>
                  <td class="px-3 py-2.5"><Skeleton class="h-4 w-28" /></td>
                  <td class="px-3 py-2.5"><Skeleton class="h-4 w-16 ml-auto" /></td>
                  <td class="px-3 py-2.5"><Skeleton class="h-4 w-10 ml-auto" /></td>
                  <td class="px-3 py-2.5"><Skeleton class="h-4 w-16 ml-auto" /></td>
                  <td class="px-3 py-2.5"><Skeleton class="h-4 w-8 mx-auto" /></td>
                </tr>
              {/each}
            {:else}
              {#each merchantRows as merchant}
                <tr class="hover:bg-muted/20 transition-colors">
                  <td class="px-3 py-2.5 text-foreground">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-full {merchant.avatarBg} flex items-center justify-center shrink-0 text-white text-xs font-bold select-none">
                        {merchant.initials}
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="text-sm text-foreground font-medium truncate">{merchant.name}</span>
                        <span class="text-xs text-muted-foreground truncate">{merchant.phone}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-foreground text-right font-semibold">{fmtCurrency(merchant.revenue)}</td>
                  <td class="px-3 py-2.5 text-muted-foreground text-right">{merchant.salesCount}</td>
                  <td class="px-3 py-2.5 text-muted-foreground text-right">{fmtCurrency(merchant.outstanding)}</td>
                  <td class="px-3 py-2.5 text-center">
                    <button
                      onclick={() => goto(`/dashboard/merchants/${merchant.id}`)}
                      class="p-1 rounded hover:bg-muted transition-colors"
                      aria-label={$_('view')}
                    >
                      <Icon iconName="icon/eye" size={15} class="text-muted-foreground hover:text-foreground" />
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-card border border-border rounded-lg p-6 flex flex-col gap-6 h-full">

      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon iconName="icon/bar-chart" size={15} class="text-pink-400" />
          {$_('stockDistribution')}
        </h3>
      </div>

      {#if loading}
        <div class="flex items-center gap-4">
          <Skeleton class="w-36 h-36 rounded-full" />
          <div class="flex-1 space-y-3">
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
            <Skeleton class="h-10 w-full" />
          </div>
        </div>
      {:else if donutSeries.length > 0}
        <div>
          <div use:donutChartAction class="w-full"></div>
        </div>
        <div class="flex flex-col gap-4">
          {#each stockDistributionData as item}
            <div class="flex items-start gap-2">
              <span class="w-1.5 h-9 {item.color} rounded-full shrink-0 mt-0.5"></span>
              <div>
                <p class="text-xs text-muted-foreground">{item.label}</p>
                <p class="text-sm font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      <div class="mt-auto space-y-3">
        <h3 class="text-sm font-semibold text-foreground">{$_('categoryStatistics')}</h3>
        <div class="border border-border rounded-lg divide-y divide-border">
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span class="text-muted-foreground">{$_('totalCategories')}</span>
            </div>
            <span class="font-bold text-foreground">{categoryStats.categories}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span class="text-muted-foreground">{$_('totalProducts')} {$_('quantity')}</span>
            </div>
            <span class="font-bold text-foreground">{categoryStats.products.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
