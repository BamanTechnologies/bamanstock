<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let order: any = null;
  export let onClose: () => void;
</script>

{#if isOpen && order}
<div class="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
  <div class="bg-white h-full w-full max-w-md shadow-2xl p-6 overflow-y-auto">
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-lg font-bold">Order Details</h2>
        <p class="text-xs text-slate-500">#{order.id} • <span class="text-green-500 font-medium">{order.orderStatus}</span></p>
      </div>
      <button on:click={onClose} class="p-2 hover:bg-slate-100 rounded-full">
        <Icon iconName="icon/x" size={20} />
      </button>
    </div>

    <section class="mb-8">
      <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-slate-400">Order Overview</h3>
      <div class="grid grid-cols-2 gap-y-4 text-sm">
        <div>
          <p class="text-slate-500">Order ID</p>
          <p class="font-bold">#{order.id}</p>
        </div>
        <div>
          <p class="text-slate-500">Customer</p>
          <p class="font-bold">Olivia Rhye</p>
        </div>
        <div>
          <p class="text-slate-500">Location</p>
          <p class="font-bold">Branch 123</p>
        </div>
      </div>
    </section>

    <section class="mb-8">
      <h3 class="text-sm font-bold mb-4 uppercase tracking-wider text-slate-400">Order Items</h3>
      <div class="space-y-4">
        {#each Array(3) as _} <div class="flex items-center gap-3 text-sm">
          <div class="w-10 h-10 bg-slate-100 rounded flex items-center justify-center">
             <Icon iconName="icon/package" size={18} />
          </div>
          <div class="flex-1">
            <p class="font-medium">Lenovo IdeaPad 3</p>
            <p class="text-xs text-slate-500">Qty: 1</p>
          </div>
          <p class="font-bold">$3,506</p>
        </div>
        {/each}
      </div>
    </section>

    <div class="mt-auto pt-6 border-t">
      <div class="flex justify-between text-sm mb-2">
        <span class="text-slate-500">Paid</span>
        <span class="font-bold">{order.amount}</span>
      </div>
      <div class="flex justify-between text-lg font-bold">
        <span>Total</span>
        <span>{order.amount}</span>
      </div>
    </div>
  </div>
</div>
{/if}