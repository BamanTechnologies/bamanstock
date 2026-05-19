<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let credit: any = null;
  export let onClose: () => void;
</script>

{#if isOpen && credit}
<div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
  <div class="bg-white h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto">
    <div class="flex justify-between items-start mb-8">
      <div>
        <h2 class="text-lg font-bold">Credit Details</h2>
        <p class="text-xs text-slate-500">#1930 • <span class="text-orange-500 font-medium">● {credit.status}</span></p>
      </div>
      <button on:click={onClose} class="p-1 hover:bg-slate-100 rounded-full">
        <Icon iconName="icon/x" size={24} />
      </button>
    </div>

    <section class="mb-8">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-800">Customer Detail</h3>
      <div class="grid grid-cols-2 gap-y-6 text-sm">
        <div>
          <p class="text-slate-400 mb-1 text-xs">Name</p>
          <p class="font-medium text-slate-700">{credit.customer}</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Phone</p>
          <p class="font-medium text-slate-700">+123456789</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Email</p>
          <p class="font-medium text-slate-700">jamie.g@gmail.com</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Status</p>
          <span class="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded font-medium">● Partially Paid</span>
        </div>
      </div>
    </section>

    <section class="mb-8 pt-6 border-t">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-800">Credit Summary</h3>
      <div class="grid grid-cols-3 gap-y-6 text-sm">
        <div>
          <p class="text-slate-400 mb-1 text-xs">Credit Amount</p>
          <p class="font-bold text-slate-700">$12,700</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Remaining Balance</p>
          <p class="font-bold text-slate-700">{credit.unpaid}</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Paid Amount</p>
          <p class="font-bold text-slate-700">{credit.amountPaid}</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Order ID</p>
          <p class="font-medium text-slate-700">#19303</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Issue Date</p>
          <p class="font-medium text-slate-700">Dec 10, 2025</p>
        </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Due Date</p>
          <p class="font-medium text-slate-700">Jan 10, 2025</p>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-800">Recent Activity</h3>
      <div class="space-y-6 mt-4">
        <div class="relative pl-6 pb-6 border-l border-slate-100 last:border-0">
          <div class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-blue-500"></div>
          <p class="text-sm font-medium text-slate-700">Payment Received - <span class="text-blue-500">$150</span></p>
          <p class="text-[10px] text-slate-400">2 hours ago</p>
        </div>
        <div class="relative pl-6 pb-6 border-l border-slate-100 last:border-0">
          <div class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-200"></div>
          <p class="text-sm font-medium text-slate-700">Reminder sent</p>
          <p class="text-[10px] text-slate-400">Yesterday, 4:15 PM</p>
        </div>
        <div class="relative pl-6 last:border-0">
          <div class="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-slate-200"></div>
          <p class="text-sm font-medium text-slate-700">Credit created</p>
          <p class="text-[10px] text-slate-400">Yesterday, 11:30 AM</p>
        </div>
      </div>
    </section>
  </div>
</div>
{/if}