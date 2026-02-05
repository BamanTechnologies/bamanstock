<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  // Import the modal components
  import AddPaymentModal from "../../../../../lib/components/merchant/AddPaymentModal.svelte";
  import PaymentDetailModal from "../../../../../lib/components/merchant/PaymentDetailModal.svelte";

  // State management for modals 
  let isAddModalOpen = false;
  let isDetailModalOpen = false;
  type Payment = {
    orderId: string;
    paymentId: string;
    customer: string;
    amount: string;
    remaining: string;
    status: string;
    date: string;
  };

  let selectedPayment: Payment | null = null;

  const paymentKpis = [
    {
      label: "Total Payments Received",
      value: "$29,350.89",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/dollar-sign",
      iconColor: "bg-green-100",
      textColor: "text-green-600"
    },
    {
      label: "Outstanding Balance",
      value: "$45,600",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/info",
      iconColor: "bg-cyan-100",
      textColor: "text-cyan-600"
    },
    {
      label: "Partially Paid Orders",
      value: "135",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/shopping-cart",
      iconColor: "bg-purple-100",
      textColor: "text-purple-600"
    },
    {
      label: "Refunds Issued",
      value: "3",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/refresh-cw",
      iconColor: "bg-red-100",
      textColor: "text-red-600"
    }
  ];

  const paymentHistory = [
    { orderId: "PT001", paymentId: "#93022", customer: "Stan Gaunter", amount: "$3000", remaining: "$0", status: "Paid", date: "24 Dec 2024" },
    { orderId: "PT002", paymentId: "#93022", customer: "Stan Gaunter", amount: "$1600", remaining: "$1600", status: "Partially Paid", date: "10 Dec 2024" },
    { orderId: "PT003", paymentId: "#93022", customer: "Stan Gaunter", amount: "$880", remaining: "$880", status: "Not Paid", date: "27 Nov 2024" },
    { orderId: "PT004", paymentId: "#93022", customer: "Stan Gaunter", amount: "$1200", remaining: "$0", status: "Paid", date: "18 Nov 2024" },
    { orderId: "PT005", paymentId: "#93022", customer: "Stan Gaunter", amount: "$400", remaining: "$40", status: "Partially Paid", date: "06 Nov 2024" },
    { orderId: "PT006", paymentId: "#93022", customer: "Stan Gaunter", amount: "$2240", remaining: "$2240", status: "Not Paid", date: "25 Oct 2024" },
    { orderId: "PT007", paymentId: "#93022", customer: "Stan Gaunter", amount: "$900", remaining: "$0", status: "Paid", date: "14 Oct 2024" },
    { orderId: "PT008", paymentId: "#93022", customer: "Stan Gaunter", amount: "$6480", remaining: "$480", status: "Partially Paid", date: "03 Oct 2024" },
    { orderId: "PT009", paymentId: "#93022", customer: "Stan Gaunter", amount: "$2000", remaining: "$2000", status: "Not Paid", date: "14 Oct 2024" },
    { orderId: "PT010", paymentId: "#93022", customer: "Stan Gaunter", amount: "$900", remaining: "$300", status: "Partially Paid", date: "03 Oct 2024" },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500 text-white";
      case "Partially Paid": return "bg-orange-400 text-white";
      case "Not Paid": return "bg-red-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Function to handle viewing payment details [cite: 30, 31]
  const viewDetails = (payment: any) => {
    selectedPayment = payment;
    isDetailModalOpen = true;
  };
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2 bg-card border border-border rounded px-3 py-1.5 text-xs text-muted-foreground">
      <Icon iconName="icon/calendar" size={14} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
    <div class="flex items-center gap-3">
      <button class="p-2 border border-border rounded bg-card text-red-500 hover:bg-muted">
        <Icon iconName="icon/file-text" size={18} />
      </button>
      <button class="p-2 border border-border rounded bg-card text-muted-foreground hover:bg-muted">
        <Icon iconName="icon/printer" size={18} />
      </button>
      <button 
        on:click={() => isAddModalOpen = true}
        class="bg-info text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90"
      >
        <Icon iconName="icon/plus" size={18} />
        <span>Add Payment</span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each paymentKpis as kpi}
      <div class="bg-card border border-border rounded-lg p-5">
        <div class="flex items-center justify-between mb-4">
          <div class="space-y-1">
            <p class="text-2xl font-bold text-foreground">{kpi.value}</p>
            <p class="text-xs text-muted-foreground">{kpi.label}</p>
          </div>
          <div class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center">
            <Icon iconName={kpi.icon as any} size={20} class={kpi.textColor} />
          </div>
        </div>
        <p class="text-xs {kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}">
          {kpi.change}
        </p>
      </div>
    {/each}
  </div>

  <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="p-4 border-b border-border flex items-center justify-between">
      <h3 class="font-semibold text-foreground">Payment</h3>
      <div class="flex gap-2">
        <select class="text-xs border border-border rounded px-2 py-1 bg-transparent">
          <option>Customer</option>
        </select>
        <select class="text-xs border border-border rounded px-2 py-1 bg-transparent">
          <option>Status</option>
        </select>
      </div>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="bg-muted/30">
          <tr class="text-left text-xs text-muted-foreground border-b border-border">
            <th class="px-6 py-4 w-10 text-center"><input type="checkbox" class="rounded border-border" /></th>
            <th class="px-4 py-4 font-medium uppercase">Order ID <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Payment ID <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Customer Name</th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Amount Paid <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Remaining Balance <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Payment Status <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Date <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 text-right font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each paymentHistory as row}
            <tr class="hover:bg-muted/20 transition-colors">
              <td class="px-6 py-4 text-center"><input type="checkbox" class="rounded border-border" /></td>
              <td class="px-4 py-4 text-foreground">{row.orderId}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.paymentId}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.customer}</td>
              <td class="px-4 py-4 text-foreground font-medium">{row.amount}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.remaining}</td>
              <td class="px-4 py-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap {getStatusStyles(row.status)}">
                  • {row.status}
                </span>
              </td>
              <td class="px-4 py-4 text-muted-foreground whitespace-nowrap">{row.date}</td>
              <td class="px-4 py-4 text-right flex justify-end gap-1">
                <button 
                  on:click={() => viewDetails(row)}
                  class="p-1.5 hover:bg-muted rounded text-muted-foreground"
                >
                  <Icon iconName="icon/eye" size={14} />
                </button>
                <button class="p-1.5 hover:bg-muted rounded text-muted-foreground"><Icon iconName="icon/download" size={14} /></button>
                <button class="p-1.5 hover:bg-muted rounded text-muted-foreground"><Icon iconName="icon/edit" size={14} /></button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
        <span>Row Per Page</span>
        <select class="border border-border rounded px-1 py-0.5 bg-transparent">
          <option>10</option>
        </select>
        <span>Entries</span>
      </div>
      <div class="flex items-center gap-1">
        <button class="p-1 border border-border rounded hover:bg-muted"><Icon iconName="icon/chevron-left" size={12} /></button>
        {#each [1, 2, 3] as page}
          <button class="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted">{page}</button>
        {/each}
        <button class="w-6 h-6 flex items-center justify-center rounded bg-info text-white border-info">4</button>
        <span class="px-1">...</span>
        <button class="w-6 h-6 flex items-center justify-center rounded border border-border hover:bg-muted">15</button>
        <button class="p-1 border border-border rounded hover:bg-muted"><Icon iconName="icon/chevron-right" size={12} /></button>
      </div>
    </div>
  </div>
</div>

<AddPaymentModal 
  isOpen={isAddModalOpen} 
  onClose={() => isAddModalOpen = false} 
/>

<PaymentDetailModal 
  isOpen={isDetailModalOpen} 
  payment={selectedPayment} 
  onClose={() => isDetailModalOpen = false} 
/>