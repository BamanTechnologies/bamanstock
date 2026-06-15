<script lang="ts">
  import DeleteConfirmModal from "./DeleteConfirmModal.svelte";

  interface DeleteLocationModalProps {
    isOpen?: boolean;
    locationName?: string;
    onClose?: () => void;
    onConfirm?: () => void;
  }

  let {
    isOpen = $bindable(false),
    locationName = "",
    onClose,
    onConfirm,
  }: DeleteLocationModalProps = $props();

  const message = $derived(
    "Are you sure you want to remove the location? All merchants and stocks assigned to this location will need to be reassigned or will become unassigned."
  );
</script>

<DeleteConfirmModal
  bind:isOpen
  title="Remove Location"
  {message}
  confirmButtonText="Remove Location"
  {onClose}
  {onConfirm}
/>
