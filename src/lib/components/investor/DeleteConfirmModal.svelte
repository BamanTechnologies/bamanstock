<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";

  interface DeleteConfirmModalProps {
    isOpen?: boolean;
    title?: string;
    message?: string;
    confirmButtonText?: string;
    itemName?: string;
    onClose?: () => void;
    onConfirm?: () => void;
  }

  let {
    isOpen = $bindable(false),
    title = "Confirm Deletion",
    message,
    confirmButtonText = "Delete",
    itemName,
    onClose,
    onConfirm,
  }: DeleteConfirmModalProps = $props();

  function handleClose() {
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  function handleConfirm() {
    onConfirm?.();
    handleClose();
  }

  // Default message if none provided
  const displayMessage = $derived(
    message ||
      (itemName
        ? `Are you sure you want to remove ${itemName}? This action cannot be undone.`
        : "Are you sure you want to proceed? This action cannot be undone.")
  );
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleEscape}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          {title}
        </h2>
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors"
          onclick={handleClose}
          aria-label="Close modal"
        >
          <Icon iconName="icon/x" size={20} class="text-foreground" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <p class="text-sm text-foreground leading-relaxed">
          {#if message}
            {@html displayMessage}
          {:else if itemName}
            Are you sure you want to remove <strong>{itemName}</strong>? This
            action cannot be undone.
          {:else}
            Are you sure you want to proceed? This action cannot be undone.
          {/if}
        </p>
      </div>

      <!-- Footer with Action Buttons -->
      <div
        class="flex items-center justify-end gap-3 p-6 border-t border-border"
      >
        <Button
          variant="outline"
          onclick={handleClose}
          class="border-border text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          onclick={handleConfirm}
          class="bg-red-600 text-white hover:bg-red-700"
        >
          {confirmButtonText}
        </Button>
      </div>
    </div>
  </div>
{/if}
