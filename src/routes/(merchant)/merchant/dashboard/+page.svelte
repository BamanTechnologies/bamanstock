<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";


  const kpiCards = [
    {
      label: "Total Sales",
      value: "$29,350.89",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart",
      iconColor: "bg-cyan-50 text-cyan-500",
    },
    {
      label: "Total Order",
      value: "82",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/shopping-cart",
      iconColor: "bg-blue-50 text-blue-500",
    },
    {
      label: "Pending Payments",
      value: "$19,003.75",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/dollar-sign",
      iconColor: "bg-purple-50 text-purple-500",
    },
    {
      label: "Outstanding Credit",
      value: "$12,348.90",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/credit-card",
      iconColor: "bg-red-50 text-red-500",
    },
  ];


  const recentPayments = [
    { customer: "Stan Gaunter", amount: "$1396.45", date: "24 Dec 2024", orderId: "SG202" },
    { customer: "Stan Gaunter", amount: "$890.50", date: "10 Dec 2024", orderId: "SG950" },
    { customer: "Stan Gaunter", amount: "$1790.01", date: "27 Nov 2024", orderId: "SG058" },
    { customer: "Stan Gaunter", amount: "$4020.89", date: "18 Nov 2024", orderId: "SG292" },
    { customer: "Stan Gaunter", amount: "$890.50", date: "06 Nov 2024", orderId: "SG081" },
    { customer: "Stan Gaunter", amount: "$1790.01", date: "25 Oct 2024", orderId: "SG650" },
    { customer: "Stan Gaunter", amount: "$4020.89", date: "14 Oct 2024", orderId: "SG192" },
  ];


  const topSellingItems = [
    { name: "Beats Pro", sold: "14 Units Sold", revenue: "$3279.40" },
    { name: "Lenovo IdeaPad 3", sold: "7 Units Sold", revenue: "$14,694" },
    { name: "Apple Series 5 Watch", sold: "24 Units Sold", revenue: "$11,739.31" },
    { name: "Gaming Chair", sold: "14 Units Sold", revenue: "$34,595.01" },
    { name: "Iphone 14 Pro", sold: "4 Units Sold", revenue: "$3589.99" },
  ];


  const creditAlerts = [
    { name: "Abdullah Ibrahim", status: "Overdue", amount: "$7,800" },
    { name: "Mike Steve", status: "Overdue", amount: "$7,800" },
    { name: "Mary Cooper", status: "Overdue", amount: "$7,800" },
    { name: "John Holland", status: "Overdue", amount: "$7,800" },
    { name: "John Holland", status: "Overdue", amount: "$7,800" },
  ];
</script>

<div class="flex-1 p-8 space-y-8 bg-slate-50/50">
  <div class="flex items-center justify-between">
    <h2 class="text-3xl font-bold text-slate-900">Welcome, Alex</h2>
    <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm text-slate-500 shadow-sm">
      <Icon iconName="icon/calendar" size={16} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {#each kpiCards as kpi}
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="space-y-1">
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
            <p class="text-2xl font-bold text-slate-900">{kpi.value}</p>
          </div>
          <div class="{kpi.iconColor} w-12 h-12 rounded-xl flex items-center justify-center">
            <Icon iconName={kpi.icon as any} size={24} />
          </div>
        </div>
        <p class="text-sm mt-4 font-semibold {kpi.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'}">
          {kpi.change}
        </p>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
    <div class="space-y-8">
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h3 class="text-lg font-bold text-slate-900">Weekly Sales Trend</h3>
            <p class="text-sm text-emerald-500 font-medium">+40% <span class="text-slate-400 font-normal">increased from last year</span></p>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span> Sales Amount
            </div>
            <div class="text-xs border border-slate-200 rounded-lg px-3 py-1.5 text-slate-500">
              01 Jan 2024 - 07 Jan 2024
            </div>
          </div>
        </div>
        <div class="h-64 flex items-end justify-between gap-4 px-2">
            {#each [60, 45, 55, 35, 75, 85, 70] as height}
                <div class="w-full bg-blue-500 rounded-t-md" style="height: {height}%"></div>
            {/each}
        </div>
        <div class="flex justify-between mt-4 text-xs text-slate-400 font-medium">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900">Recent Payments</h3>
          <button class="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th class="pb-4 font-medium">Customer Name</th>
                <th class="pb-4 font-medium">Amount</th>
                <th class="pb-4 font-medium">Date</th>
                <th class="pb-4 font-medium">Order ID</th>
                <th class="pb-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              {#each recentPayments as row}
                <tr class="hover:bg-slate-50/50 transition-colors">
                  <td class="py-4 font-medium text-slate-700">{row.customer}</td>
                  <td class="py-4 text-slate-700 font-semibold">{row.amount}</td>
                  <td class="py-4 text-slate-500">{row.date}</td>
                  <td class="py-4 text-slate-500">{row.orderId}</td>
                  <td class="py-4 text-right space-x-2">
                    <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Icon iconName="icon/eye" size={16} />
                    </button>
                    <button class="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <Icon iconName="icon/download" size={16} />
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="space-y-8">
      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900">Top Selling Items</h3>
          <button class="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-600">
            Today <Icon iconName="icon/chevron-down" size={12} />
          </button>
        </div>
        <div class="space-y-5">
          {#each topSellingItems as item}
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <Icon iconName="icon/box" size={20} />
                </div>
                <div>
                  <p class="text-sm font-bold text-slate-800">{item.name}</p>
                  <p class="text-xs text-slate-400">{item.sold}</p>
                </div>
              </div>
              <p class="text-sm font-bold text-slate-900">{item.revenue}</p>
            </div>
          {/each}
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-bold text-slate-900">Credit Alerts</h3>
          <button class="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div class="space-y-4">
          {#each creditAlerts as alert}
            <div class="p-4 rounded-xl border border-slate-100 bg-slate-50/30">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-bold text-slate-800">{alert.name}</p>
                <button class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md uppercase tracking-tight">
                  Send Reminder
                </button>
              </div>
              <div class="flex items-center gap-3">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-600 uppercase">
                  {alert.status}
                </span>
                <span class="text-sm font-bold text-slate-700">{alert.amount}</span>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>