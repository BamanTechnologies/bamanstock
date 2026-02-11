<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let onClose: () => void;

  // Initialize with design data
  let items = [
    { id: 1, name: "Lenovo IdeaPad 3", qty: 2, price: 1200 },
    { id: 2, name: "Lenovo IdeaPad 3", qty: 2, price: 1200 }
  ];

  function addItem() {
    items = [...items, { id: Date.now(), name: "Lenovo IdeaPad 3", qty: 1, price: 1200 }];
  }

  function removeItem(id: number) {
    items = items.filter(item => item.id !== id);
  }

  // Reactive subtotal calculation
  $: subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4">
  <div class="bg-white rounded-2xl shadow-2xl w-[672px] max-w-[672px] h-[808px] flex flex-col overflow-hidden">
    
    <div class="flex items-center justify-between p-6 px-8">
      <h2 class="text-xl font-bold text-slate-800">Create New Order</h2>
      <button on:click={onClose} class="text-slate-400 hover:text-slate-600 transition-colors">
        <Icon iconName="icon/x" size={24} />
      </button>
    </div>

    <div class="flex-1 overflow-y-auto px-8 py-2 space-y-8">
      
      <section class="space-y-4">
        <h3 class="text-base font-bold text-slate-900">Customer Information</h3>
        <div class="grid grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Name</label>
            <input type="text" placeholder="Enter Customer Name" class="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-400" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Phone Number</label>
            <input type="text" placeholder="Enter Phone Number" class="w-full border border-slate-200 rounded-lg p-3 text-sm focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-slate-400" />
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-bold text-slate-900">Order Items</h3>
        <div class="grid grid-cols-12 gap-3 text-xs font-medium text-slate-500 mb-1">
          <div class="col-span-5 text-sm font-medium text-slate-600">Item</div>
          <div class="col-span-2 text-sm font-medium text-slate-600">Quantity</div>
          <div class="col-span-2 text-sm font-medium text-slate-600">Unit Price</div>
          <div class="col-span-2 text-sm font-medium text-slate-600">Total Price</div>
          <div class="col-span-1"></div>
        </div>

        {#each items as item (item.id)}
          <div class="grid grid-cols-12 gap-3 items-center">
            <div class="col-span-5 relative">
              <select class="w-full border border-slate-200 rounded-lg p-3 text-sm appearance-none bg-white pr-10">
                <option>{item.name}</option>
              </select>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon iconName="icon/chevron-down" size={18} />
              </div>
            </div>
            <div class="col-span-2">
              <input type="number" bind:value={item.qty} class="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-600 outline-none" />
            </div>
            <div class="col-span-2">
              <input type="text" value="${item.price.toLocaleString()}" readonly class="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-400 bg-white" />
            </div>
            <div class="col-span-2 font-bold text-sm text-slate-900">
              ${(item.qty * item.price).toLocaleString()}
            </div>
            <button on:click={() => removeItem(item.id)} class="col-span-1 text-red-500 flex justify-center hover:bg-red-50 p-2 rounded-lg transition-colors">
              <Icon iconName="icon/trash" size={20} />
            </button>
          </div>
        {/each}

        <div class="flex justify-between items-start pt-2">
          <button on:click={addItem} class="bg-[#e1f0ff] text-[#34a0e4] px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-100 transition-colors">
            <Icon iconName="icon/plus" size={16} /> Add Item
          </button>
          <div class="text-right">
            <p class="text-slate-400 text-sm font-medium">Subtotal</p>
            <p class="text-2xl font-black text-slate-900">${subtotal.toLocaleString()}</p>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <h3 class="text-base font-bold text-slate-900">Payment Information</h3>
        <div class="grid grid-cols-2 gap-x-6 gap-y-4">
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Discount</label>
            <input type="text" placeholder="$0.00" class="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Tax</label>
            <input type="text" placeholder="8.25%" class="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Amount Paid</label>
            <input type="text" placeholder="$3390" class="w-full border border-slate-200 rounded-lg p-3 text-sm outline-none" />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-slate-700">Status</label>
            <div class="relative">
              <div class="w-full border border-slate-200 rounded-lg p-2.5 text-sm flex items-center bg-white cursor-pointer">
                <div class="bg-amber-400 text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-white rounded-full"></span>
                  Partially Paid
                </div>
              </div>
              <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <Icon iconName="icon/chevron-down" size={18} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <div class="p-8 flex justify-end gap-3">
      <button on:click={onClose} class="px-8 py-3.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
        Cancel
      </button>
      <button class="px-8 py-3.5 bg-[#34a0e4] text-white rounded-xl text-sm font-bold hover:bg-blue-500 shadow-lg  transition-all">
        Create Order
      </button>
    </div>
  </div>
</div>
{/if}

<style>
  /* Clean scrollbar */
  ::-webkit-scrollbar {
    width: 5px;
  }
  ::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
  }
</style>