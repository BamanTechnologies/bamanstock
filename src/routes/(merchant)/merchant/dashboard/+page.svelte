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
            <p class="text-2xl font-bold text-slate-900">{kpi.value}</p>
            <p class="text-xs font-medium text-slate-500 uppercase tracking-wider">{kpi.label}</p>
          </div>
          <div class="{kpi.iconColor} w-12 h-12 rounded-xl flex items-center justify-center">
            <Icon iconName={kpi.icon as any} size={24} />
          </div>
        </div>
        <hr class="my-4 border-slate-100" />
        <p class="text-sm font-semibold {kpi.changeType === 'positive' ? 'text-emerald-500' : 'text-rose-500'}">
          {kpi.change}
        </p>
      </div>
    {/each}
  </div>

  <div class="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8">
    <div class="space-y-8">
     <div class="bg-white border border-slate-200 rounded-xl shadow-sm">
  <div class="flex items-center justify-between p-6 pb-4">
    <h3 class="text-xl font-bold text-slate-900">Weekly Sales Trend</h3>
    <div class="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-500">
      <Icon iconName="icon/calendar" size={16} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
  </div>

  <hr class="border-slate-100" />

  <div class="p-6">
    <div class="flex items-start justify-between mb-8">
      <div>
        <p class="text-3xl font-bold text-slate-900">$29,350.89</p>
        <p class="text-sm font-medium text-emerald-500">
          +40% <span class="text-slate-400 font-normal">increased from last year</span>
        </p>
      </div>
      <div class="flex items-center gap-2 text-sm text-slate-600 font-medium">
        <span class="w-3 h-3 rounded-full bg-[#3498db]"></span> Sales Amount
      </div>
    </div>

    <div class="h-64 flex items-end justify-between gap-4 px-2 relative">
      {#each [60, 45, 55, 35, 75, 85, 70] as height}
        <div class="w-full bg-slate-50 rounded-md relative h-full flex items-end">
          <div 
            class="w-full bg-[#3498db] rounded-md transition-all duration-500" 
            style="height: {height}%"
          ></div>
        </div>
      {/each}
    </div>

    <div class="flex justify-between mt-6 text-sm text-slate-400 font-medium">
      <span class="w-full text-center">Sun</span>
      <span class="w-full text-center">Mon</span>
      <span class="w-full text-center">Tue</span>
      <span class="w-full text-center">Wed</span>
      <span class="w-full text-center">Thu</span>
      <span class="w-full text-center">Fri</span>
      <span class="w-full text-center">Sat</span>
    </div>
  </div>
</div>

 <div class="flex items-center justify-between mb-4">
  <h3 class="text-xl font-bold text-slate-900">Recent Payments</h3>
  <button class="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
</div>

<div class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="uppercase">
        <tr class="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/80 border-b border-slate-100">
          <th class="px-6 py-4 font-medium">Customer Name</th>
          <th class="px-6 py-4 font-medium">Amount</th>
          <th class="px-6 py-4 font-medium flex items-center gap-1">
            Date <Icon iconName="icon/arrow-down" size={12} />
          </th>
          <th class="px-6 py-4 font-medium">Order ID</th>
          <th class="px-6 py-4"></th> </tr>
      </thead>
      <tbody class="divide-y divide-slate-50">
        {#each recentPayments as row}
          <tr class="hover:bg-slate-50/50 transition-colors">
            <td class="px-6 py-4 font-medium text-slate-700">{row.customer}</td>
            <td class="px-6 py-4 text-slate-700 font-semibold">{row.amount}</td>
            <td class="px-6 py-4 text-slate-500">{row.date}</td>
            <td class="px-6 py-4 text-slate-500">{row.orderId}</td>
            <td class="px-6 py-4 text-right space-x-2">
              <button class="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
                <Icon iconName="icon/eye" size={14} /> 
              </button>
              <button class="p-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
                <Icon iconName="icon/download" size={14} /> 
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
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
      <Icon iconName="icon/box" size={20} />
    </div>
    <h3 class="text-lg font-bold text-slate-900">Top Selling Items</h3>
  </div>
  
  <button class="text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 text-slate-600">
    <Icon iconName="icon/calendar" size={14} /> Today <Icon iconName="icon/chevron-down" size={12} />
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
          <p class="text-sm font-bold text-muted-foreground">{item.name}</p>
          <p class="text-xs text-muted-foreground">{item.sold}</p>
        </div>
      </div>
      <p class="text-sm font-bold text-slate-900">{item.revenue}</p>
    </div>
  {/each}
</div>
      </div>

<div class="bg-white border border-slate-200 rounded-xl shadow-sm">
  <div class="flex items-center justify-between p-6 border-b border-slate-100">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500">
        <Icon iconName="icon/credit-card" size={20} />
      </div>
      <h3 class="text-xl font-bold text-slate-900">Credit Alerts</h3> 
    </div>
    <button class="text-sm font-semibold text-[#4DA0E6] hover:opacity-80">View All</button>
  </div>

  <div class="divide-y divide-slate-100">
    {#each creditAlerts as alert}
      <div class="p-6">
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <p class="text-base font-bold text-slate-900">{alert.name}</p> 
            <div class="flex items-center gap-3">
              <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-500">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                {alert.status}
              </span>
              <span class="text-base font-medium text-slate-600">{alert.amount}</span> 
            </div>
          </div>
          
          <button class="px-6 py-2.5 bg-[#4DA0E6]/10 hover:bg-[#4DA0E6]/20 text-[#4DA0E6] text-sm font-semibold rounded-lg transition-colors">
            Send Reminder
          </button> 
        </div>
      </div>
    {/each}
  </div>
</div>  

</div>
  </div>
</div>