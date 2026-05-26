<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let close = () => {};
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
    <div class="p-6 border-b flex justify-between items-center">
      <h3 class="text-lg font-bold">Add New Product</h3>
      <button on:click={close}><Icon iconName="icon/x" size={20}/></button>
    </div>
    <div class="p-6 grid grid-cols-2 gap-4">
      <div class="space-y-1">
        <label class="text-sm font-medium">Product Name</label>
        <input type="text" placeholder="Search for a stock by name" class="w-full border p-2 rounded-md text-sm"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Category</label>
        <input type="text" placeholder="Enter Category" class="w-full border p-2 rounded-md text-sm"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Quantity</label>
        <input type="number" placeholder="e.g. 100" class="w-full border p-2 rounded-md text-sm"/>
      </div>
      <div class="space-y-1">
        <label class="text-sm font-medium">Unit Price</label>
        <input type="text" placeholder="$150" class="w-full border p-2 rounded-md text-sm"/>
      </div>
      <div class="col-span-2 space-y-1">
        <label class="text-sm font-medium">Description</label>
        <textarea placeholder="Enter product description" class="w-full border p-2 rounded-md text-sm h-24"></textarea>
      </div>
      <div class="col-span-2">
        <label class="text-sm font-medium">Upload Image</label>
        <div class="border-2 border-dashed border-blue-200 rounded-lg p-8 text-center bg-blue-50/30 mt-1">
          <Icon iconName="icon/upload-cloud" size={32} className="mx-auto text-info mb-2"/>
          <p class="text-sm"><span class="text-info font-bold cursor-pointer">Click to upload</span> or drag and drop</p>
          <p class="text-xs text-muted-foreground mt-1">JPG, PNG, or GIF (MAX 800x400 px)</p>
        </div>
      </div>
    </div>
    <div class="p-6 flex justify-end gap-3 bg-gray-50/50">
      <button on:click={close} class="px-6 py-2 border rounded-md text-sm font-medium bg-white">Cancel</button>
      <button class="px-6 py-2 bg-info text-white rounded-md text-sm font-medium">Create Product</button>
    </div>
  </div>
</div>
{/if}