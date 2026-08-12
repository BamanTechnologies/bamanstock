<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";

  interface ConfirmModalProps {
    isOpen?: boolean;
    title?: string;
    icon?: string;
    message?: string;
    error?: string | null;
    confirmText?: string;
    cancelText?: string;
    loading?: boolean;
    onConfirm?: () => void;
    onClose?: () => void;
    propsClass?: string;
    propsIconClass?: string;
  }

  let {
    isOpen = $bindable(false),
    title = "Confirm",
    icon = "icon/alert-triangle" as any,
    message = "Are you sure you want to proceed?",
    error = null,
    confirmText = "Confirm",
    cancelText = "Cancel",
    loading = false,
    onConfirm,
    onClose,
    propsClass = "",
    propsIconClass = "",
  }: ConfirmModalProps = $props();

  function handleClose() {
    if (loading) return;
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) {
      handleClose();
    }
  }

  function handleConfirm() {
    onConfirm?.();
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleEscape}
    role="dialog"
    aria-modal="true"
    aria-labelledby="confirm-modal-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="confirm-modal-title" class="text-xl font-bold text-foreground">
          {title}
        </h2>
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          onclick={handleClose}
          disabled={loading}
          aria-label="Close modal"
        >
          <Icon iconName="icon/x" size={20} class="text-foreground" />
        </button>
      </div>

      <div class="p-6 flex flex-col items-center text-center gap-4">
        {#if error}
          <div class="w-full p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2 text-left">
            <Icon iconName="icon/alert-circle" size={16} class="text-destructive shrink-0 mt-0.5" />
            <p class="text-sm text-destructive break-words">{error}</p>
          </div>
        {/if}
        {#if icon}
          <div 
          class={`w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center ${propsIconClass}`}
          >
            <Icon iconName={icon as any} size={28} class="text-destructive" />
          </div>
        {/if}
        <p class="text-sm text-foreground leading-relaxed">
          {@html message}
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        <Button
          variant="outline"
          onclick={handleClose}
          disabled={loading}
          class="border-border text-foreground hover:bg-muted"
        >
          {cancelText}
        </Button>
        <Button
          onclick={handleConfirm}
          disabled={loading}
          class={`bg-red-600 text-white hover:bg-red-700 min-w-[100px] ${propsClass}`}
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          {confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}
