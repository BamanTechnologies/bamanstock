<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { getAuthClient } from "$graphql/client.js";
  import INSERT_WAIGHT_LIST from "$graphql/mutation/waight_list/insert.gql";
  import UPDATE_WAIGHT_LIST from "$graphql/mutation/waight_list/update.gql";
  import CUSTOMER_QUERY from "$graphql/queries/selector/customer.gql";
  import PRODUCT_QUERY from "$graphql/queries/selector/products.gql";

  const STATUS_OPTIONS = [
    { value: "on_waight", label: "On Waight" },
    { value: "addressed", label: "Addressed" },
    { value: "rejected", label: "Rejected" },
  ];

  interface WaightListModalProps {
    isOpen?: boolean;
    mode?: "add" | "edit";
    item?: Record<string, any> | null;
    productId?: string;
    customerId?: string;
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    mode = "add",
    item = null,
    productId = "",
    customerId = "",
    onClose,
    onSuccess,
  }: WaightListModalProps = $props();

  const isEditMode = $derived(mode === "edit");

  let selectedProductId = $state("");
  let selectedCustomerId = $state("");
  let quantity = $state("");
  let allowForReminder = $state(false);
  let isReminderSent = $state(false);
  let status = $state("on_waight");
  let loading = $state(false);
  let error = $state<string | null>(null);

  const editingProductName = $derived(
    item?.product ? `${item.product.name ?? ""}`.trim() : ""
  );
  const editingCustomerName = $derived(
    item?.customer
      ? `${item.customer.first_name ?? ""} ${item.customer.last_name ?? ""}`.trim()
      : ""
  );

  function resetForm() {
    selectedProductId = productId ?? "";
    selectedCustomerId = customerId ?? "";
    quantity = "";
    allowForReminder = false;
    isReminderSent = false;
    status = "on_waight";
    error = null;
  }

  function handleClose() {
    if (loading) return;
    isOpen = false;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) handleClose();
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) handleClose();
  }

  $effect(() => {
    if (!isOpen) return;
    error = null;
    if (isEditMode && item) {
      selectedProductId = item.product_id ?? "";
      selectedCustomerId = item.customer_id ?? "";
      quantity = String(item.quantity ?? "");
      allowForReminder = Boolean(item.allow_for_reminder);
      isReminderSent = Boolean(item.is_reminder_sent);
      status = item.status ?? "on_waight";
    } else {
      resetForm();
    }
  });

  async function handleSubmit() {
    if (!selectedProductId || !selectedCustomerId) {
      error = "Please select both a product and a customer";
      return;
    }
    const qty = Number(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      error = "Quantity must be a positive number";
      return;
    }
    if (!status) {
      error = "Status is required";
      return;
    }

    loading = true;
    error = null;

    try {
      const client = getAuthClient("investor");
      if (isEditMode && item?.id) {
        await client.mutate({
          mutation: UPDATE_WAIGHT_LIST,
          variables: {
            id: item.id,
            object: {
              quantity: qty,
              status,
              allow_for_reminder: allowForReminder,
              is_reminder_sent: isReminderSent,
            },
          },
        });
      } else {
        await client.mutate({
          mutation: INSERT_WAIGHT_LIST,
          variables: {
            object: {
              product_id: selectedProductId,
              customer_id: selectedCustomerId,
              quantity: qty,
              status,
              allow_for_reminder: allowForReminder,
              is_reminder_sent: isReminderSent,
            },
          },
        });
      }
      loading = false;
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
    aria-labelledby="waight-list-modal-title"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="waight-list-modal-title" class="text-xl font-bold text-foreground">
          {isEditMode ? "Edit Waight List" : "Add Waight List"}
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

        {#if isEditMode}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div class="space-y-2">
              <span class="block text-sm font-medium text-foreground">Product</span>
              <div class="px-3 py-2 border border-border rounded-md bg-muted/30 text-sm text-foreground">
                {editingProductName || item?.product?.name || "-"}
              </div>
            </div>
            <div class="space-y-2">
              <span class="block text-sm font-medium text-foreground">Customer</span>
              <div class="px-3 py-2 border border-border rounded-md bg-muted/30 text-sm text-foreground">
                {editingCustomerName || "-"}
              </div>
            </div>
          </div>
        {:else}
          <div class="grid grid-cols-1 gap-6">
            {#if !productId}
              <div class="space-y-2">
                <label for="product" class="text-sm font-medium text-foreground">
                  Product
                </label>
                <SearchSelect
                  query={PRODUCT_QUERY}
                  dataKey="products"
                  filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
                  displayLabel={(item) => item.name ?? item.id}
                  placeholder="Search and select product"
                  onSelect={(item) => { selectedProductId = item?.id ?? ""; }}
                />
              </div>
            {/if}

            {#if !customerId}
              <div class="space-y-2">
                <label for="customer" class="text-sm font-medium text-foreground">
                  Customer
                </label>
                <SearchSelect
                  query={CUSTOMER_QUERY}
                  dataKey="customers"
                  filterBuilder={(s) => ({
                    _or: [
                      { first_name: { _ilike: `%${s}%` } },
                      { last_name: { _ilike: `%${s}%` } },
                      { phone_number: { _ilike: `%${s}%` } },
                    ],
                  })}
                  displayLabel={(item) =>
                    `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() || item.id
                  }
                  placeholder="Search and select customer"
                  onSelect={(item) => { selectedCustomerId = item?.id ?? ""; }}
                />
              </div>
            {/if}
          </div>
        {/if}

        <div class="space-y-2">
          <label for="quantity" class="text-sm font-medium text-foreground">
            Quantity
          </label>
          <Input
            id="quantity"
            type="number"
            min="0"
            bind:value={quantity}
            placeholder="Enter quantity"
            class="w-full"
            disabled={loading}
          />
        </div>

        <div class="space-y-2">
          <label for="status" class="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none"
            bind:value={status}
            disabled={loading}
          >
            {#each STATUS_OPTIONS as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div class="border-t border-border pt-4 space-y-1">
          <ToggleSwitch label="Allow for Reminder" bind:checked={allowForReminder} />
          <ToggleSwitch label="Reminder Sent" bind:checked={isReminderSent} />
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
          {isEditMode ? "Save Changes" : "Add Waight List"}
        </Button>
      </div>
    </div>
  </div>
{/if}