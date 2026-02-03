<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

 
  const kpiCards = [
    {
      label: "Total Sales",
      value: "$29,350.89",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart",
      iconColor: "bg-cyan-100",
    },
    {
      label: "Total Order",
      value: "82",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/shopping-cart",
      iconColor: "bg-blue-100",
    },
    {
      label: "Pending Payments",
      value: "$19,003.75",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/dollar-sign",
      iconColor: "bg-purple-100",
    },
    {
      label: "Outstanding Credit",
      value: "$12,348.90",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/credit-card",
      iconColor: "bg-red-100",
    },
  ];


  const recentPayments = Array(7).fill({
    customer: "Stan Gaunter",
    amount: "$1396.45",
    date: "24 Dec 2024",
    orderId: "SG202",
  });


  const topSellingItems = [
    { name: "Beats Pro", sold: "14 Units Sold", revenue: "$3279.40" },
    { name: "Lenovo IdeaPad 3", sold: "7 Units Sold", revenue: "$14,694" },
    {
      name: "Apple Series 5 Watch",
      sold: "24 Units Sold",
      revenue: "$11,739.31",
    },
    { name: "Gaming Chair", sold: "14 Units Sold", revenue: "$34,595.01" },
    { name: "Iphone 14 Pro", sold: "4 Units Sold", revenue: "$3589.99" },
  ];
</script>

<div class="flex-1 p-6 space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-semibold text-foreground">Welcome, Alex</h2>
    <div
      class="flex items-center gap-2 bg-card border border-border rounded px-3 py-1.5 text-xs text-muted-foreground"
    >
      <Icon iconName="icon/calendar" size={14} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each kpiCards as kpi}
      <div class="bg-card border border-border rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="space-y-1">
            <p class="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p class="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
          <div
            class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center"
          >
            <Icon
              iconName={kpi.icon as any}
              size={20}
              class="text-foreground"
            />
          </div>
        </div>
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

  <div class="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-6">
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-semibold text-foreground">Weekly Sales Trend</h3>
          <div
            class="text-xs border border-border rounded px-2 py-1 text-muted-foreground"
          >
            01 Jan 2024 - 07 Jan 2024
          </div>
        </div>
        <div
          class="h-64 bg-muted/20 rounded flex items-center justify-center text-muted-foreground italic"
        >
          [Sales Trend Chart Visualization]
        </div>
      </div>

      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-foreground">Recent Payments</h3>
          <button class="text-xs text-info hover:underline">View All</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-muted/30">
              <tr class="text-left text-xs text-muted-foreground">
                <th class="px-4 py-3">Customer Name</th>
                <th class="px-4 py-3">Amount</th>
                <th class="px-4 py-3">Date</th>
                <th class="px-4 py-3">Order ID</th>
                <th class="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {#each recentPayments as row}
                <tr class="border-b border-border hover:bg-muted/20">
                  <td class="px-4 py-3 text-foreground">{row.customer}</td>
                  <td class="px-4 py-3 text-foreground">{row.amount}</td>
                  <td class="px-4 py-3 text-muted-foreground">{row.date}</td>
                  <td class="px-4 py-3 text-muted-foreground">{row.orderId}</td>
                  <td class="px-4 py-3 text-right">
                    <button class="p-1 hover:bg-muted rounded"
                      ><Icon iconName="icon/eye" size={14} /></button
                    >
                    <button class="p-1 hover:bg-muted rounded ml-1"
                      ><Icon iconName="icon/download" size={14} /></button
                    >
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-foreground">Top Selling Items</h3>
          <button class="text-xs border border-border rounded px-2 py-1"
            >Today</button
          >
        </div>
        <div class="space-y-4">
          {#each topSellingItems as item}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded bg-muted flex items-center justify-center"
                >
                  <Icon iconName="icon/box" size={16} />
                </div>
                <div>
                  <p class="text-sm font-medium">{item.name}</p>
                  <p class="text-[10px] text-muted-foreground">{item.sold}</p>
                </div>
              </div>
              <p class="text-sm font-semibold">{item.revenue}</p>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>
