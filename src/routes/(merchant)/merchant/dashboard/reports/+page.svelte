<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";


  let activeTab = "Sales"; 

  const stockData = [
    { name: "Lenovo IdeaPad 3", category: "Computers", location: "Branch #2", sold: "05", remaining: 100, status: "Adequate" },
    { name: "Beats Pro", category: "Electronics", location: "Branch #2", sold: "10", remaining: 140, status: "Low" },
    { name: "Nike Jordan", category: "Shoe", location: "Branch #2", sold: "08", remaining: 300, status: "Out" },
    { name: "Apple Series 5 Watch", category: "Electronics", location: "Branch #2", sold: "10", remaining: 450, status: "Adequate" },
    { name: "Amazon Echo Dot", category: "Electronics", location: "Branch #2", sold: "05", remaining: 320, status: "Low" },
    { name: "Sanford Chair Sofa", category: "Furniture", location: "Branch #2", sold: "07", remaining: 650, status: "Out" },
    { name: "Red Premium Satchel", category: "Bags", location: "Branch #2", sold: "15", remaining: 700, status: "Adequate" },
    { name: "Iphone 14 Pro", category: "Phone", location: "Branch #2", sold: "12", remaining: 630, status: "Low" },
    { name: "Gaming Chair", category: "Furniture", location: "Branch #2", sold: "10", remaining: 410, status: "Out" },
    { name: "Borealis Backpack", category: "Bags", location: "Branch #2", sold: "20", remaining: 550, status: "Low" },
  ];


  const salesStats = [
    { label: "Total Revenue", value: "$40,565,000", growth: "25.5%", icon: "icon/package", color: "green" },
    { label: "Total Orders", value: "8690", growth: "12.2%", icon: "icon/alert-circle", color: "yellow" },
    { label: "Total Transaction", value: "4558", growth: "16.3%", icon: "icon/x-circle", color: "red" }
  ] as const;


  const salesData = [
    { id: "PT001", item: "Lenovo IdeaPad 3", customer: "Stan Gaunter", amount: "$3000", status: "Paid", date: "24 Dec 2024" },
    { id: "PT002", item: "Beats Pro", customer: "Stan Gaunter", amount: "$1600", status: "Partially Paid", date: "10 Dec 2024" },
    { id: "PT003", item: "Nike Jordan", customer: "Stan Gaunter", amount: "$880", status: "Not Paid", date: "27 Nov 2024" },
    { id: "PT004", item: "Apple Series 5 Watch", customer: "Stan Gaunter", amount: "$1200", status: "Paid", date: "18 Nov 2024" },
    { id: "PT005", item: "Amazon Echo Dot", customer: "Stan Gaunter", amount: "$400", status: "Partially Paid", date: "06 Nov 2024" },
    { id: "PT006", item: "Sanford Chair Sofa", customer: "Stan Gaunter", amount: "$2240", status: "Not Paid", date: "25 Oct 2024" },
    { id: "PT007", item: "Red Premium Satchel", customer: "Stan Gaunter", amount: "$900", status: "Paid", date: "14 Oct 2024" },
    { id: "PT008", item: "Iphone 14 Pro", customer: "Stan Gaunter", amount: "$6480", status: "Partially Paid", date: "03 Oct 2024" },
    { id: "PT009", item: "Gaming Chair", customer: "Stan Gaunter", amount: "$2000", status: "Not Paid", date: "14 Oct 2024" },
    { id: "PT010", item: "Borealis Backpack", customer: "Stan Gaunter", amount: "$900", status: "Partially Paid", date: "03 Oct 2024" },
  ];

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500 text-white";
      case "Partially Paid": return "bg-yellow-500 text-white";
      case "Not Paid": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };

  const getStockStatusClass = (status: string) => {
    switch (status) {
      case "Adequate": return "bg-green-500 text-white";
      case "Low": return "bg-yellow-500 text-white";
      case "Out": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };


  const distribution = [
    { label: "Electronics", value: 60 },
    { label: "Clothing", value: 50 },
    { label: "Home", value: 65 },
    { label: "Beauty", value: 40 },
    { label: "Sports", value: 85 },
    { label: "Toys", value: 90 },
    { label: "Furniture", value: 82 },
  ];
</script>

<div class="p-6 space-y-6 bg-[#F9FAFB] min-h-screen">
  <div class="flex items-center justify-between">
    <h1 class="text-xl font-bold">Reports</h1> 
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 bg-white border border-border px-3 py-2 rounded text-xs">
        <Icon iconName="icon/calendar" size={14} />
        <span>01 Jan 2024 - 07 Jan 2024</span>
      </div>
      <button class="bg-red-500 text-white px-4 py-2 rounded text-xs flex items-center gap-2 font-medium">
        <Icon iconName="icon/file-text" size={14} />
        Export Report 
      </button>
    </div>
  </div>

  <div class="flex gap-8 border-b border-border">
    {#each ["Sales", "Stock", "Credit & Payment"] as tab} 
      <button 
        class="pb-2 text-sm font-medium transition-colors {activeTab === tab ? 'text-info border-b-2 border-info' : 'text-muted-foreground'}"
        on:click={() => activeTab = tab}>
        {tab}
      </button>
    {/each}
  </div>

  {#if activeTab === "Sales"}
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-4 space-y-4">
        {#each salesStats as stat}
          <div class="bg-white p-5 rounded-lg border border-border flex justify-between items-start">
            <div>
              <p class="text-xs text-muted-foreground flex items-center gap-2 font-medium">
                <span class="p-1 bg-{stat.color}-50 rounded text-{stat.color}-600">
                  <Icon iconName={stat.icon} size={14} />
                </span> 
                {stat.label}
              </p>
              <h2 class="text-xl font-bold mt-2">{stat.value}</h2>
              <span class="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">
                {stat.growth} From Last Month
              </span>
            </div>
            <button class="text-gray-400"><Icon iconName="icon/more-vertical" size={16} /></button>
          </div>
        {/each}
      </div>

      <div class="lg:col-span-8 bg-white p-6 rounded-lg border border-border">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-sm font-medium text-muted-foreground">Revenue Over Time</h3>
            <h2 class="text-2xl font-bold">$690,237.90</h2>
            <p class="text-[10px] text-muted-foreground">Last 12 Months <span class="text-green-500">+15.2%</span></p>
          </div>
          <div class="flex bg-gray-50 p-1 rounded-md">
            {#each ['1D', '1W', '1M', '3M', '6M', '1Y'] as range}
                <button class="px-3 py-1 text-[10px] rounded {range === '1Y' ? 'bg-info text-white' : 'text-muted-foreground'}">{range}</button>
            {/each}
          </div>
        </div>
        <div class="h-48 w-full bg-slate-50/50 rounded flex items-end justify-between px-4 pb-2 border-b">
           {#each Array(10) as _, i}
            <div class="w-1.5 bg-info/20 rounded-t-full" style="height: {Math.random() * 80 + 20}%"></div>
           {/each}
        </div>
        <div class="flex justify-between mt-2 text-[10px] text-muted-foreground px-1">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-5 gap-4">
      {#each ['Choose Date', 'Location', 'Merchant', 'Category', 'Products'] as label}
          <div class="flex flex-col gap-1.5">
              <label class="text-[10px] font-medium text-muted-foreground uppercase">{label}</label>
              <select class="bg-white border rounded px-3 py-2 text-xs"><option>All</option></select>
          </div>
      {/each}
    </div>

    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <div class="p-4 flex justify-between items-center border-b border-border">
        <h3 class="text-sm font-bold">Sales Report</h3>
        <div class="flex gap-2">
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/file-text" size={14} class="text-red-500"/></button>
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/file" size={14} class="text-green-500"/></button>
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/printer" size={14} class="text-gray-500"/></button>
        </div>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-[10px] uppercase text-muted-foreground"> 
          <tr>
            <th class="px-6 py-4 w-10"><input type="checkbox" /></th>
            <th class="px-4 py-4">Order ID ⇅</th>
            <th class="px-4 py-4">Item Sold</th>
            <th class="px-4 py-4">Customer Name</th>
            <th class="px-4 py-4">Total Amount ⇅</th>
            <th class="px-4 py-4">Payment Status</th>
            <th class="px-4 py-4">Date ⇅</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each salesData as sale}
            <tr class="hover:bg-gray-50/50">
              <td class="px-6 py-4"><input type="checkbox" /></td> 
              <td class="px-4 py-4 text-xs font-medium text-muted-foreground">{sale.id}</td>
              <td class="px-4 py-4 font-medium flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-100 rounded"></div>
                <span class="text-xs">{sale.item}</span>
              </td>
              <td class="px-4 py-4 text-muted-foreground text-xs">{sale.customer}</td>
              <td class="px-4 py-4 text-xs font-bold">{sale.amount}</td>
              <td class="px-4 py-4">
                <span class="px-2 py-0.5 rounded text-[9px] font-bold {getPaymentStatusClass(sale.status)}">
                  {sale.status}
                </span>
              </td>
              <td class="px-4 py-4 text-muted-foreground text-xs">{sale.date}</td>
            </tr>
          {/each}
        </tbody>
      </table>
      
      <div class="p-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
        <div>Row Per Page <select class="border rounded mx-2 p-1"><option>10</option></select> Entries</div>
        <div class="flex gap-1 items-center">
            <button class="px-2 py-1">{"<"}</button>
            <button class="px-2 py-1">1</button>
            <button class="px-2 py-1">2</button>
            <button class="px-2 py-1">3</button>
            <button class="px-2 py-1 bg-info text-white rounded-full px-3">4</button>
            <span class="px-1">...</span>
            <button class="px-2 py-1">15</button>
            <button class="px-2 py-1">{">"}</button>
        </div>
      </div>
    </div>

  {:else if activeTab === "Stock"}
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg border border-border">
        <p class="text-xs text-muted-foreground flex items-center gap-2 font-medium">
          <span class="p-1 bg-green-50 rounded text-green-600"><Icon iconName="icon/package" size={14} /></span> Total Items
        </p>
        <h2 class="text-2xl font-bold mt-2">1340 Units</h2>
        <span class="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">25.5% From Last Month</span>
      </div>
      <div class="bg-white p-6 rounded-lg border border-border">
        <p class="text-xs text-muted-foreground flex items-center gap-2 font-medium">
          <span class="p-1 bg-yellow-50 rounded text-yellow-600"><Icon iconName="icon/alert-circle" size={14} /></span> Low Stock Items
        </p>
        <h2 class="text-2xl font-bold mt-2">27</h2>
        <span class="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">12.2% From Last Month</span>
      </div>
      <div class="bg-white p-6 rounded-lg border border-border">
        <p class="text-xs text-muted-foreground flex items-center gap-2 font-medium">
          <span class="p-1 bg-red-50 rounded text-red-600"><Icon iconName="icon/x-circle" size={14} /></span> Out of Stocks Items
        </p>
        <h2 class="text-2xl font-bold mt-2">87</h2>
        <span class="text-[10px] text-green-500 bg-green-50 px-2 py-0.5 rounded-full mt-2 inline-block">16.3% From Last Month</span>
      </div>
    </div>

    <div class="bg-white p-6 border border-border rounded-lg">
      <h3 class="text-sm font-bold mb-8">Stock Distribution</h3>
      <div class="flex items-end justify-around h-48 px-10">
        {#each distribution as item}
          <div class="flex flex-col items-center gap-2 w-full max-w-[60px]">
            <div class="w-full bg-gray-100 rounded-t-sm relative h-40">
                <div class="absolute bottom-0 w-full bg-info rounded-t-sm" style="height: {item.value}%"></div>
            </div>
          <span class="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="grid grid-cols-3 gap-6">
        <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-medium text-muted-foreground uppercase">Location</label>
            <select class="bg-white border rounded px-3 py-2 text-xs"><option>All</option></select>
        </div>
        <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-medium text-muted-foreground uppercase">Category</label>
            <select class="bg-white border rounded px-3 py-2 text-xs"><option>All</option></select>
        </div>
        <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-medium text-muted-foreground uppercase">Status</label>
            <select class="bg-white border rounded px-3 py-2 text-xs"><option>All</option></select>
        </div>
    </div>

    <div class="bg-white border border-border rounded-lg overflow-hidden">
      <div class="p-4 flex justify-between items-center border-b border-border">
        <h3 class="text-sm font-bold">Stock Report</h3>
        <div class="flex gap-2">
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/file-text" size={14} class="text-red-500"/></button>
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/file" size={14} class="text-green-500"/></button>
            <button class="p-1.5 border rounded hover:bg-gray-50"><Icon iconName="icon/printer" size={14} class="text-gray-500"/></button>
        </div>
      </div>
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-left text-[10px] uppercase text-muted-foreground"> 
          <tr>
            <th class="px-6 py-4 w-10"><input type="checkbox" /></th>
            <th class="px-4 py-4">Product Name</th>
            <th class="px-4 py-4">Category</th>
            <th class="px-4 py-4">Location</th>
            <th class="px-4 py-4">Sold Qty</th>
            <th class="px-4 py-4">Remaining</th>
            <th class="px-4 py-4">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each stockData as item}
            <tr class="hover:bg-gray-50/50">
              <td class="px-6 py-4"><input type="checkbox" /></td> 
              <td class="px-4 py-4 font-medium flex items-center gap-3">
                <div class="w-8 h-8 bg-gray-100 rounded"></div>
                {item.name}
              </td>
              <td class="px-4 py-4 text-muted-foreground text-xs">{item.category}</td>
              <td class="px-4 py-4 text-muted-foreground text-xs">{item.location}</td>
              <td class="px-4 py-4 text-xs">{item.sold}</td>
              <td class="px-4 py-4 text-xs">{item.remaining}</td>
              <td class="px-4 py-4">
                <span class="px-3 py-1 rounded-full text-[10px] {getStockStatusClass(item.status)}"> 
                  {item.status}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>