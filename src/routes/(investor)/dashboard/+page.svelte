<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  let chartPeriod = $state("1Y");

  const periodData: Record<string, { labels: string[]; values: number[]; revenue: string; change: string; changePct: string; positive: boolean; yLabels: string[] }> = {
    "1D": { labels: ["6am","9am","12pm","3pm","6pm","9pm"], values: [12,38,58,44,62,30], revenue: "$4,280", change: "Today", changePct: "+3.2%", positive: true, yLabels: ["70","60","50","40","30","10"] },
    "1W": { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], values: [38,54,46,68,55,74,42], revenue: "$28,450", change: "Last 7 Days", changePct: "+8.5%", positive: true, yLabels: ["80k","70k","60k","50k","30k","10k"] },
    "1M": { labels: ["Wk1","Wk2","Wk3","Wk4"], values: [48,65,52,80], revenue: "$98,200", change: "Last 30 Days", changePct: "+12.1%", positive: true, yLabels: ["100k","80k","60k","40k","20k","10k"] },
    "3M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], values: [50,62,58,75,85,70], revenue: "$285,600", change: "Last 3 Months", changePct: "+18.7%", positive: true, yLabels: ["300k","250k","200k","150k","100k","50k"] },
    "6M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], values: [35,52,65,78,92,68], revenue: "$620,800", change: "Last 6 Months", changePct: "+14.3%", positive: true, yLabels: ["600k","500k","400k","300k","200k","100k"] },
    "1Y": { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep"], values: [45,35,55,80,38,25,38,22,30], revenue: "$1.25M", change: "Last 12 Months", changePct: "+15.2%", positive: true, yLabels: ["60k","50k","40k","30k","20k","10k"] },
  };

  function toSvgPath(values: number[], w = 860, h = 170, topPad = 18, botPad = 8) {
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

  const activeChart = $derived(periodData[chartPeriod] ?? periodData["1Y"]);
  const svgChart = $derived(toSvgPath(activeChart.values));

  const kpiCards = [
    {
      label: "Total Revenue",
      value: "$48,988.78",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart" as const,
      iconColor: "bg-green-100 dark:bg-green-900/40",
    },
    {
      label: "Profit",
      value: "$8,458,798",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/trending-up" as const,
      iconColor: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      label: "Total Merchants",
      value: "521",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/users" as const,
      iconColor: "bg-orange-100 dark:bg-orange-900/40",
    },
    {
      label: "Total Stock",
      value: "1,284",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/box" as const,
      iconColor: "bg-red-100 dark:bg-red-900/40",
    },
  ];

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

  const stockDistribution = [
    { label: "Electronics", color: "bg-blue-500",   dotColor: "#3b82f6", percent: "60%", value: "698 Sales" },
    { label: "Clothing",    color: "bg-yellow-400", dotColor: "#facc15", percent: "24%", value: "545 Sales" },
    { label: "Furniture",   color: "bg-green-500",  dotColor: "#22c55e", percent: "16%", value: "456 Sales" },
  ];

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

  const COL = "grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6";

  let stockPeriod = $state("Weekly");
  let showStockDropdown = $state(false);
  const periodOptions = ["Daily", "Weekly", "Monthly", "Yearly"];

  let merchantsPeriod = $state("Today");
  let showMerchantsDropdown = $state(false);
  const merchantsPeriodOptions = ["Today", "Last 7 Days", "Last 30 Days", "3 Months", "6 Months", "Year"];

  const activeTopMerchants = $derived(topMerchantsByPeriod[merchantsPeriod] ?? topMerchantsByPeriod["Last 7 Days"]);

  const CIRC = 351.9;

  const stockDistributionByPeriod: Record<string, { label: string; color: string; dotColor: string; stroke: string; percent: number; value: string }[]> = {
    "Daily":   [
      { label: "Electronics", color: "bg-blue-500",   dotColor: "#3b82f6", stroke: "#3b82f6", percent: 55, value: "125 Sales" },
      { label: "Clothing",    color: "bg-yellow-400", dotColor: "#facc15", stroke: "#facc15", percent: 28, value: "63 Sales"  },
      { label: "Furniture",   color: "bg-green-500",  dotColor: "#22c55e", stroke: "#22c55e", percent: 17, value: "38 Sales"  },
    ],
    "Weekly":  [
      { label: "Electronics", color: "bg-blue-500",   dotColor: "#3b82f6", stroke: "#3b82f6", percent: 58, value: "870 Sales"  },
      { label: "Clothing",    color: "bg-yellow-400", dotColor: "#facc15", stroke: "#facc15", percent: 26, value: "390 Sales"  },
      { label: "Furniture",   color: "bg-green-500",  dotColor: "#22c55e", stroke: "#22c55e", percent: 16, value: "240 Sales"  },
    ],
    "Monthly": [
      { label: "Electronics", color: "bg-blue-500",   dotColor: "#3b82f6", stroke: "#3b82f6", percent: 60, value: "698 Sales"  },
      { label: "Clothing",    color: "bg-yellow-400", dotColor: "#facc15", stroke: "#facc15", percent: 24, value: "545 Sales"  },
      { label: "Furniture",   color: "bg-green-500",  dotColor: "#22c55e", stroke: "#22c55e", percent: 16, value: "456 Sales"  },
    ],
    "Yearly":  [
      { label: "Electronics", color: "bg-blue-500",   dotColor: "#3b82f6", stroke: "#3b82f6", percent: 62, value: "7,450 Sales" },
      { label: "Clothing",    color: "bg-yellow-400", dotColor: "#facc15", stroke: "#facc15", percent: 22, value: "2,640 Sales" },
      { label: "Furniture",   color: "bg-green-500",  dotColor: "#22c55e", stroke: "#22c55e", percent: 16, value: "1,920 Sales" },
    ],
  };

  const categoryStatsByPeriod: Record<string, { categories: number; products: number }> = {
    "Daily":   { categories: 89, products: 226  },
    "Weekly":  { categories: 89, products: 415  },
    "Monthly": { categories: 89, products: 613  },
    "Yearly":  { categories: 89, products: 7350 },
  };

  const activeStockDist  = $derived(stockDistributionByPeriod[stockPeriod] ?? stockDistributionByPeriod["Monthly"]);
  const activeCategoryStats = $derived(categoryStatsByPeriod[stockPeriod] ?? categoryStatsByPeriod["Monthly"]);

  const donutSegments = $derived.by(() => {
    let cum = 0;
    return activeStockDist.map(item => {
      const dash = (item.percent / 100) * CIRC;
      const startAngle = -90 + (cum / 100) * 360;
      const midAngle   = startAngle + (item.percent / 100) * 180;
      const rad        = midAngle * Math.PI / 180;
      const lx = Math.round(80 + 70 * Math.cos(rad));
      const ly = Math.round(80 + 70 * Math.sin(rad));
      const seg = { ...item, dashArray: `${dash.toFixed(1)} ${CIRC}`, dashOffset: -(cum / 100) * CIRC, lx, ly };
      cum += item.percent;
      return seg;
    });
  });
</script>

<div class="flex-1 p-6 space-y-6">

  <!-- ── ROW 1: Welcome + KPI cards ── -->
  <div class="bg-card  p-6 space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold text-foreground">Welcome, Alex</h2>
      <div class="hidden md:flex items-center gap-3">

      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {#each kpiCards as kpi}
        <div class="bg-background border border-border rounded-lg p-5 flex flex-col gap-2">
          <div class="flex items-start justify-between">
            <p class="text-2xl font-bold text-foreground">{kpi.value}</p>
            <div class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
              <Icon iconName={kpi.icon} size={20} class="text-foreground" />
            </div>
          </div>
          <p class="text-sm text-muted-foreground">{kpi.label}</p>
          <div class="border-t border-border"></div>
          <p class="text-xs font-medium {kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-500'}">
            {kpi.change}
          </p>
        </div>
      {/each}
    </div>
  </div>

  <!-- ── ROW 2: Revenue Over Time  |  Top Merchants (parallel) ── -->
  <div class={COL}>

    <div class="bg-card border border-border rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm text-muted-foreground">Revenue Over Time</p>
          <p class="text-2xl font-bold text-foreground">{activeChart.revenue}</p>
          <p class="text-sm {activeChart.positive ? 'text-green-600' : 'text-red-500'}">{activeChart.change} <span class="font-medium">{activeChart.changePct}</span></p>
        </div>
        <div class="flex gap-1.5">
          {#each ["1D", "1W", "1M", "3M", "6M", "1Y"] as period}
            <button
              type="button"
              onclick={() => (chartPeriod = period)}
              class="px-2.5 py-1 text-xs rounded transition-colors {chartPeriod === period ? 'bg-info text-info-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
            >
              {period}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col justify-between text-[10px] text-muted-foreground pb-5 w-7 shrink-0 text-right">
          {#each activeChart.yLabels as label}
            <span>{label}</span>
          {/each}
        </div>

        <div class="flex-1 relative h-52">
          <svg viewBox="0 0 860 170" class="w-full h-full" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stop-color="#60a5fa" stop-opacity="0.28" />
                <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.02" />
              </linearGradient>
            </defs>
            {#each [0, 34, 68, 102, 136, 170] as y}
              <line x1="0" y1={y} x2="860" y2={y} stroke="currentColor" stroke-opacity="0.06" stroke-width="1" />
            {/each}
            <path d={svgChart.fill} fill="url(#revGrad)" />
            <path d={svgChart.line} fill="none" stroke="#60a5fa" stroke-width="2" />
            {#each svgChart.pts as pt}
              <circle cx={pt.x} cy={pt.y} r="4" fill="#60a5fa" />
            {/each}
          </svg>
          <div class="absolute bottom-0 left-0 right-0 flex justify-between">
            {#each activeChart.labels as m}
              <span class="text-[10px] text-muted-foreground">{m}</span>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-card border border-border rounded-lg p-6 space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon iconName="icon/users" size={15} class="text-orange-400" />
          Top Merchants
        </h3>
        <div class="relative">
          <button
            type="button"
            onclick={() => (showMerchantsDropdown = !showMerchantsDropdown)}
            class="text-xs text-muted-foreground border border-border rounded px-2 py-1 flex items-center gap-1"
          >
            <Icon iconName="icon/calendar" size={12} />
            {merchantsPeriod}
            <Icon iconName="icon/chevron-down" size={11} />
          </button>
          {#if showMerchantsDropdown}
            <div class="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden min-w-36">
              {#each merchantsPeriodOptions as opt}
                <button
                  type="button"
                  onclick={() => { merchantsPeriod = opt; showMerchantsDropdown = false; }}
                  class="block w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors {opt === merchantsPeriod ? 'text-info font-semibold' : 'text-foreground'}"
                >{opt}</button>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <div class="space-y-4">
        {#each activeTopMerchants as merchant}
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              {#if merchant.avatar}
                <img
                  src={merchant.avatar}
                  alt={merchant.name}
                  class="w-9 h-9 rounded-full object-cover shrink-0"
                />
              {:else}
                <div class="w-9 h-9 rounded-full {merchant.avatarBg} flex items-center justify-center shrink-0 text-white text-xs font-bold select-none">
                  {merchant.initials}
                </div>
              {/if}
              <div>
                <p class="text-sm font-medium text-foreground">{merchant.name}</p>
                <p class="text-xs text-muted-foreground flex items-center gap-1">
                  <Icon iconName="icon/map-pin" size={10} />
                  {merchant.branch} • {merchant.sales}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-foreground">{merchant.revenue}</p>
              <p class="text-[10px] text-muted-foreground">Revenue</p>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- ── ROW 3: Merchant Table  |  Stock Distribution + Category Stats (parallel) ── -->
  <div class="{COL} items-stretch">

    <div class="bg-card border border-border rounded-lg p-6 h-full">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-semibold text-foreground">Merchant</h3>
        <a href="/dashboard/merchants" class="text-xs text-info hover:underline">View All</a>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Merchant</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">
                Date <span class="ml-0.5">↑</span>
              </th>
              <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Period</th>
              <th class="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
              <th class="px-3 py-2 text-right text-xs font-medium text-muted-foreground"></th>
            </tr>
          </thead>
          <tbody>
            {#each tableRows as row}
              <tr class="border-b border-border hover:bg-muted/40">
                <td class="px-3 py-2.5 text-foreground">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <Icon iconName="icon/user" size={14} />
                    </div>
                    <span class="text-sm">{row.merchant}</span>
                  </div>
                </td>
                <td class="px-3 py-2.5 text-muted-foreground text-sm">{row.date}</td>
                <td class="px-3 py-2.5 text-muted-foreground text-sm">{row.period}</td>
                <td class="px-3 py-2.5">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                    <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {row.status}
                  </span>
                </td>
                <td class="px-3 py-2.5 text-right">
                  <div class="inline-flex items-center gap-2 text-muted-foreground">
                    <Icon iconName="icon/eye"      size={15} class="cursor-pointer hover:text-foreground" />
                    <Icon iconName="icon/download" size={15} class="cursor-pointer hover:text-foreground" />
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="bg-card border border-border rounded-lg p-6 flex flex-col gap-6 h-full">

      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-foreground flex items-center gap-2">
          <Icon iconName="icon/bar-chart" size={15} class="text-pink-400" />
          Stock Distribution
        </h3>
        <div class="relative">
          <button
            onclick={() => (showStockDropdown = !showStockDropdown)}
            class="text-xs text-muted-foreground border border-border rounded px-2 py-1 flex items-center gap-1"
          >
            <Icon iconName="icon/calendar" size={12} />
            {stockPeriod}
            <Icon iconName="icon/chevron-down" size={11} />
          </button>
          {#if showStockDropdown}
            <div class="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-md z-20 overflow-hidden min-w-22.5">
              {#each periodOptions as opt}
                <button
                  onclick={() => { stockPeriod = opt; showStockDropdown = false; }}
                  class="block w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors {opt === stockPeriod ? 'text-info font-semibold' : 'text-foreground'}"
                >
                  {opt}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      </div>


      <div class="flex items-center gap-4">

        <div class="shrink-0">
          <svg viewBox="0 0 160 160" class="w-36 h-36">
            {#each donutSegments as seg}
              <circle cx="80" cy="80" r="56" fill="none" stroke={seg.stroke} stroke-width="28"
                stroke-dasharray={seg.dashArray}
                stroke-dashoffset={seg.dashOffset}
                transform="rotate(-90 80 80)" />
            {/each}
            <circle cx="80" cy="80" r="42" class="fill-card" />
            {#each donutSegments as seg}
              <circle cx={seg.lx} cy={seg.ly} r="13" fill="white" stroke="#e5e7eb" stroke-width="1" />
              <text x={seg.lx} y={seg.ly + 4} font-size="8.5" fill="#374151" text-anchor="middle" font-weight="600">{seg.percent}%</text>
            {/each}
          </svg>
        </div>

        <div class="flex flex-col gap-4 flex-1">
          {#each activeStockDist as item}
            <div class="flex items-start gap-2">
              <span class="w-1.5 h-9 {item.color} rounded-full shrink-0 mt-0.5"></span>
              <div>
                <p class="text-xs text-muted-foreground">{item.label}</p>
                <p class="text-sm font-bold text-foreground">{item.value}</p>
              </div>
            </div>
          {/each}
        </div>

      </div>

      <div class="mt-auto space-y-3">
        <h3 class="text-sm font-semibold text-foreground">Category Statistics</h3>
        <div class="border border-border rounded-lg divide-y divide-border">
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span class="text-muted-foreground">Total Number Of Categories</span>
            </div>
            <span class="font-bold text-foreground">{activeCategoryStats.categories}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span class="text-muted-foreground">Total Number Of Products</span>
            </div>
            <span class="font-bold text-foreground">{activeCategoryStats.products.toLocaleString()}</span>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
