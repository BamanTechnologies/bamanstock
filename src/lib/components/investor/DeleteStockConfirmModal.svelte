<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { getAuthClient } from "$graphql/client.ts";
  import DELETE_STOCK from "$graphql/mutation/stock/delete.gql";

  interface DeleteStockConfirmModalProps {
    isOpen?: boolean;
    stock?: { id: string; product?: { name?: string } } | null;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    stock = null,
    onClose,
    onSuccess,
  }: DeleteStockConfirmModalProps = $props();

  let loading = $state(false);
  let error = $state<string | null>(null);

  function handleClose() {
    if (loading) return;
    isOpen = false;
    error = null;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) {
      handleClose();
    }
  }

  async function handleConfirm() {
    if (!stock) return;
    loading = true;
    error = null;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: DELETE_STOCK,
        variables: { id: stock.id },
      });
      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error = err.message ?? "Failed to delete stock";
    } finally {
      loading = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={(e) => { if (e.key === "Escape" && !loading) handleClose(); }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-xl font-bold text-foreground">Delete Stock Item</h2>
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

      <div class="p-6 space-y-4">
        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <Icon iconName="icon/alert-circle" size={16} class="text-destructive shrink-0 mt-0.5" />
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        <p class="text-foreground">
          Are you sure you want to delete stock item
          <span class="font-semibold">"{stock?.product?.name ?? stock?.id ?? ""}"</span>?
          This action cannot be undone.
        </p>
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        <Button
          variant="outline"
          onclick={handleClose}
          disabled={loading}
          class="border-border text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          onclick={handleConfirm}
          disabled={loading}
          class="bg-destructive text-white hover:opacity-90 min-w-[120px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Delete
        </Button>
      </div>
    </div>
  </div>
{/if}
