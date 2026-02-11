<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { createEventDispatcher } from 'svelte';

  export let isOpen = false;

  const dispatch = createEventDispatcher();

  let amountPaid = "3390";
  let status = "Partially Paid";
  let note = "";
  let sendReceipt = true;
  const subtotal = 5000;

  function close() {
    dispatch('close');
  }

  function handleRecordPayment() {
    // Logic to record payment
    close();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div 
      class="bg-white rounded-xl shadow-lg flex flex-col overflow-hidden"
      style="width: 672px; max-width: 672px; height: 518px;"
    >
      <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <h2 class="text-xl font-bold text-[#111827]">Create New Order</h2>
        <button on:click={close} class="text-gray-400 hover:text-gray-600 transition-colors">
          <Icon iconName="icon/x" size={24} />
        </button>
      </div>

      <div class="flex-1 p-8 overflow-y-auto">
        <div class="flex justify-between items-start mb-8">
          <h3 class="text-lg font-bold text-[#111827]">Payment Information</h3>
          <div class="text-right">
            <p class="text-xs text-gray-400 uppercase font-medium">Subtotal</p>
            <p class="text-2xl font-bold text-[#111827]">${subtotal}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-6">
          <div class="space-y-2">
            <label for="amount" class="text-sm font-medium text-gray-700">Amount Paid</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input
                id="amount"
                type="text"
                bind:value={amountPaid}
                class="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label for="status" class="text-sm font-medium text-gray-700">Status</label>
            <div class="relative">
              <select
                id="status"
                bind:value={status}
                class="w-full px-4 py-3 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="Paid">Paid</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Not Paid">Not Paid</option>
              </select>
              <div class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                 <span class="px-3 py-1 bg-yellow-400 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                   <span class="w-1 h-1 bg-white rounded-full"></span> {status}
                 </span>
              </div>
              <Icon iconName="icon/chevron-down" size={16} class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-6">
          <label for="note" class="text-sm font-medium text-gray-700">Note</label>
          <textarea
            id="note"
            bind:value={note}
            placeholder="...."
            class="w-full px-4 py-3 border border-gray-200 rounded-lg h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          ></textarea>
        </div>

        <label class="flex items-center gap-3 cursor-pointer group">
          <input 
            type="checkbox" 
            bind:checked={sendReceipt}
            class="w-5 h-5 rounded border-gray-300 text-[#4DA0E6] focus:ring-[#4DA0E6]"
          />
          <span class="text-sm text-gray-500 group-hover:text-gray-700 transition-colors">Send receipt to customer</span>
        </label>
      </div>

      <div class="p-6 border-t border-gray-100 flex justify-end gap-4">
        <button 
          on:click={close}
          class="px-8 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          on:click={handleRecordPayment}
          class="px-8 py-2.5 bg-[#4DA0E6] text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          Record Payment
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  /* Ensuring the select text is hidden to show the custom badge */
  select {
    color: transparent;
  }
  select option {
    color: black;
  }
</style>