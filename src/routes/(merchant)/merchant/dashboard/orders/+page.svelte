<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import CreateOrderModal from "../../../../../lib/components/merchant/CreateOrderModal.svelte";
  import OrderDetailsModal from "../../../../../lib/components/merchant/OrderDetailsModal.svelte";

  const orders = [
    { id: "PT001", customer: "Stan Gaunter", items: 4, amount: "$3000", paymentStatus: "Paid", date: "24 Dec 2024", orderStatus: "Completed" },
    { id: "PT002", customer: "Stan Gaunter", items: 24, amount: "$1600", paymentStatus: "Partially Paid", date: "10 Dec 2024", orderStatus: "In Progress" },
    { id: "PT003", customer: "Stan Gaunter", items: 16, amount: "$880", paymentStatus: "Not Paid", date: "27 Nov 2024", orderStatus: "Completed" },
    { id: "PT004", customer: "Stan Gaunter", items: 9, amount: "$1200", paymentStatus: "Paid", date: "18 Nov 2024", orderStatus: "In Progress" },
    { id: "PT005", customer: "Stan Gaunter", items: 12, amount: "$400", paymentStatus: "Partially Paid", date: "06 Nov 2024", orderStatus: "Completed" },
    { id: "PT006", customer: "Stan Gaunter", items: 43, amount: "$2240", paymentStatus: "Not Paid", date: "25 Oct 2024", orderStatus: "In Progress" },
    { id: "PT007", customer: "Stan Gaunter", items: 87, amount: "$900", paymentStatus: "Paid", date: "14 Oct 2024", orderStatus: "Completed" },
    { id: "PT008", customer: "Stan Gaunter", items: 5, amount: "$6480", paymentStatus: "Partially Paid", date: "03 Oct 2024", orderStatus: "In Progress" },
    { id: "PT009", customer: "Stan Gaunter", items: 7, amount: "$2000", paymentStatus: "Not Paid", date: "14 Oct 2024", orderStatus: "Completed" },
    { id: "PT010", customer: "Stan Gaunter", items: 1, amount: "$900", paymentStatus: "Partially Paid", date: "03 Oct 2024", orderStatus: "In Progress" },
  ]; 


  let showCreateModal = false;
  let showDetailsModal = false;
  type Order = {
    id: string;
    customer: string;
    items: number;
    amount: string;
    paymentStatus: string;
    date: string;
    orderStatus: string;
  };

  let selectedOrder: Order | null = null;

  function openOrderDetails(order: any) {
    selectedOrder = order;
    showDetailsModal = true;
  }

  const getPaymentStatusClass = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-700 border-green-200";
      case "Partially Paid": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Not Paid": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getOrderStatusClass = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500 text-white";
      case "In Progress": return "bg-orange-400 text-white";
      default: return "bg-gray-400 text-white";
    }
  }; 
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-end gap-3">
    <button class="p-2 border border-border rounded bg-card text-muted-foreground hover:bg-muted">
      <Icon iconName="icon/download" size={18} />
    </button>
    <button class="p-2 border border-border rounded bg-card text-muted-foreground hover:bg-muted">
      <Icon iconName="icon/printer" size={18} />
    </button>
    <button 
      on:click={() => showCreateModal = true}
      class="bg-[#4DA0E6] text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90 transition-opacity"
    >
      <Icon iconName="icon/plus" size={18} />
      <span>New Order</span>
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-5 gap-4 bg-card border border-border rounded-lg p-4">
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-muted-foreground">Choose Date</label>
      <div class="flex items-center gap-2 border border-border rounded px-3 py-2 text-sm text-muted-foreground cursor-pointer">
        <Icon iconName="icon/calendar" size={16} />
        <span>Jan 2025 - Jun 2025</span>
      </div>
    </div>
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-muted-foreground">Order Status</label>
      <select class="w-full border border-border rounded px-3 py-2 text-sm bg-transparent focus:outline-none">
        <option>All</option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-muted-foreground">Payment Status</label>
      <select class="w-full border border-border rounded px-3 py-2 text-sm bg-transparent focus:outline-none">
        <option>All</option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-muted-foreground">Customer</label>
      <select class="w-full border border-border rounded px-3 py-2 text-sm bg-transparent focus:outline-none">
        <option>All</option>
      </select>
    </div>
    <div class="space-y-1.5">
      <label class="text-xs font-medium text-muted-foreground">Products</label>
      <select class="w-full border border-border rounded px-3 py-2 text-sm bg-transparent focus:outline-none">
        <option>All</option>
      </select>
    </div>
  </div> <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="p-4 border-b border-border">
      <h3 class="font-semibold text-foreground">Orders</h3>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-muted">
          <tr class="text-left text-xs text-muted-foreground border-b border-border">
            <th class="px-6 py-2 w-10 text-center"><input type="checkbox" class="rounded border-border" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Order ID <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Customer Name</th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Items <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Total Amount <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Payment Status <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Date <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            <th class="px-4 py-2 font-medium uppercase tracking-wider">Order Status <Icon iconName="icon/chevron-down" size={10} class="inline ml-1" /></th>
            
          </tr>
        </thead> <tbody class="divide-y divide-border">
          {#each orders as order}
            <tr class="hover:bg-muted/20 transition-colors">
              <td class="px-6 py-4 text-center"><input type="checkbox" class="rounded border-border" /></td>
              <td class="px-4 py-4 text-foreground">{order.id}</td>
              <td class="px-4 py-4 text-muted-foreground">{order.customer}</td>
              <td class="px-4 py-4 text-muted-foreground">{order.items}</td>
              <td class="px-4 py-4 text-foreground font-medium">{order.amount}</td>
              <td class="px-4 py-4">
                <span class="px-2.5 py-1.5 rounded-sm text-[10px] font-semibold border {getPaymentStatusClass(order.paymentStatus)}">
                  • {order.paymentStatus}
                </span>
              </td>
              <td class="px-4 py-4 text-muted-foreground">{order.date}</td>
              <td class="px-4 py-4">
                <span class="px-3 py-1.5 rounded-sm text-[10px] font-medium {getOrderStatusClass(order.orderStatus)}">
                  • {order.orderStatus}
                </span>
              </td>
              <td class="px-4 py-4 text-right">
                <button 
                  on:click={() => openOrderDetails(order)}
                  class="p-1.5 hover:bg-muted rounded text-muted-foreground"
                >
                  <Icon iconName="icon/eye" size={16} />
                </button>
              </td>
            </tr>
          {/each}
        </tbody> </table>
    </div>

    <div class="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
        <span>Row Per Page</span>
        <select class="border border-border rounded px-1 py-0.5 bg-transparent">
          <option>10</option>
        </select>
        <span>Entries</span>
      </div>
 <div class="flex items-center gap-2">
  <button class="w-6 h-6 flex items-center justify-center border border-border rounded-full hover:bg-muted disabled:opacity-50">
    <Icon iconName="icon/chevron-left" size={12} />
  </button>

  <button class="w-6 h-6 flex items-center justify-center rounded-full border border-border hover:bg-muted">1</button>
  <button class="w-6 h-6 flex items-center justify-center rounded-full border border-border hover:bg-muted">2</button>
  <button class="w-6 h-6 flex items-center justify-center rounded-full border border-border hover:bg-muted">3</button>
  
  <button class="w-6 h-6 flex items-center justify-center rounded-full bg-[#4DA0E6] text-white border-info">4</button>
  
  <span class="px-1">...</span>
  
  <button class="w-6 h-6 flex items-center justify-center rounded-full border border-border hover:bg-muted">15</button>

  <button class="w-6 h-6 flex items-center justify-center border border-border rounded-full hover:bg-muted">
    <Icon iconName="icon/chevron-right" size={12} />
  </button>
</div>
    </div> </div>
</div>

<CreateOrderModal 
  isOpen={showCreateModal} 
  onClose={() => showCreateModal = false} 
/>

<OrderDetailsModal 
  isOpen={showDetailsModal} 
  order={selectedOrder} 
  onClose={() => { showDetailsModal = false; selectedOrder = null; }} 
/>