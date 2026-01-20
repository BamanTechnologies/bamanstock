<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  const kpiCards = [
    {
      label: "Total Revenue",
      value: "$48,988.78",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart",
      iconColor: "bg-green-100",
    },
    {
      label: "Profit",
      value: "$8,458,798",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/trending-up",
      iconColor: "bg-blue-100",
    },
    {
      label: "Total Merchants",
      value: "521",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/users",
      iconColor: "bg-orange-100",
    },
  ];

  const topMerchants = [
    {
      name: "Richard Wilson",
      branch: "Branch 1",
      sales: "247+ Sales",
      revenue: "$8965",
    },
    {
      name: "Stan Gaunter",
      branch: "Branch 32",
      sales: "160+ Sales",
      revenue: "$8024.05",
    },
    {
      name: "Carlos Curran",
      branch: "Branch 6",
      sales: "89+ Sales",
      revenue: "$6245.80",
    },
    {
      name: "Beth Noah",
      branch: "Branch 9",
      sales: "48+ Sales",
      revenue: "$3490.48",
    },
    {
      name: "Yohannes Abayneh",
      branch: "Branch 2",
      sales: "40+ Sales",
      revenue: "$1590.78",
    },
  ];

  const stockDistribution = [
    {
      label: "Electronics",
      color: "bg-blue-500",
      percent: "50%",
      value: "698 Sales",
    },
    {
      label: "Clothing",
      color: "bg-yellow-400",
      percent: "24%",
      value: "545 Sales",
    },
    {
      label: "Furniture",
      color: "bg-green-500",
      percent: "16%",
      value: "456 Sales",
    },
  ];

  const tableRows = Array(8).fill({
    merchant: "Stan Gaunter",
    date: "24 Dec 2024",
    period: "Q2 2025",
    status: "Active",
  });
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Top Row: Welcome + Right Profile Summary -->
  <div
    class="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6"
  >
    <!-- Left: Welcome + KPI cards + Chart + Table -->
    <div class="space-y-6">
      <!-- Welcome + KPI cards -->
      <div class="bg-card border border-border rounded-lg p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-foreground">Welcome, Alex</h2>
          <div class="hidden md:flex items-center gap-3">
            <div class="relative w-72">
              <input
                type="text"
                placeholder="Search"
                class="w-full rounded-full border border-border pl-10 pr-4 py-2 text-sm bg-background"
              />
              <Icon
                iconName="icon/search"
                size={18}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {#each kpiCards as kpi}
            <div class="bg-card border border-border rounded-lg p-5">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <p
                    class="text-xs uppercase text-muted-foreground tracking-wide"
                  >
                    {kpi.label}
                  </p>
                </div>
                <div
                  class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center"
                >
                  <Icon iconName={kpi.icon} size={20} class="text-foreground" />
                </div>
              </div>
              <p class="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
              <p
                class="text-xs {kpi.changeType === 'positive'
                  ? 'text-green-600'
                  : 'text-red-600'}"
              >
                {kpi.change}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Revenue Over Time + Table -->
      <div class="bg-card border border-border rounded-lg p-6 space-y-6">
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Revenue Over Time -->
          <div class="w-full lg:w-2/3 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-muted-foreground">Revenue Over Time</p>
                <p class="text-2xl font-bold text-foreground">$1.25M</p>
                <p class="text-sm text-green-600">Last 12 Months +15.2%</p>
              </div>
              <div class="flex gap-2">
                {#each ["1D", "1W", "1M", "3M", "6M", "1Y"] as period}
                  <button
                    class="px-3 py-1 text-xs rounded {period === '1Y'
                      ? 'bg-info text-info-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
                  >
                    {period}
                  </button>
                {/each}
              </div>
            </div>

            <!-- Chart placeholder -->
            <div
              class="h-56 bg-muted/30 rounded-lg flex items-end px-6 pb-6 gap-3"
            >
              {#each ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] as month, i}
                <div class="flex flex-col items-center flex-1 gap-2">
                  <div
                    class="w-full rounded-t-full bg-info/60"
                    style={`height: ${20 + (i % 4) * 15}%`}
                  ></div>
                  <span class="text-[10px] text-muted-foreground">{month}</span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Stock Distribution -->
          <div class="w-full lg:w-1/3 space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-foreground">
                Stock Distribution
              </h3>
              <button
                class="text-xs text-muted-foreground border border-border rounded px-2 py-1"
              >
                Weekly
              </button>
            </div>
            <div class="flex items-center justify-center">
              <!-- Donut placeholder -->
              <div class="relative w-40 h-40">
                <div class="absolute inset-0 rounded-full bg-blue-500/70"></div>
                <div
                  class="absolute inset-3 rounded-full bg-yellow-400/80"
                ></div>
                <div
                  class="absolute inset-6 rounded-full bg-green-500/90"
                ></div>
                <div class="absolute inset-10 rounded-full bg-card"></div>
              </div>
            </div>
            <div class="space-y-2">
              {#each stockDistribution as item}
                <div class="flex items-center justify-between text-xs">
                  <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full {item.color}"></span>
                    <span class="text-muted-foreground">{item.label}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-foreground"
                      >{item.percent}</span
                    >
                    <span class="text-muted-foreground">{item.value}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </div>

        <!-- Merchant table summary -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-semibold text-foreground">Merchant</h3>
            <button class="text-xs text-info hover:underline">View All</button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-muted/50">
                <tr>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    Merchant
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    Date
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    Period
                  </th>
                  <th
                    class="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                  >
                    Status
                  </th>
                  <th
                    class="px-4 py-2 text-right text-xs font-medium text-muted-foreground"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {#each tableRows as row}
                  <tr class="border-b border-border hover:bg-muted/40">
                    <td
                      class="px-4 py-2 text-foreground flex items-center gap-2"
                    >
                      <div
                        class="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                      >
                        <Icon iconName="icon/user" size={16} />
                      </div>
                      <span>{row.merchant}</span>
                    </td>
                    <td class="px-4 py-2 text-muted-foreground">{row.date}</td>
                    <td class="px-4 py-2 text-muted-foreground">{row.period}</td
                    >
                    <td class="px-4 py-2">
                      <span
                        class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border bg-green-100 text-green-800 border-green-200"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"
                        ></span>
                        {row.status}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-right text-muted-foreground">
                      <div class="inline-flex items-center gap-2">
                        <Icon
                          iconName="icon/eye"
                          size={16}
                          class="cursor-pointer"
                        />
                        <Icon
                          iconName="icon/edit"
                          size={16}
                          class="cursor-pointer"
                        />
                        <Icon
                          iconName="icon/trash"
                          size={16}
                          class="cursor-pointer text-destructive"
                        />
                      </div>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Right column: Top merchants & summary -->
    <div class="space-y-6">
      <!-- Top Merchants -->
      <div class="bg-card border border-border rounded-lg p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-foreground">Top Merchants</h3>
          <button
            class="text-xs text-muted-foreground border border-border rounded px-2 py-1"
          >
            Today
          </button>
        </div>
        <div class="space-y-3">
          {#each topMerchants as merchant}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                >
                  <Icon iconName="icon/user" size={16} />
                </div>
                <div>
                  <p class="text-sm font-medium text-foreground">
                    {merchant.name}
                  </p>
                  <p class="text-xs text-muted-foreground">
                    {merchant.branch} • {merchant.sales}
                  </p>
                </div>
              </div>
              <p class="text-sm font-semibold text-foreground">
                {merchant.revenue}
              </p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Category statistics -->
      <div class="bg-card border border-border rounded-lg p-6 space-y-4">
        <h3 class="text-sm font-semibold text-foreground">
          Category Statistics
        </h3>
        <div class="space-y-3 text-sm">
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Total Number Of Categories</span
            >
            <span class="font-semibold text-foreground">89</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-muted-foreground">Total Number Of Products</span>
            <span class="font-semibold text-foreground">613</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
