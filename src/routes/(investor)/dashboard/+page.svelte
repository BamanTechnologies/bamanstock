<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

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

  const topMerchants = [
    { name: "Richard Wilson", initials: "RW", avatarBg: "bg-indigo-500", avatar: "/21fba97ec5e7fbb8a86b53a3d54af05c22aa2a5f.jpg", branch: "Branch 1",  sales: "247+ Sales", revenue: "$8965" },
    { name: "Stan Gaunter",   initials: "SG", avatarBg: "bg-teal-500",   avatar: "/Yohannes Abayneh.png",                         branch: "Branch 32", sales: "160+ Sales", revenue: "$8024.05" },
    { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-orange-500", avatar: "",                                               branch: "Branch 6",  sales: "89+ Sales",  revenue: "$6245.80" },
    { name: "Carlos Curran",  initials: "CC", avatarBg: "bg-amber-500",  avatar: "",                                               branch: "Branch 9",  sales: "78+ Sales",  revenue: "$3490.48" },
    { name: "Beth Noah",      initials: "BN", avatarBg: "bg-rose-500",   avatar: "",                                               branch: "Branch 7",  sales: "46+ Sales",  revenue: "$1590.78" },
  ];

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
          <p class="text-2xl font-bold text-foreground">$1.25M</p>
          <p class="text-sm text-green-600">Last 12 Months <span class="font-medium">+15.2%</span></p>
        </div>
        <div class="flex gap-1.5">
          {#each ["1D", "1W", "1M", "3M", "6M", "1Y"] as period}
            <button class="px-2.5 py-1 text-xs rounded {period === '1Y' ? 'bg-info text-info-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}">
              {period}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex gap-3">
        <div class="flex flex-col justify-between text-[10px] text-muted-foreground pb-5 w-7 shrink-0 text-right">
          <span>60k</span>
          <span>50k</span>
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
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
            <path
              d="M0,115 C40,105 80,92 130,98 C180,104 220,84 270,74 C310,66 360,86 405,52 C445,22 490,94 535,86 C575,79 615,94 660,99 C705,104 755,100 810,103 L860,104 L860,170 L0,170 Z"
              fill="url(#revGrad)"
            />
            <path
              d="M0,115 C40,105 80,92 130,98 C180,104 220,84 270,74 C310,66 360,86 405,52 C445,22 490,94 535,86 C575,79 615,94 660,99 C705,104 755,100 810,103 L860,104"
              fill="none" stroke="#60a5fa" stroke-width="2"
            />
            {#each [[0,115],[130,98],[270,74],[405,52],[535,86],[660,99],[810,103],[860,104]] as [cx,cy]}
              <circle {cx} {cy} r="4" fill="#60a5fa" />
            {/each}
          </svg>
          <div class="absolute bottom-0 left-0 right-0 flex justify-between">
            {#each ["Jan","Feb","Mar","Apr","May","Jun","July","Aug","Sep"] as m}
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
        <button class="text-xs text-muted-foreground border border-border rounded px-2 py-1 flex items-center gap-1">
          <Icon iconName="icon/calendar" size={12} />
          Today
        </button>
      </div>

      <div class="space-y-4">
        {#each topMerchants as merchant}
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
        <button class="text-xs text-info hover:underline">View All</button>
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
            <circle cx="80" cy="80" r="56" fill="none" stroke="#22c55e" stroke-width="28"
              stroke-dasharray="56.3 351.9" stroke-dashoffset="0"
              transform="rotate(-90 80 80)" />
            <circle cx="80" cy="80" r="56" fill="none" stroke="#facc15" stroke-width="28"
              stroke-dasharray="84.5 351.9" stroke-dashoffset="-56.3"
              transform="rotate(-90 80 80)" />
            <circle cx="80" cy="80" r="56" fill="none" stroke="#3b82f6" stroke-width="28"
              stroke-dasharray="211.1 351.9" stroke-dashoffset="-140.8"
              transform="rotate(-90 80 80)" />
            <circle cx="80" cy="80" r="42" class="fill-card" />
            <circle cx="107" cy="31" r="13" fill="white" stroke="#e5e7eb" stroke-width="1" />
            <text x="107" y="35" font-size="8.5" fill="#374151" text-anchor="middle" font-weight="600">16%</text>
            <circle cx="130" cy="91" r="13" fill="white" stroke="#e5e7eb" stroke-width="1" />
            <text x="130" y="95" font-size="8.5" fill="#374151" text-anchor="middle" font-weight="600">24%</text>
            <circle cx="35" cy="113" r="13" fill="white" stroke="#e5e7eb" stroke-width="1" />
            <text x="35" y="117" font-size="8.5" fill="#374151" text-anchor="middle" font-weight="600">60%</text>
          </svg>
        </div>

        <div class="flex flex-col gap-4 flex-1">
          {#each stockDistribution as item}
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
            <span class="font-bold text-foreground">89</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
              <span class="text-muted-foreground">Total Number Of Products</span>
            </div>
            <span class="font-bold text-foreground">613</span>
          </div>
        </div>
      </div>

    </div>
  </div>

</div>
