<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import AddProductModal from "../../../../../lib/components/merchant/AddProductModal.svelte";
  import RestockModal from "../../../../../lib/components/merchant/RestockModal.svelte";
  import DeleteModal from "../../../../../lib/components/merchant/DeleteModal.svelte";

  let activeTab = "All Stock";
  
  // Modal states
  let isAddModalOpen = false;
  let isRestockModalOpen = false;
  let isDeleteModalOpen = false;
  let itemToDelete = { name: "" };

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
      case "Adequate": return "bg-green-500/10 text-green-600 border border-green-200";
      case "Low": return "bg-yellow-500/10 text-yellow-600 border border-yellow-200";
      case "Out": return "bg-red-500/10 text-red-600 border border-red-200";
      default: return "bg-gray-400 text-white";
    }
  };

  function openDelete(item: any) {
    itemToDelete = item;
    isDeleteModalOpen = true;
  }
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
      <button 
        on:click={() => isRestockModalOpen = true} 
        class="border border-[#4DA0E6] text-[#4DA0E6] px-4 py-2 rounded text-sm hover:bg-blue-50">
        Restock Item
      </button>

      <button 
        on:click={() => isAddModalOpen = true} 
        class="bg-[#4DA0E6] text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 text-sm">
        <Icon iconName="icon/plus" size={18} />
        <span>Add Stock</span> 
      </button>
    </div>
  </div>

  <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="p-4 flex items-center justify-between gap-4">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Icon iconName="icon/search" size={16} />
        </span>
        <input type="text" placeholder="Search by stock name..." class="w-full pl-10 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm" /> 
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
                <span class="px-3 py-1.5 rounded-sm text-[10px] font-bold {getStatusClass(item.status)}">
                  {item.status}
                </span> 
              </td>
              <td class="px-4 py-4 text-right flex justify-end gap-2">
                <button class="p-1.5 border border-border rounded hover:bg-muted">
                  <Icon iconName="icon/edit" size={14} />
                </button> 
                <button class="p-1.5 border border-border rounded hover:bg-muted">
                  <Icon iconName="icon/refresh-cw" size={14} />
                </button>
                <button on:click={() => openDelete(item)} class="p-1.5 border border-border rounded hover:bg-muted text-red-500">
                  <Icon iconName="icon/trash" size={14} /> 
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>

<AddProductModal isOpen={isAddModalOpen} close={() => isAddModalOpen = false} />
<RestockModal isOpen={isRestockModalOpen} close={() => isRestockModalOpen = false} />
<DeleteModal 
  isOpen={isDeleteModalOpen} 
  itemName={itemToDelete.name} 
  close={() => isDeleteModalOpen = false} 
  onConfirm={() => { 
    console.log("Deleted", itemToDelete.name);
    isDeleteModalOpen = false; 
  }} 
/>