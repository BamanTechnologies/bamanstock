<script lang="ts">
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface RemoveStockItemModalProps {
    isOpen?: boolean;
    stockItemName?: string;
    onClose?: () => void;
    onConfirm?: () => void;
  }

  let {
    isOpen = $bindable(false),
    stockItemName = "",
    onClose,
    onConfirm,
  }: RemoveStockItemModalProps = $props();

  const message = $derived(
    "Are you sure you want to remove this item from your inventory? This will delete all associated stock records, including quantity and transaction history."
  );
</script>

<DeleteConfirmModal
  bind:isOpen
  title="Remove Stock Item"
  {message}
  confirmButtonText="Remove Item"
  {onClose}
  {onConfirm}
/>
