<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import UPDATE_MERCHANT from "$graphql/mutation/merchant/update.gql";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";

  interface UpdateMerchantModalProps {
    isOpen?: boolean;
    merchant?: {
      id: string;
      first_name?: string;
      last_name?: string;
      phone_number?: string;
      address?: string;
      branch?: { id: string; name: string };
    } | null;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    merchant = null,
    onClose,
    onSuccess,
  }: UpdateMerchantModalProps = $props();

  let firstName = $state("");
  let lastName = $state("");
  let phone = $state("");
  let address = $state("");
  let branchId = $state("");
  let branchName = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (merchant) {
      firstName = merchant.first_name ?? "";
      lastName = merchant.last_name ?? "";
      phone = merchant.phone_number ?? "";
      address = merchant.address ?? "";
      branchId = merchant.branch?.id ?? "";
      branchName = merchant.branch?.name ?? "";
    }
  });

  function resetForm() {
    firstName = "";
    lastName = "";
    phone = "";
    address = "";
    branchId = "";
    branchName = "";
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

  async function handleSubmit() {
    if (!merchant) return;
    if (!firstName || !lastName) {
      error = "First name and last name are required";
      return;
    }

    loading = true;
    error = null;

    try {
      const object: Record<string, any> = {};
      if (firstName !== (merchant.first_name ?? "")) object.first_name = firstName;
      if (lastName !== (merchant.last_name ?? "")) object.last_name = lastName;
      if (phone !== (merchant.phone_number ?? "")) object.phone_number = phone;
      if (address !== (merchant.address ?? "")) object.address = address;
      if (branchId && branchId !== (merchant.branch?.id ?? "")) object.branch = branchId;

      if (Object.keys(object).length === 0) {
        error = "No changes detected";
        loading = false;
        return;
      }

      const client = getAuthClient("investor");
      await client.mutate({
        mutation: UPDATE_MERCHANT,
        variables: {
          id: merchant.id,
          object,
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
    aria-labelledby="update-merchant-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="update-merchant-title" class="text-xl font-bold text-foreground">
          Edit Merchant
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

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label for="edit-first-name" class="text-sm font-medium text-foreground">
              First Name
            </label>
            <Input
              id="edit-first-name"
              type="text"
              bind:value={firstName}
              placeholder="Enter first name"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="edit-last-name" class="text-sm font-medium text-foreground">
              Last Name
            </label>
            <Input
              id="edit-last-name"
              type="text"
              bind:value={lastName}
              placeholder="Enter last name"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="edit-phone" class="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="edit-phone"
              type="tel"
              bind:value={phone}
              placeholder="Enter phone number"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="edit-address" class="text-sm font-medium text-foreground">
              Address
            </label>
            <Input
              id="edit-address"
              type="text"
              bind:value={address}
              placeholder="Enter address"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2 md:col-span-2">
            <label for="edit-branch" class="text-sm font-medium text-foreground">
              Assign Branch
            </label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              initialValue={branchId}
              placeholder="Search and select branch"
              onSelect={handleBranchSelect}
            />
          </div>
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
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[100px]"
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
