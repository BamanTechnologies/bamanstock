<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { getAuthClient } from "$graphql/client.ts";
  import UPDATE_STOCK from "$graphql/mutation/stock/update.gql";

  interface UpdateStockModalProps {
    isOpen?: boolean;
    stock?: { id: string; quantity: number; batch_number: string } | null;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    stock = null,
    onClose,
    onSuccess,
  }: UpdateStockModalProps = $props();

  let quantity = $state("");
  let batchNumber = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (isOpen && stock) {
      quantity = String(stock.quantity ?? "");
      batchNumber = stock.batch_number ?? "";
      error = null;
    }
  });

  function resetForm() {
    quantity = "";
    batchNumber = "";
    error = null;
  }

  function handleClose() {
    isOpen = false;
    resetForm();
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

  async function handleSubmit() {
    if (!stock) return;

    const object: Record<string, any> = {};
    const qty = Number(quantity);
    if (!isNaN(qty) && qty !== stock.quantity) object.quantity = qty;

    if (Object.keys(object).length === 0) {
      error = "No changes detected";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: UPDATE_STOCK,
        variables: { id: stock.id, object },
      });

      onSuccess?.();
      handleClose();
    } catch (err: any) {
      error = err.message ?? "An unexpected error occurred";
    } finally {
      loading = false;
    }
  }
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleEscape}
    role="dialog"
    aria-modal="true"
    aria-labelledby="update-stock-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="update-stock-title" class="text-xl font-bold text-foreground">
          Update Stock
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

      <div class="p-6 space-y-6">
        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <Icon iconName="icon/alert-circle" size={16} class="text-destructive shrink-0 mt-0.5" />
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        <div class="space-y-2">
          <label for="update-quantity" class="text-sm font-medium text-foreground">
            Quantity
          </label>
          <Input
            id="update-quantity"
            type="number"
            bind:value={quantity}
            class="w-full"
            disabled={loading}
            min="0"
          />
        </div>

        <div class="space-y-2">
          <label for="update-batch" class="text-sm font-medium text-foreground">
            Batch Number
          </label>
          <Input
            id="update-batch"
            type="text"
            bind:value={batchNumber}
            class="w-full bg-muted/30"
            disabled
          />
        </div>
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
          onclick={handleSubmit}
          disabled={loading}
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[120px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Save Changes
        </Button>
      </div>
    </div>
  </div>
{/if}
