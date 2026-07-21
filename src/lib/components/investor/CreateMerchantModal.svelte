<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import REGISTER_MERCHANT from "$graphql/mutation/merchant/register.gql";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";

  interface CreateMerchantModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    onSuccess,
  }: CreateMerchantModalProps = $props();

  let firstName = $state("");
  let lastName = $state("");
  let phone = $state("");
  let address = $state("");
  let password = $state("");
  let branchId = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  function resetForm() {
    firstName = "";
    lastName = "";
    phone = "";
    address = "";
    password = "";
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

  async function handleSubmit() {
    if (!firstName || !lastName || !phone || !address || !password || !branchId) {
      error = "All fields are required";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");
      const result = await client.mutate<{ register_merchant: { message: string; status_code: number } }>({
        mutation: REGISTER_MERCHANT,
        variables: {
          firstName,
          lastName,
          phone,
          address,
          password,
          branchId,
        },
      });

      const res = result.data?.register_merchant;
      if (res && res.status_code >= 200 && res.status_code < 300) {
        onSuccess?.();
        handleClose();
      } else {
        error = res?.message ?? "Failed to register merchant";
      }
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
    aria-labelledby="create-merchant-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="create-merchant-title" class="text-xl font-bold text-foreground">
          Register New Merchant
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
            <label for="first-name" class="text-sm font-medium text-foreground">
              First Name
            </label>
            <Input
              id="first-name"
              type="text"
              bind:value={firstName}
              placeholder="Enter first name"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="last-name" class="text-sm font-medium text-foreground">
              Last Name
            </label>
            <Input
              id="last-name"
              type="text"
              bind:value={lastName}
              placeholder="Enter last name"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              bind:value={phone}
              placeholder="Enter phone number"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="address" class="text-sm font-medium text-foreground">
              Address
            </label>
            <Input
              id="address"
              type="text"
              bind:value={address}
              placeholder="Enter address"
              class="w-full"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="branch" class="text-sm font-medium text-foreground">
              Assign Branch
            </label>
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              placeholder="Search and select branch"
              onSelect={handleBranchSelect}
            />
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground">
              Password
            </label>
            <Input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Enter password"
              class="w-full"
              disabled={loading}
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
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[140px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Register Merchant
        </Button>
      </div>
    </div>
  </div>
{/if}
