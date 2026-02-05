<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let onClose: () => void;

  let amountPaid = "3390";
  let status = "Partially Paid";
  let note = "";
  let sendReceipt = true;
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
    <div class="flex items-center justify-between p-6 border-b">
      <h2 class="text-xl font-bold text-slate-800">Create New Order</h2>
      <button on:click={onClose} class="text-slate-400 hover:text-slate-600">
        <Icon iconName="icon/x" size={24} />
      </button>
    </div>

    <div class="p-6 space-y-6">
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-slate-800">Payment Information</h3>
        <div class="text-right">
          <p class="text-xs text-slate-500">Subtotal</p>
          <p class="text-lg font-bold">$5000</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium">Amount Paid</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
            <input type="text" bind:value={amountPaid} class="w-full border rounded-lg pl-6 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Status</label>
          <select bind:value={status} class="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
            <option>Paid</option>
            <option>Partially Paid</option>
            <option>Not Paid</option>
          </select>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-sm font-medium">Note</label>
        <textarea bind:value={note} placeholder="..." class="w-full border rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
      </div>

      <label class="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" bind:checked={sendReceipt} class="rounded text-blue-600 border-slate-300" />
        <span class="text-sm text-slate-600">Send receipt to customer</span>
      </label>
    </div>

    <div class="p-6 border-t flex justify-end gap-3 bg-slate-50/50">
      <button on:click={onClose} class="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-white transition-colors">Cancel</button>
      <button class="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Record Payment</button>
    </div>
  </div>
</div>
{/if}