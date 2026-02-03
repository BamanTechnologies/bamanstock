<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  let activeTab = "All Stock"; 
  

const allStocks = [
  { sku: "PT001", name: "Lenovo IdeaPad 3", category: "Electronics", price: 3506, qty: 100, status: "Adequate" },
  { sku: "PT002", name: "Beats Pro", category: "Electronics", price: 7981, qty: 140, status: "Low" },
  { sku: "PT003", name: "Nike Jordan", category: "Cloth", price: 450, qty: 300, status: "Out" },
  { sku: "PT004", name: "Apple Series 5 Watch", category: "Electronics", price: 902, qty: 450, status: "Adequate" },
  { sku: "PT005", name: "Amazon Echo Dot", category: "Electronics", price: 3506, qty: 320, status: "Low" },
  { sku: "PT006", name: "Sanford Chair Sofa", category: "Furniture", price: 7981, qty: 650, status: "Out" },
  { sku: "PT007", name: "Red Premium Satchel", category: "Accessories", price: 450, qty: 700, status: "Adequate" },
  { sku: "PT008", name: "Iphone 14 Pro", category: "Electronics", price: 3506, qty: 630, status: "Low" },
  { sku: "PT009", name: "Gaming Chair", category: "Furniture", price: 7981, qty: 410, status: "Out" },
  { sku: "PT010", name: "Borealis Backpack", category: "Accessories", price: 450, qty: 550, status: "Low" }
];

  const lowStocks = allStocks.filter(item => item.status === "Low" || item.status === "Out");

 
  const getStatusClass = (status: string) => {
    switch (status) {
      case "Adequate": return "bg-green-500 text-white";
      case "Low": return "bg-yellow-500 text-white";
      case "Out": return "bg-red-500 text-white";
      default: return "bg-gray-400 text-white";
    }
  };
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex gap-6 border-b border-border">
      <button 
        class="pb-2 text-sm font-medium {activeTab === 'All Stock' ? 'text-info border-b-2 border-info' : 'text-muted-foreground'}"
        on:click={() => activeTab = "All Stock"}>
        All Stock
      </button>
      <button 
        class="pb-2 text-sm font-medium {activeTab === 'Low Stock' ? 'text-info border-b-2 border-info' : 'text-muted-foreground'}"
        on:click={() => activeTab = "Low Stock"}>
        Low Stock
      </button>
    </div>

    <div class="flex gap-3">
      {#if activeTab === 'Low Stock'}
        <button class="border border-info text-info px-4 py-2 rounded text-sm hover:bg-blue-50">Restock Item</button>
      {/if}
      <button class="bg-info text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 text-sm">
        <Icon iconName="icon/plus" size={18} />
        <span>Add Stock</span>
      </button>
    </div>
  </div>

  {#if allStocks.length === 0}
    <div class="flex flex-col items-center justify-center py-20 text-center">
      <div class="w-48 h-48 mb-6 opacity-80">
        <img src="/empty-box-illustration.png" alt="No stock" />
      </div>
      <h2 class="text-xl font-bold">No Stock Assigned Yet</h2>
      <p class="text-muted-foreground max-w-sm mx-auto mt-2">
        This location doesn't have any products assigned. Once stock is added, you'll be able to track quantities.
      </p>
      <button class="mt-6 bg-info text-white px-6 py-2 rounded">Assign Stock</button>
    </div>

  {:else}
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <div class="p-4 flex items-center justify-between gap-4">
        <div class="relative flex-1 max-w-md">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Icon iconName="icon/search" size={16} />
          </span>
          <input 
            type="text" 
            placeholder="Search by stock name..." 
            class="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm"
          />
        </div>
        <div class="flex gap-2">
          <select class="text-xs border border-border rounded px-3 py-2 bg-transparent">
            <option>Category</option>
          </select>
          <select class="text-xs border border-border rounded px-3 py-2 bg-transparent">
            <option>Status</option>
          </select>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-y border-border">
            <tr class="text-left text-xs text-muted-foreground">
              <th class="px-6 py-4"><input type="checkbox" /></th>
              <th class="px-4 py-4 uppercase">Stock Item</th>
              <th class="px-4 py-4 uppercase">Category</th>
              <th class="px-4 py-4 uppercase">Unit Price</th>
              <th class="px-4 py-4 uppercase">Qty</th>
              <th class="px-4 py-4 uppercase">Status</th>
              <th class="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            {#each (activeTab === "All Stock" ? allStocks : lowStocks) as item}
              <tr class="hover:bg-muted/10">
                <td class="px-6 py-4"><input type="checkbox" /></td>
                <td class="px-4 py-4 font-medium">{item.name}</td>
                <td class="px-4 py-4 text-muted-foreground">{item.category}</td>
                <td class="px-4 py-4">${item.price.toLocaleString()}</td>
                <td class="px-4 py-4">{item.qty}</td>
                <td class="px-4 py-4">
                  <span class="px-3 py-1 rounded-full text-[10px] {getStatusClass(item.status)}">
                    {item.status}
                  </span>
                </td>
                <td class="px-4 py-4 text-right flex justify-end gap-2">
                  <button class="p-1.5 border border-border rounded hover:bg-muted"><Icon iconName="icon/edit" size={14} /></button>
                  <button class="p-1.5 border border-border rounded hover:bg-muted"><Icon iconName="icon/refresh-cw" size={14} /></button>
                  <button class="p-1.5 border border-border rounded hover:bg-muted text-red-500"><Icon iconName="icon/trash" size={14} /></button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
      
      <div class="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        </div>
    </div>
  {/if}
</div>