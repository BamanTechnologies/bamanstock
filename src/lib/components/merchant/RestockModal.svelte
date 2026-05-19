<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let close = () => {};
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
    <div class="p-6 border-b flex justify-between items-center">
      <h3 class="text-lg font-bold">Restock Item</h3>
      <button on:click={close}><Icon iconName="icon/x" size={20}/></button>
    </div>
    <div class="p-6 space-y-5">
      <div class="space-y-2">
        <label class="text-sm font-medium">Select Product</label>
        <div class="flex flex-wrap gap-2 border p-2 rounded-md min-h-[42px]">
          <span class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs border">Amazon Echo Dot <button class="ml-1">×</button></span>
          <span class="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs border">Beats Pro <button class="ml-1">×</button></span>
          <input type="text" placeholder="Search products" class="flex-1 outline-none text-xs"/>
        </div>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">Category</label>
        <select class="w-full border p-2 rounded-md text-sm"><option>Keep Existing Category</option></select>
        <p class="text-[10px] text-muted-foreground italic">If changed, the selected category will apply to all selected products</p>
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium">Quantity Update</label>
        <div class="flex items-center justify-between border-2 border-info/40 bg-info/5 p-3 rounded-lg">
          <div class="flex items-center gap-2">
             <input type="radio" checked class="accent-info" />
             <span class="text-sm">Increase Quantity by</span>
          </div>
          <input type="number" value="15" class="w-16 border rounded p-1 text-center text-sm font-bold"/>
        </div>
      </div>
    </div>
    <div class="p-6 flex justify-end gap-3 border-t">
      <button on:click={close} class="px-6 py-2 border rounded-md text-sm font-medium">Cancel</button>
      <button class="px-6 py-2 bg-info text-white rounded-md text-sm font-medium">Restock Item</button>
    </div>
  </div>
</div>
{/if}