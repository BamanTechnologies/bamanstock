<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let onClose: () => void;

  let items = [{ id: 1, name: "Lenovo IdeaPad 3", qty: 2, price: 1200 }];

  function addItem() {
    items = [...items, { id: Date.now(), name: "", qty: 1, price: 0 }];
  }

  function removeItem(id: number) {
    items = items.filter(item => item.id !== id);
  }
</script>

{#if isOpen}
<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
    <div class="flex items-center justify-between p-6 border-b">
      <h2 class="text-xl font-bold text-slate-800">Create New Order</h2>
      <button on:click={onClose} class="text-slate-400 hover:text-slate-600">
        <Icon iconName="icon/x" size={24} />
      </button>
    </div>

    <div class="p-6 space-y-6">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-1">
          <label class="text-sm font-medium">Name</label>
          <input type="text" placeholder="Enter Customer Name" class="w-full border rounded-lg p-2 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Phone Number</label>
          <input type="text" placeholder="Enter Phone Number" class="w-full border rounded-lg p-2 text-sm" />
        </div>
      </div>

      <div class="space-y-3">
        <label class="text-sm font-medium">Order Items</label>
        {#each items as item}
          <div class="grid grid-cols-12 gap-2 items-end">
            <div class="col-span-5">
              <select class="w-full border rounded-lg p-2 text-sm">
                <option>{item.name}</option>
              </select>
            </div>
            <div class="col-span-2">
              <input type="number" bind:value={item.qty} class="w-full border rounded-lg p-2 text-sm" />
            </div>
            <div class="col-span-2">
              <input type="text" value="${item.price}" readonly class="w-full border bg-slate-50 rounded-lg p-2 text-sm" />
            </div>
            <div class="col-span-2 font-bold text-sm py-2">
              ${item.qty * item.price}
            </div>
            <button on:click={() => removeItem(item.id)} class="col-span-1 text-red-500 p-2">
              <Icon iconName="icon/trash" size={18} />
            </button>
          </div>
        {/each}
        <button on:click={addItem} class="text-blue-500 text-sm font-medium flex items-center gap-1">
          <Icon iconName="icon/plus" size={14} /> Add Item
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-4 border-t">
        <div class="space-y-1">
          <label class="text-sm font-medium">Discount</label>
          <input type="text" placeholder="$0.00" class="w-full border rounded-lg p-2 text-sm" />
        </div>
        <div class="space-y-1">
          <label class="text-sm font-medium">Tax</label>
          <input type="text" placeholder="8.25%" class="w-full border rounded-lg p-2 text-sm" />
        </div>
      </div>
    </div>

    <div class="p-6 border-t flex justify-end gap-3">
      <button on:click={onClose} class="px-6 py-2 border rounded-lg text-sm font-medium">Cancel</button>
      <button class="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Create Order</button>
    </div>
  </div>
</div>
{/if}