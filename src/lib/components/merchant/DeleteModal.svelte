<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  export let isOpen = false;
  export let itemName = "";
  export let close = () => {};
  export let onConfirm = () => {};
</script>

{#if isOpen}
<div class="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
  <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden p-8 text-center">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold">Remove Stock Item</h3>
      <button on:click={close}><Icon iconName="icon/x" size={20}/></button>
    </div>
    <p class="text-sm text-muted-foreground leading-relaxed mb-8">
      Are you sure you want to remove <strong>{itemName}</strong> from your inventory? This will delete all associated stock records.
    </p>
    <div class="flex justify-center gap-3">
      <button on:click={close} class="px-8 py-2 border rounded-md text-sm font-medium">Cancel</button>
      <button on:click={onConfirm} class="px-8 py-2 bg-red-600 text-white rounded-md text-sm font-medium">Remove Item</button>
    </div>
  </div>
</div>
{/if}