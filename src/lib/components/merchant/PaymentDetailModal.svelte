<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  
  export let isOpen = false;
  export let payment: any = null; // 
  export let onClose: () => void; // 

  const formatCurrency = (val: number) => `$${val}`;
</script>

{#if isOpen && payment}
<div class="fixed inset-0 z-50 flex justify-end">
  <button 
    class="absolute inset-0 bg-black/40 backdrop-blur-sm border-none w-full h-full cursor-default"
    on:click={onClose}
    aria-label="Close modal"
    type="button"
  ></button>

  <div class="relative bg-white h-full w-full max-w-md shadow-2xl p-8 overflow-y-auto">
    <div class="flex justify-between items-start mb-10">
      <div>
        <h2 class="text-xl font-bold text-slate-900">Payment Detail Details</h2> <div class="flex items-center gap-2 mt-1">
          <span class="text-xs text-slate-400 font-medium">#{payment.paymentId}</span> <span class="text-xs text-amber-400 font-medium flex items-center gap-1">
            <span class="text-[8px]">●</span> Partially Paid </span>
        </div>
      </div>
      <button 
        on:click={onClose} 
        class="text-slate-400 hover:text-slate-600 transition-colors p-1"
        type="button"
      >
        <Icon iconName="icon/x" size={24} /> </button>
    </div>

    <section class="mb-10">
      <h3 class="text-sm font-bold mb-6 text-slate-900">Payment Summary</h3> <div class="grid grid-cols-3 gap-y-8 text-sm">
        <div>
          <p class="text-slate-400 mb-1 text-xs">Payment ID</p> <p class="font-bold text-slate-800">#{payment.paymentId}</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Order ID</p> <p class="font-bold text-slate-800">PT593</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Paid Amount</p> <p class="font-bold text-slate-800">$3400</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Total Order Amount</p> <p class="font-bold text-slate-800">13</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Remaining Balance</p> <p class="font-bold text-slate-800">$1700</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Status</p> <span class="bg-amber-400 text-white text-[10px] px-2 py-0.5 rounded font-bold flex items-center gap-1 w-fit">
            <span class="text-[6px]">●</span> Partially Paid </span>
        </div>
      </div>
    </section>

    <section class="mb-10 pt-8 border-t border-slate-100">
      <h3 class="text-sm font-bold mb-6 text-slate-900">Customer Detail</h3> <div class="grid grid-cols-2 gap-y-8 text-sm">
        <div>
          <p class="text-slate-400 mb-1 text-xs">Name</p> <p class="font-bold text-slate-800">Jamie Grace</p> </div>
        <div>
          <p class="text-slate-400 mb-1 text-xs">Phone</p> <p class="font-bold text-slate-800">+123456789</p> </div>
        <div class="col-span-2">
          <p class="text-slate-400 mb-1 text-xs">Email</p> <p class="font-bold text-slate-800">jamie.g@gmail.com</p> </div>
      </div>
    </section>

    <section class="pt-8 border-t border-slate-100">
      <h3 class="text-sm font-bold mb-6 text-slate-900">Recent Activity</h3> <div class="space-y-8">
        <div class="flex gap-4">
          <div class="w-2 h-2 rounded-full bg-sky-400 mt-1.5 shrink-0"></div> <div>
            <p class="text-sm font-bold text-slate-800">
              Payment Created - <span class="text-sky-500">$150</span> </p>
            <p class="text-xs text-slate-400">2 hours ago</p> </div>
        </div>
        <div class="flex gap-4">
          <div class="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0"></div> <div>
            <p class="text-sm font-bold text-slate-800">Status changed: Pending → Completed</p> <p class="text-xs text-slate-400">Yesterday, 4:15 PM</p> </div>
        </div>
        <div class="flex gap-4">
          <div class="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0"></div> <div>
            <p class="text-sm font-bold text-slate-800">Partial Payment: $50 paid, $70 remaining</p> <p class="text-xs text-slate-400">Yesterday, 11:30 AM</p> </div>
        </div>
      </div>
    </section>
  </div>
</div>
{/if}