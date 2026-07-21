<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import UPDATE_MERCHANT from "$graphql/mutation/merchant/update.gql";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";

  interface EditLocationModalProps {
    isOpen?: boolean;
    merchantId?: string;
    currentBranchId?: string;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    merchantId = "",
    currentBranchId = "",
    onClose,
    onSuccess,
  }: EditLocationModalProps = $props();

  let branchId = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  function resetForm() {
    branchId = "";
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

  function handleBranchSelect(item: Record<string, any> | null) {
    branchId = item?.id ?? "";
  }

  async function handleConfirm() {
    if (!branchId || !merchantId) {
      error = "Please select a branch";
      return;
    }
    if (branchId === currentBranchId) {
      error = "Selected branch is the same as the current branch";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: UPDATE_MERCHANT,
        variables: {
          id: merchantId,
          object: { branch: branchId },
        },
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
    aria-labelledby="edit-location-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="edit-location-title" class="text-xl font-bold text-foreground">
          Change Merchant Location
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
          <label for="branch-select" class="text-sm font-medium text-foreground">
            Select New Branch
          </label>
          <SearchSelect
            query={LOCATION_QUERY}
            dataKey="branches"
            initialValue={currentBranchId}
            placeholder="Search and select branch"
            onSelect={handleBranchSelect}
          />
        </div>

        <div class="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-md">
          <Icon iconName="icon/alert-circle" size={20} class="text-orange-600 shrink-0 mt-0.5" />
          <p class="text-sm text-orange-800 leading-relaxed">
            Reassigning this merchant will update their assigned stock and reporting data.
          </p>
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
          onclick={handleConfirm}
          disabled={loading}
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[120px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Confirm Change
        </Button>
      </div>
    </div>
  </div>
{/if}
