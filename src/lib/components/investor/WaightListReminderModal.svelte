<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { getAuthClient } from "$graphql/client.js";
  import { toast } from "svelte-sonner";
  import REMINDER_LIST from "$graphql/queries/waight_list/reminder_list.gql";
  import AVAILABLE_STOCK_QUERY from "$graphql/queries/product/product_available_stock.gql";
  import SEND_SMS from "$graphql/mutation/customers/send_sms.gql";

  interface WaightListReminderModalProps {
    isOpen?: boolean;
    productId?: string;
    onClose?: () => void;
  }

  let {
    isOpen = $bindable(false),
    productId = "",
    onClose,
  }: WaightListReminderModalProps = $props();

  let productName = $state("");
  let availableStock = $state(0);
  let availableStockLoaded = $state(false);

  let list = $state<any[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);
  let hasData = $state(false);
  let refreshTrigger = $state(0);

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  let sortColumn = $state("created_at");
  let sortDirection = $state<"asc" | "desc">("desc");

  let selectedIds = $state<string[]>([]);
  let isReminderConfirmOpen = $state(false);
  let reminderSending = $state(false);
  let reminderError = $state<string | null>(null);

  const totalPages = $derived(Math.max(1, Math.ceil(totalCount / rowsPerPage)));
  const selectableRows = $derived(list);
  const allSelectableSelected = $derived(
    selectableRows.length > 0 && selectableRows.every((r) => selectedIds.includes(r.id))
  );

  function buildFilter(): Record<string, unknown> {
    return {
      product_id: { _eq: productId },
      allow_for_reminder: { _eq: true },
      quantity: { _lte: availableStock },
    };
  }

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "customer":
        return [{ customer: { first_name: sortDirection } }];
      case "quantity":
        return [{ quantity: sortDirection }];
      case "status":
        return [{ status: sortDirection }];
      case "created_at":
      default:
        return [{ created_at: sortDirection }];
    }
  }

  function handleClose() {
    selectedIds = [];
    isReminderConfirmOpen = false;
    reminderError = null;
    hasData = false;
    isOpen = false;
    onClose?.();
  }

  function toggleSelect(id: string, checked: boolean) {
    if (checked) {
      if (!selectedIds.includes(id)) selectedIds = [...selectedIds, id];
    } else {
      selectedIds = selectedIds.filter((sid) => sid !== id);
    }
  }

  function toggleSelectAll(checked: boolean) {
    if (checked) {
      selectedIds = [...new Set([...selectedIds, ...selectableRows.map((r) => r.id)])];
    } else {
      const ids = new Set(selectableRows.map((r) => r.id));
      selectedIds = selectedIds.filter((sid) => !ids.has(sid));
    }
  }

  async function confirmSendReminder() {
    if (selectedIds.length === 0) return;
    reminderSending = true;
    reminderError = null;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: SEND_SMS,
        variables: { ids: selectedIds, isWaightListReminder: true },
      });
      toast.success("Reminder SMS sent successfully");
      selectedIds = [];
      isReminderConfirmOpen = false;
      refreshTrigger++;
    } catch (err: any) {
      reminderError = err.message ?? "Failed to send reminder SMS";
    } finally {
      reminderSending = false;
    }
  }

  $effect(() => {
    void isOpen;
    void productId;
    void currentPage;
    void rowsPerPage;
    void sortColumn;
    void sortDirection;
    void refreshTrigger;

    if (!isOpen || !productId) return;

    loading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");

        if (!availableStockLoaded) {
          const pRes = await client.query({
            query: AVAILABLE_STOCK_QUERY,
            variables: { id: productId },
          });
          const prod = (pRes.data as any)?.products_by_pk;
          availableStock = prod?.current_available_stock ?? 0;
          productName = prod?.name ?? "";
          availableStockLoaded = true;
        }

        const result = await client.query({
          query: REMINDER_LIST,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: buildOrder(),
          },
        });
        const d = result.data as any;
        list = d?.customer_waight_lists ?? [];
        totalCount = d?.total?.aggregate?.count ?? 0;

        if (totalCount === 0) {
          handleClose();
          return;
        }
        hasData = true;
      } catch {
        handleClose();
      } finally {
        loading = false;
      }
    }, 0);
    return () => clearTimeout(timer);
  });

  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }
    currentPage = 1;
  }

  const AVATAR_COLORS = [
    "#4DA0E6", "#D15B7A", "#34A853", "#FBBC05",
    "#FF6B6B", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77",
  ];

  function avatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  }

  function initials(first_name: string, last_name: string): string {
    return (first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "");
  }

  function customerName(item: any): string {
    if (!item?.customer) return "-";
    return `${item.customer.first_name ?? ""} ${item.customer.last_name ?? ""}`.trim() || "-";
  }

  function statusClass(status: string): string {
    switch (status) {
      case "on_waight":
        return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300";
      case "addressed":
        return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
      case "rejected":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300";
    }
  }

  function fmtDate(val: string | null | undefined): string {
    if (!val) return "-";
    return new Date(val).toLocaleDateString();
  }

  function getVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("..."); pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1); pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1); pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("..."); pages.push(total);
    }
    return pages;
  }
</script>

{#if isOpen && hasData}
  <!-- svelte-ignore a11y_no_static_element_interactions a11y_click_events_have_key_events -->
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={(e) => { if (e.target === e.currentTarget && !reminderSending) handleClose(); }}
    onkeydown={(e) => { if (e.key === "Escape" && !reminderSending) handleClose(); }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="waight-reminder-title"
    tabindex="-1"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_click_events_have_key_events -->
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h2 id="waight-reminder-title" class="text-xl font-bold text-foreground">
            Waight List Reminders
          </h2>
          {#if productName}
            <p class="text-sm text-muted-foreground mt-1">
              {productName} — <span class="font-medium text-foreground">{availableStock}</span> available
            </p>
          {/if}
        </div>
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors disabled:opacity-30"
          onclick={handleClose}
          disabled={reminderSending}
          aria-label="Close modal"
        >
          <Icon iconName="icon/x" size={20} class="text-foreground" />
        </button>
      </div>

      <div class="p-6">
        {#if loading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="flex items-center justify-between gap-3 flex-wrap mb-4">
          <p class="text-sm text-muted-foreground">
            {totalCount} eligible waight list{totalCount !== 1 ? 's' : ''} — customers waiting for this product
          </p>
          {#if selectedIds.length > 0}
            <Button
              class="bg-green-600 text-white text-xs sm:text-base hover:bg-green-700"
              onclick={() => (isReminderConfirmOpen = true)}
            >
              <Icon iconName="icon/send" size={16} class="mr-2" />
              Send SMS Reminder ({selectedIds.length})
            </Button>
          {/if}
        </div>

        <div class="border border-border rounded-lg overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    class="accent-[#4DA0E6] w-4 h-4 cursor-pointer"
                    checked={allSelectableSelected}
                    disabled={selectableRows.length === 0}
                    onchange={(e) => toggleSelectAll(e.currentTarget.checked)}
                  />
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => handleSort("customer")}>
                    Customer
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={sortColumn === 'customer' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={sortColumn === 'customer' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => handleSort("quantity")}>
                    Qty
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={sortColumn === 'quantity' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={sortColumn === 'quantity' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => handleSort("status")}>
                    Status
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={sortColumn === 'status' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={sortColumn === 'status' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Reminder</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => handleSort("created_at")}>
                    Date
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={sortColumn === 'created_at' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={sortColumn === 'created_at' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {#each list as item}
                <tr class="hover:bg-muted/20 transition-colors">
                  <td class="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      class="accent-[#4DA0E6] w-4 h-4 cursor-pointer"
                      checked={selectedIds.includes(item.id)}
                      onchange={(e) => toggleSelect(item.id, e.currentTarget.checked)}
                    />
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                        style="background-color: {avatarColor(item.customer?.first_name ?? 'C')}"
                      >
                        {initials(item.customer?.first_name, item.customer?.last_name)}
                      </div>
                      <div>
                        <span class="text-sm font-medium text-foreground">{customerName(item)}</span>
                        {#if item.customer?.phone_number}
                          <p class="text-xs text-muted-foreground">{item.customer.phone_number}</p>
                        {/if}
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 text-foreground">
                    <span class="font-medium">{item.quantity ?? "-"}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span class={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass(item.status)}`}>
                      {item.status ?? "-"}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    {#if item.is_reminder_sent}
                      <span class="inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <Icon iconName="icon/check-circle" size={14} />
                        Sent
                      </span>
                    {:else}
                      <span class="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                        <Icon iconName="icon/x-circle" size={14} />
                        Not sent
                      </span>
                    {/if}
                  </td>
                  <td class="px-4 py-3 text-muted-foreground">{fmtDate(item.created_at)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex flex-col gap-2 sm:flex-row items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xs sm:text-sm text-muted-foreground">Row Per Page</span>
            <select
              class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
              bind:value={rowsPerPage}
              onchange={() => { currentPage = 1; }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span class="text-xs sm:text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={currentPage === 1}
              onclick={() => currentPage = currentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(currentPage, totalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === currentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === currentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => currentPage = p}
                >
                  {p}
                </button>
              {:else}
                <span class="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
              {/if}
            {/each}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={currentPage === totalPages}
              onclick={() => currentPage = currentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>

      {#if isReminderConfirmOpen}
        <div
          class="border-t border-border p-6"
        >
          {#if reminderError}
            <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2 mb-4">
              <Icon iconName="icon/alert-circle" size={16} class="text-destructive shrink-0 mt-0.5" />
              <p class="text-sm text-destructive">{reminderError}</p>
            </div>
          {/if}

          <p class="text-sm text-foreground leading-relaxed">
            Are you sure you want to send
            <strong>{selectedIds.length}</strong> reminder{selectedIds.length !== 1 ? 's' : ''}
            to customers to order the product they are waiting for?
          </p>

          <div class="flex items-center justify-end gap-3 mt-4">
            <Button
              variant="outline"
              onclick={() => (isReminderConfirmOpen = false)}
              disabled={reminderSending}
              class="border-border text-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              onclick={confirmSendReminder}
              disabled={reminderSending || selectedIds.length === 0}
              class="bg-green-600 text-white hover:bg-green-700 min-w-[140px]"
            >
              {#if reminderSending}
                <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              {/if}
              Send Reminder
            </Button>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  :global(.loading-slide) {
    animation: loading-slide 1.5s infinite linear;
  }
  @keyframes loading-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>