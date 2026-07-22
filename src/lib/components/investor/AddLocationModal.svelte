<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import INSERT_BRANCH from "$graphql/mutation/locations/insert.gql";
  import UPDATE_BRANCH from "$graphql/mutation/locations/update.gql";
  import COMPANY_QUERY from "$graphql/queries/selector/company.gql";

  interface LocationData {
    id?: string;
    name: string;
    address: string;
    company?: string;
    companyName?: string;
  }

  interface AddLocationModalProps {
    isOpen?: boolean;
    location?: LocationData | null;
    onClose?: () => void;
    onSubmit?: (data: LocationData) => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    location = null,
    onClose,
    onSubmit,
    onSuccess,
  }: AddLocationModalProps = $props();

  const isEditMode = $derived(location !== null && !!location.id);

  let locationName = $state("");
  let address = $state("");
  let companyId = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (isOpen) {
      if (location) {
        locationName = location.name;
        address = location.address;
        companyId = location.company ?? "";
      } else {
        locationName = "";
        address = "";
        companyId = "";
      }
      error = null;
    }
  });

  function resetForm() {
    locationName = "";
    address = "";
    companyId = "";
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

  function handleCompanySelect(item: Record<string, any> | null) {
    companyId = item?.id ?? "";
  }

  async function handleSubmit() {
    if (!locationName || !address || !companyId) {
      error = "All fields are required";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");

      if (isEditMode && location?.id) {
        const object: Record<string, any> = {};
        if (locationName !== location.name) object.name = locationName;
        if (address !== location.address) object.address = address;
        if (companyId !== location.company) object.company = companyId;

        if (Object.keys(object).length === 0) {
          error = "No changes detected";
          loading = false;
          return;
        }

        await client.mutate({
          mutation: UPDATE_BRANCH,
          variables: { id: location.id, object },
        });
      } else {
        await client.mutate({
          mutation: INSERT_BRANCH,
          variables: {
            object: {
              name: locationName,
              address,
              company: companyId,
            },
          },
        });
      }

      onSuccess?.();
      onSubmit?.({ name: locationName, address, company: companyId });
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
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          {isEditMode ? "Edit Location" : "Create New Location"}
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
          <label for="location-name" class="text-sm font-medium text-foreground">
            Location Name
          </label>
          <Input
            id="location-name"
            type="text"
            bind:value={locationName}
            placeholder="e.g. Downtown Warehouse"
            class="w-full"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <label for="address" class="text-sm font-medium text-foreground">
            Address
          </label>
          <textarea
            id="address"
            bind:value={address}
            placeholder="Enter full address"
            rows="3"
            class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 resize-none disabled:opacity-50"
            disabled={loading}
          ></textarea>
        </div>

        <div class="space-y-2">
          <label for="company" class="text-sm font-medium text-foreground">
            Company
          </label>
          <SearchSelect
            query={COMPANY_QUERY}
            dataKey="companies"
            filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
            displayLabel={(item) => item.name}
            placeholder="Search and select company"
            initialValue={companyId}
            onSelect={handleCompanySelect}
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
          class="bg-[var(--primary-blue)] text-white hover:opacity-90 min-w-[140px]"
        >
          {#if loading}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          {isEditMode ? "Update Location" : "Create Location"}
        </Button>
      </div>
    </div>
  </div>
{/if}
