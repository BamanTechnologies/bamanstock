<script lang="ts">
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface DeleteMerchantModalProps {
    isOpen?: boolean;
    merchantName?: string;
    onClose?: () => void;
    onConfirm?: () => void;
  }

  let {
    isOpen = $bindable(false),
    merchantName = "",
    onClose,
    onConfirm,
  }: DeleteMerchantModalProps = $props();

  const message = $derived(
    `Are you sure you want to remove <strong>${merchantName}</strong>? This action will revoke their access to all assigned stocks and cannot be undone.`
  );
</script>

<DeleteConfirmModal
  bind:isOpen
  title="Remove Merchant"
  {message}
  confirmButtonText="Remove Merchant"
  {onClose}
  {onConfirm}
/>
