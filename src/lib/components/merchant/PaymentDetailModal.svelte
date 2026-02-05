<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let payment: any = null;
  export let onClose: () => void;
</script>

{#if isOpen && payment}
<div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
  <div class="bg-white h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-lg font-bold">Payment Detail Details</h2>
        <p class="text-xs text-slate-500">{payment.paymentId} • <span class="text-orange-500 font-medium">● {payment.status}</span></p>
      </div>
      <button on:click={onClose} class="p-2 hover:bg-slate-100 rounded-full transition-colors">
        <Icon iconName="icon/x" size={20} />
      </button>
    </div>

    <section class="mb-8">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Payment Summary</h3>
      <div class="grid grid-cols-3 gap-y-6 text-sm">
        <div>
          <p class="text-slate-500 mb-1 text-xs">Payment ID</p>
          <p class="font-bold">{payment.paymentId}</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Order ID</p>
          <p class="font-bold">PT593</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Paid Amount</p>
          <p class="font-bold">$3400</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Total Order Amount</p>
          <p class="font-bold">13</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Remaining Balance</p>
          <p class="font-bold">$1700</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Status</p>
          <span class="bg-orange-400 text-white text-[10px] px-2 py-0.5 rounded font-medium">● Partially Paid</span>
        </div>
      </div>
    </section>

    <section class="mb-8 pt-6 border-t">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Customer Detail</h3>
      <div class="grid grid-cols-2 gap-y-6 text-sm">
        <div>
          <p class="text-slate-500 mb-1 text-xs">Name</p>
          <p class="font-bold">Jamie Grace</p>
        </div>
        <div>
          <p class="text-slate-500 mb-1 text-xs">Phone</p>
          <p class="font-bold">+123456789</p>
        </div>
        <div class="col-span-2">
          <p class="text-slate-500 mb-1 text-xs">Email</p>
          <p class="font-bold">jamie.g@gmail.com</p>
        </div>
      </div>
    </section>

    <section class="pt-6 border-t">
      <h3 class="text-xs font-bold mb-4 uppercase tracking-wider text-slate-400">Recent Activity</h3>
      <div class="space-y-6">
        <div class="flex gap-3">
          <div class="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
          <div>
            <p class="text-sm font-medium">Payment Created - <span class="text-blue-500">$150</span></p>
            <p class="text-xs text-slate-400">2 hours ago</p>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
          <div>
            <p class="text-sm font-medium">Status changed: Pending → Completed</p>
            <p class="text-xs text-slate-400">Yesterday, 4:15 PM</p>
          </div>
        </div>
        <div class="flex gap-3">
          <div class="w-2 h-2 rounded-full bg-slate-300 mt-1.5"></div>
          <div>
            <p class="text-sm font-medium">Partial Payment: $50 paid, $70 remaining</p>
            <p class="text-xs text-slate-400">Yesterday, 11:30 AM</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>
{/if}