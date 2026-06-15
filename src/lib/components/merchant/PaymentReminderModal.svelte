<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let customerName = "John Doe";
  export let balance = "$1300";
  export let dueDate = "Dec 11, 2025";
  export let onClose: () => void;

  let phoneNumber = "+12832930232";
  let message = `Hello ${customerName}, This is a reminder that you have an outstanding balance of ${balance}. Please complete your payment before ${dueDate}. Thank you!`;
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
    <div class="flex items-center justify-between p-6 border-b">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-blue-50 rounded-lg text-blue-500">
          <Icon iconName="icon/refresh-cw" size={20} />
        </div>
        <div>
          <h2 class="text-lg font-bold text-slate-800">Send payment reminder</h2>
          <p class="text-xs text-slate-500">Notify a customer via SMS</p>
        </div>
      </div>
      <button on:click={onClose} class="text-slate-400 hover:text-slate-600">
        <Icon iconName="icon/x" size={20} />
      </button>
    </div>

    <div class="p-6 space-y-5">
      <div class="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <div class="text-center">
          <p class="text-[10px] uppercase text-slate-400 font-bold mb-1">Customer</p>
          <p class="text-sm font-bold text-slate-700">{customerName}</p>
        </div>
        <div class="text-center border-x border-slate-200">
          <p class="text-[10px] uppercase text-slate-400 font-bold mb-1">Balance</p>
          <p class="text-sm font-bold text-slate-700">{balance}</p>
        </div>
        <div class="text-center">
          <p class="text-[10px] uppercase text-slate-400 font-bold mb-1">Due Date</p>
          <p class="text-sm font-bold text-slate-700">{dueDate}</p>
        </div>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
        <input type="text" bind:value={phoneNumber} class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
        <p class="text-[10px] text-red-500">SMS will be sent to this number</p>
      </div>

      <div class="space-y-1">
        <label class="text-xs font-bold text-slate-500 uppercase">Message</label>
        <textarea bind:value={message} class="w-full border rounded-lg p-3 text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
      </div>
    </div>

    <div class="p-6 border-t flex justify-end gap-3">
      <button on:click={onClose} class="px-6 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">Cancel</button>
      <button class="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">Send Reminder</button>
    </div>
  </div>
</div>
{/if}