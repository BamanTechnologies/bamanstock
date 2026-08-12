<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import CreditDetailModal from "../../../../../lib/components/merchant/CreditDetailModal.svelte";
  import PaymentReminderModal from "../../../../../lib/components/merchant/PaymentReminderModal.svelte";

  let isDetailModalOpen = false;
  let isReminderModalOpen = false;
  type CreditRow = {
    orderId: string;
    customer: string;
    creditAmount: string;
    amountPaid: string;
    unpaid: string;
    issueDate: string;
    dueDate: string;
    status: string;
  };

  let selectedCredit: CreditRow | null = null;

  const creditKpis = [
    {
      label: "Total Credit Issued",
      value: "$54,000",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/dollar-sign",
      iconColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      label: "Outstanding Credit (Unpaid)",
      value: "$45,600",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/dollar-sign",
      iconColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
    {
      label: "Overdue Credit",
      value: "$12,000",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/shopping-cart",
      iconColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      label: "Collected This Month",
      value: "$6700",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/dollar-sign",
      iconColor: "bg-cyan-100",
      textColor: "text-cyan-600",
    },
  ];

  const creditData = [
    { orderId: "PT001", customer: "Stan Gaunter", creditAmount: "$3000", amountPaid: "$3000", unpaid: "$0", issueDate: "24 Dec 2024", dueDate: "24 Dec 2024", status: "Paid" },
    { orderId: "PT002", customer: "Stan Gaunter", creditAmount: "$1600", amountPaid: "$1600", unpaid: "$1600", issueDate: "10 Dec 2024", dueDate: "10 Dec 2024", status: "Partially Paid" },
    { orderId: "PT003", customer: "Stan Gaunter", creditAmount: "$880", amountPaid: "$880", unpaid: "$880", issueDate: "27 Nov 2024", dueDate: "27 Nov 2024", status: "Not Paid" },
    { orderId: "PT004", customer: "Stan Gaunter", creditAmount: "$1200", amountPaid: "$1200", unpaid: "$0", issueDate: "18 Nov 2024", dueDate: "18 Nov 2024", status: "Paid" },
    { orderId: "PT005", customer: "Stan Gaunter", creditAmount: "$400", amountPaid: "$400", unpaid: "$40", issueDate: "06 Nov 2024", dueDate: "06 Nov 2024", status: "Partially Paid" },
    { orderId: "PT006", customer: "Stan Gaunter", creditAmount: "$2240", amountPaid: "$2240", unpaid: "$2240", issueDate: "25 Oct 2024", dueDate: "25 Oct 2024", status: "Not Paid" },
    { orderId: "PT007", customer: "Stan Gaunter", creditAmount: "$900", amountPaid: "$900", unpaid: "$0", issueDate: "14 Oct 2024", dueDate: "14 Oct 2024", status: "Paid" },
    { orderId: "PT008", customer: "Stan Gaunter", creditAmount: "$6480", amountPaid: "$6480", unpaid: "$480", issueDate: "03 Oct 2024", dueDate: "03 Oct 2024", status: "Partially Paid" },
    { orderId: "PT009", customer: "Stan Gaunter", creditAmount: "$2000", amountPaid: "$2000", unpaid: "$2000", issueDate: "14 Oct 2024", dueDate: "14 Oct 2024", status: "Not Paid" },
    { orderId: "PT010", customer: "Stan Gaunter", creditAmount: "$900", amountPaid: "$900", unpaid: "$300", issueDate: "03 Oct 2024", dueDate: "03 Oct 2024", status: "Partially Paid" },
  ];

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-500 text-white";
      case "Partially Paid": return "bg-orange-400 text-white";
      case "Not Paid": return "bg-red-500 text-white";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const openDetails = (row: any) => {
    selectedCredit = row;
    isDetailModalOpen = true;
  };

  const openReminder = (row: any) => {
    selectedCredit = row;
    isReminderModalOpen = true;
  };
</script>

<div class="p-6 space-y-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2 bg-card border border-border rounded px-3 py-1.5 text-xs text-muted-foreground">
      <Icon iconName="icon/calendar" size={14} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
    <div class="flex items-center gap-3">
      <button class="p-2 border border-border rounded bg-card text-red-500 hover:bg-muted"><Icon iconName="icon/file-text" size={18} /></button>
      <button class="p-2 border border-border rounded bg-card text-muted-foreground hover:bg-muted"><Icon iconName="icon/printer" size={18} /></button>
      <button class="bg-[#4DA0E6] text-white px-4 py-2 rounded flex items-center gap-2 hover:opacity-90">
        <Icon iconName="icon/plus" size={18} />
        <span>Add Payment</span>
      </button>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each creditKpis as kpi}
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
          <span class="font-medium">{kpi.change.split(" ")[0]}</span> {kpi.change.slice(kpi.change.indexOf(" "))}
        </p>
      </div>
    {/each}
  </div>

  <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="p-4 border-b border-border flex items-center justify-between">
      <h3 class="font-semibold text-foreground">Credit Table</h3>
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-muted/20 border border-border rounded px-3 py-1.5 text-xs text-muted-foreground">
          <Icon iconName="icon/calendar" size={14} />
          <span>01 Jan 2024 - 07 Jan 2024</span>
        </div>
        <select class="text-xs border border-border rounded px-2 py-1.5 bg-transparent"><option>Customer</option></select>
        <select class="text-xs border border-border rounded px-2 py-1.5 bg-transparent"><option>Status</option></select>
        <div class="flex items-center gap-2 border border-border rounded px-2 py-1 bg-transparent">
          <span class="text-xs text-muted-foreground">Overdue</span>
          <input type="checkbox" class="toggle toggle-info toggle-sm" />
        </div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="uppercase bg-muted/30">
          <tr class="text-left text-xs text-muted-foreground border-b border-border">
            <th class="px-6 py-4 w-10 text-center"><input type="checkbox" class="rounded border-border" /></th>
            <th class="px-4 py-4 font-medium uppercase">Order ID <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Customer Name</th>
            <th class="px-4 py-4 font-medium uppercase">Credit Amount <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Amount Paid</th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Unpaid Amount</th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Issue Date <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase text-nowrap">Due Date <Icon iconName="icon/chevron-down" size={10} class="inline" /></th>
            <th class="px-4 py-4 font-medium uppercase">Payment Status</th>
            <th class="px-4 py-4 text-right font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#each creditData as row}
            <tr class="hover:bg-muted/20 transition-colors">
              <td class="px-6 py-4 text-center"><input type="checkbox" class="rounded border-border" /></td>
              <td class="px-4 py-4 text-foreground">{row.orderId}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.customer}</td>
              <td class="px-4 py-4 text-foreground font-medium">{row.creditAmount}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.amountPaid}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.unpaid}</td>
              <td class="px-4 py-4 text-muted-foreground">{row.issueDate}</td>
              <td class="px-4 py-4 text-muted-foreground whitespace-nowrap">{row.dueDate}</td>
              <td class="px-4 py-4">
                <span class="px-2 py-1.5 rounded-sm text-[10px] font-medium whitespace-nowrap {getStatusStyles(row.status)}">
                  • {row.status}
                </span>
              </td>
              <td class="px-4 py-4 text-right flex justify-end gap-1">
                <button on:click={() => openDetails(row)} class="p-1.5 hover:bg-muted rounded text-muted-foreground">
                  <Icon iconName="icon/eye" size={14} />
                </button>
                <button on:click={() => openReminder(row)} class="p-1.5 hover:bg-muted rounded text-muted-foreground">
                  <Icon iconName="icon/file" size={14} />
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="p-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
      <div class="flex items-center gap-2">
        <span>Row Per Page</span>
        <select class="border border-border rounded px-1 py-0.5 bg-transparent"><option>10</option></select>
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

<CreditDetailModal 
  isOpen={isDetailModalOpen} 
  credit={selectedCredit} 
  onClose={() => isDetailModalOpen = false} 
/>

<PaymentReminderModal 
  isOpen={isReminderModalOpen} 
  customerName={selectedCredit?.customer}
  balance={selectedCredit?.unpaid}
  dueDate={selectedCredit?.dueDate}
  onClose={() => isReminderModalOpen = false} 
/>