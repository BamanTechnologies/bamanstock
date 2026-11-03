<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { downloadOrderPdf, type OrderPdfData } from "$lib/utils/order-pdf";

  export let isOpen = false;
  export let order: OrderPdfData | null = null;
  export let onClose: () => void;

  function downloadPdf() {
    if (order) downloadOrderPdf(order);
  }
</script>

{#if isOpen && order}
<div class="fixed inset-0 z-50 flex justify-end bg-black/40">
  <div class="bg-white h-full w-[480px] shadow-2xl flex flex-col overflow-hidden">
    
    <div class="flex justify-between items-start p-6 border-b border-slate-100">
      <div>
        <h2 class="text-xl font-bold text-[#101828]">Order Details</h2>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-sm text-slate-400">#{order.id || '1930'}</span>
          <span class="text-[10px] text-slate-300">•</span>
          <span class="text-sm text-[#12B76A] font-medium">{order.orderStatus}</span>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          on:click={downloadPdf}
          class="inline-flex items-center gap-2 rounded-md bg-[var(--primary-blue)] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          <Icon iconName="icon/download" size={16} />
          
        </button>
        <button type="button" on:click={onClose} class="text-slate-900 hover:bg-slate-50 p-1 rounded-lg transition-colors" aria-label="Close order details">
          <Icon iconName="icon/x" size={24} />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-8 space-y-10">
      
      <section>
        <h3 class="text-lg font-bold text-[#101828] mb-6">Order Overview</h3>
        <div class="grid grid-cols-2 gap-y-8">
          <div>
            <p class="text-sm text-slate-400 mb-1">Order ID</p>
            <p class="text-base font-medium text-slate-700">#{order.id || '1930'}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400 mb-1">Customer</p>
            <p class="text-base font-medium text-slate-700">{order.customer}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400 mb-1">Order date</p>
            <p class="text-base font-medium text-slate-700">{order.date}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400 mb-1">Order status</p>
            <p class="text-base font-medium text-slate-700">{order.orderStatus}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 class="text-lg font-bold text-[#101828] mb-4">Order Items</h3>
        
        <div class="grid grid-cols-12 bg-slate-50 p-2 px-3 rounded text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2">
          <div class="col-span-6">Items</div>
          <div class="col-span-1 text-center">Qty</div>
          <div class="col-span-2 text-right">Unit Price</div>
          <div class="col-span-3 text-right">Subtotal</div>
        </div>

        <div class="divide-y divide-slate-100">
          {#if order.lineItems?.length}
            {#each order.lineItems as item}
              <div class="grid grid-cols-12 items-center py-4 px-3 text-sm">
                <div class="col-span-6 flex items-center gap-3">
                  <div class="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400">
                    <Icon iconName="icon/package" size={20} />
                  </div>
                  <span class="font-medium text-slate-600">{item.name}</span>
                </div>
                <div class="col-span-1 text-center text-slate-400">{item.quantity}</div>
                <div class="col-span-2 text-right text-slate-400">${item.unitPrice.toLocaleString()}</div>
                <div class="col-span-3 text-right text-slate-600">${(item.quantity * item.unitPrice).toLocaleString()}</div>
              </div>
            {/each}
          {:else}
            <div class="grid grid-cols-12 items-center py-4 px-3 text-sm">
              <div class="col-span-6 flex items-center gap-3">
                <div class="w-10 h-10 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-slate-400">
                  <Icon iconName="icon/package" size={20} />
                </div>
                <span class="font-medium text-slate-600">Order items</span>
              </div>
              <div class="col-span-1 text-center text-slate-400">{order.items}</div>
              <div class="col-span-2 text-right text-slate-400">-</div>
              <div class="col-span-3 text-right text-slate-600">{order.amount}</div>
            </div>
          {/if}
        </div>
      </section>

      <div class="border-t border-slate-100 w-full"></div>

      <section>
        <h3 class="text-lg font-bold text-[#101828] mb-6">Payment Summary</h3>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <p class="text-sm text-slate-400 mb-1">Paid</p>
            <p class="text-base font-medium text-slate-700">{order.paymentStatus}</p>
          </div>
          <div>
            <p class="text-sm text-slate-400 mb-1">Unpaid</p>
            <p class="text-base font-medium text-slate-700">-</p>
          </div>
          <div>
            <p class="text-sm text-slate-400 mb-1">Total</p>
            <p class="text-base font-medium text-slate-700">{order.amount}</p>
          </div>
        </div>
      </section>

      <div class="border-t border-slate-100 w-full pt-4"></div>
    </div>
  </div>
</div>
{/if}

<style>
  /* Optional: Custom scrollbar for a cleaner look */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-thumb {
    background: #f1f5f9;
    border-radius: 10px;
  }
</style>