<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { getAuthClient } from "$graphql/client.js";
  import WaightListModal from "$lib/components/investor/WaightListModal.svelte";
  import WaightListDeleteConfirmModal from "$lib/components/investor/WaightListDeleteConfirmModal.svelte";
  import type { DocumentNode } from "@apollo/client";

  const STATUS_OPTIONS = [
    { value: "on_waight", label: "On Waight" },
    { value: "addressed", label: "Addressed" },
    { value: "rejected", label: "Rejected" },
  ];

  let {
    query,
    productId = "",
    customerId = "",
  }: {
    query: DocumentNode;
    productId?: string;
    customerId?: string;
  } = $props();

  const showProductColumn = $derived(!productId);
  const showCustomerColumn = $derived(!customerId);

  const columnCount = $derived(
    5 + (showProductColumn ? 1 : 0) + (showCustomerColumn ? 1 : 0)
  );

  // ===================== State =====================
  function wlSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (wlDebouncedSearch) params.set("wl_search", wlDebouncedSearch); else params.delete("wl_search");
    if (wlStatusFilter) params.set("wl_status", wlStatusFilter); else params.delete("wl_status");
    if (wlCurrentPage > 1) params.set("wl_page", String(wlCurrentPage)); else params.delete("wl_page");
    if (wlRowsPerPage !== 10) params.set("wl_limit", String(wlRowsPerPage)); else params.delete("wl_limit");
    if (wlSortColumn !== "created_at") params.set("wl_sort", wlSortColumn); else params.delete("wl_sort");
    if (wlSortDirection !== "desc") params.set("wl_dir", wlSortDirection); else params.delete("wl_dir");
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let wlSearchQuery = $state($page.url.searchParams.get("wl_search") ?? "");
  let wlStatusFilter = $state($page.url.searchParams.get("wl_status") ?? "");
  let wlCurrentPage = $state(Number($page.url.searchParams.get("wl_page")) || 1);
  let wlRowsPerPage = $state(Number($page.url.searchParams.get("wl_limit")) || 10);
  let wlSortColumn = $state($page.url.searchParams.get("wl_sort") || "created_at");
  let wlSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("wl_dir") as "asc" | "desc") || "desc"
  );

  let wlData = $state<any[]>([]);
  let wlTotalCount = $state(0);
  let wlLoading = $state(false);
  let wlRefetchTrigger = $state(0);

  let wlDebouncedSearch = $state($page.url.searchParams.get("wl_search") ?? "");
  let wlDebounceTimer: ReturnType<typeof setTimeout>;

  let isAddModalOpen = $state(false);
  let editingItem = $state<any>(null);
  let isEditModalOpen = $state(false);
  let deletingItem = $state<any>(null);
  let isDeleteModalOpen = $state(false);

  $effect(() => {
    clearTimeout(wlDebounceTimer);
    if (wlSearchQuery === wlDebouncedSearch) return;
    wlDebounceTimer = setTimeout(() => {
      wlDebouncedSearch = wlSearchQuery;
      wlCurrentPage = 1;
    }, 400);
    return () => clearTimeout(wlDebounceTimer);
  });

  const wlTotalPages = $derived(Math.max(1, Math.ceil(wlTotalCount / wlRowsPerPage)));

  function wlBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (productId) conditions.push({ product_id: { _eq: productId } });
    if (customerId) conditions.push({ customer_id: { _eq: customerId } });
    if (wlStatusFilter) conditions.push({ status: { _eq: wlStatusFilter } });
    if (wlDebouncedSearch) {
      conditions.push({
        _or: [
          { customer: { first_name: { _ilike: `%${wlDebouncedSearch}%` } } },
          { customer: { last_name: { _ilike: `%${wlDebouncedSearch}%` } } },
          { customer: { phone_number: { _ilike: `%${wlDebouncedSearch}%` } } },
          { product: { name: { _ilike: `%${wlDebouncedSearch}%` } } },
          // { product: { product_type: { name: { _ilike: `%${wlDebouncedSearch}%` } } } },
          // { status: { _ilike: `%${wlDebouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function wlBuildOrder(): Record<string, unknown>[] {
    switch (wlSortColumn) {
      case "product":
        return [{ product: { name: wlSortDirection } }];
      case "customer":
        return [{ customer: { first_name: wlSortDirection } }];
      case "quantity":
        return [{ quantity: wlSortDirection }];
      case "status":
        return [{ status: wlSortDirection }];
      case "created_at":
      default:
        return [{ created_at: wlSortDirection }];
    }
  }

  $effect(() => {
    void productId;
    void customerId;
    void wlRefetchTrigger;
    void wlDebouncedSearch;
    void wlStatusFilter;
    void wlCurrentPage;
    void wlRowsPerPage;
    void wlSortColumn;
    void wlSortDirection;
    wlLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query,
          variables: {
            limit: wlRowsPerPage,
            offset: (wlCurrentPage - 1) * wlRowsPerPage,
            filter: wlBuildFilter(),
            order: wlBuildOrder(),
          },
        });
        const d = result.data as any;
        wlData = d?.customer_waight_lists ?? [];
        wlTotalCount = d?.total?.aggregate?.count ?? 0;
        wlSyncUrl();
      } catch {
        wlData = [];
        wlTotalCount = 0;
      } finally {
        wlLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  function wlHandleSort(column: string) {
    if (wlSortColumn === column) {
      wlSortDirection = wlSortDirection === "asc" ? "desc" : "asc";
    } else {
      wlSortColumn = column;
      wlSortDirection = "asc";
    }
    wlCurrentPage = 1;
  }

  function openEdit(item: any) {
    editingItem = item;
    isEditModalOpen = true;
  }

  function openDelete(item: any) {
    deletingItem = item;
    isDeleteModalOpen = true;
  }

  // ===================== Utilities =====================
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

<div class="space-y-6">
  <div class="bg-card border border-border rounded-lg overflow-hidden">
    <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
      <div class="relative flex-1 min-w-[220px] sm:max-w-xs shrink-0">
        <Icon
          iconName="icon/search"
          size={16}
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search by customer, product, status..."
          class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
          bind:value={wlSearchQuery}
        />
      </div>
      <div class="flex items-center gap-3 ml-auto flex-wrap">
        <select
          class="w-full sm:w-40 px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none"
          bind:value={wlStatusFilter}
          onchange={() => { wlCurrentPage = 1; }}
        >
          <option value="">All Status</option>
          {#each STATUS_OPTIONS as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
        <Button
          class="bg-[var(--primary-blue)] text-white text-xs sm:text-base hover:opacity-90"
          onclick={() => (isAddModalOpen = true)}
        >
          <Icon iconName="icon/plus" size={16} class="mr-2" />
          Add Waight List
        </Button>
      </div>
    </div>

    {#if wlLoading}
      <div class="h-1 bg-muted/30 w-full overflow-hidden">
        <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
      </div>
    {/if}

    <div class="overflow-x-auto">
      <table class="w-full text-sm">
        <thead class="uppercase bg-muted/30 border-b border-border">
          <tr class="text-left text-xs text-muted-foreground uppercase">
            {#if showProductColumn}
              <th class="px-4 py-3 font-medium">
                <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => wlHandleSort("product")}>
                  Product
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10} class={wlSortColumn === 'product' && wlSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                    <Icon iconName="icon/chevron-down" size={10} class={wlSortColumn === 'product' && wlSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                  </span>
                </button>
              </th>
            {/if}
            {#if showCustomerColumn}
              <th class="px-4 py-3 font-medium">
                <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => wlHandleSort("customer")}>
                  Customer
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10} class={wlSortColumn === 'customer' && wlSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                    <Icon iconName="icon/chevron-down" size={10} class={wlSortColumn === 'customer' && wlSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                  </span>
                </button>
              </th>
            {/if}
            <th class="px-4 py-3 font-medium">
              <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => wlHandleSort("quantity")}>
                Qty
                <span class="flex flex-col ml-0.5">
                  <Icon iconName="icon/chevron-up" size={10} class={wlSortColumn === 'quantity' && wlSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                  <Icon iconName="icon/chevron-down" size={10} class={wlSortColumn === 'quantity' && wlSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                </span>
              </button>
            </th>
            <th class="px-4 py-3 font-medium">
              <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => wlHandleSort("status")}>
                Status
                <span class="flex flex-col ml-0.5">
                  <Icon iconName="icon/chevron-up" size={10} class={wlSortColumn === 'status' && wlSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                  <Icon iconName="icon/chevron-down" size={10} class={wlSortColumn === 'status' && wlSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                </span>
              </button>
            </th>
            <th class="px-4 py-3 font-medium">Reminder</th>
            <th class="px-4 py-3 font-medium">
              <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => wlHandleSort("created_at")}>
                Date Added
                <span class="flex flex-col ml-0.5">
                  <Icon iconName="icon/chevron-up" size={10} class={wlSortColumn === 'created_at' && wlSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                  <Icon iconName="icon/chevron-down" size={10} class={wlSortColumn === 'created_at' && wlSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                </span>
              </button>
            </th>
            <th class="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          {#if wlData.length === 0 && !wlLoading}
            <tr>
              <td colspan={columnCount} class="px-4 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center gap-2">
                  <Icon iconName="icon/package" size={32} class="text-muted-foreground" />
                  <p>No waight lists found</p>
                </div>
              </td>
            </tr>
          {:else}
            {#each wlData as item}
              <tr class="hover:bg-muted/20 transition-colors">
                {#if showProductColumn}
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-md bg-[#4DA0E6]/10 flex items-center justify-center shrink-0">
                        <Icon iconName="icon/package" size={16} class="text-[#4DA0E6]" />
                      </div>
                      <div>
                        <span class="text-sm font-medium text-foreground">{item.product?.name ?? "-"}</span>
                        {#if item.product?.product_type?.name}
                          <p class="text-xs text-muted-foreground">{item.product.product_type.name}</p>
                        {/if}
                      </div>
                    </div>
                  </td>
                {/if}
                {#if showCustomerColumn}
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
                {/if}
                <td class="px-4 py-3 text-foreground font-medium">{item.quantity ?? 0}</td>
                <td class="px-4 py-3">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {statusClass(item.status)}">
                    {item.status ?? "-"}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-1">
                    <span class="inline-flex items-center gap-1.5 text-xs {item.allow_for_reminder ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}">
                      <Icon iconName={item.allow_for_reminder ? "icon/check-circle" : "icon/x-circle"} size={14} />
                      Allow
                    </span>
                    <span class="inline-flex items-center gap-1.5 text-xs {item.is_reminder_sent ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}">
                      <Icon iconName={item.is_reminder_sent ? "icon/check-circle" : "icon/x-circle"} size={14} />
                      Sent
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-muted-foreground text-xs">{fmtDate(item.created_at)}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit"
                      onclick={() => openEdit(item)}
                    >
                      <Icon iconName="icon/edit" size={16} />
                    </button>
                    <button
                      type="button"
                      class="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete"
                      onclick={() => openDelete(item)}
                    >
                      <Icon iconName="icon/trash" size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <div class="p-4 border-t border-border flex flex-col gap-2 sm:flex-row items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs sm:text-sm text-muted-foreground">Row Per Page</span>
        <select
          class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
          bind:value={wlRowsPerPage}
          onchange={() => { wlCurrentPage = 1; }}
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
          disabled={wlCurrentPage === 1}
          onclick={() => wlCurrentPage = wlCurrentPage - 1}
        >
          <Icon iconName="icon/chevron-left" size={16} />
        </button>
        {#each getVisiblePages(wlCurrentPage, wlTotalPages) as p}
          {#if typeof p === "number"}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === wlCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
              style={p === wlCurrentPage ? 'background-color:#4DA0E6;' : ''}
              onclick={() => wlCurrentPage = p}
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
          disabled={wlCurrentPage === wlTotalPages}
          onclick={() => wlCurrentPage = wlCurrentPage + 1}
        >
          <Icon iconName="icon/chevron-right" size={16} />
        </button>
      </div>
    </div>
  </div>
</div>

<WaightListModal
  isOpen={isAddModalOpen}
  mode="add"
  {productId}
  {customerId}
  onSuccess={() => { wlRefetchTrigger++; }}
  onClose={() => (isAddModalOpen = false)}
/>

<WaightListModal
  isOpen={isEditModalOpen}
  mode="edit"
  item={editingItem}
  onSuccess={() => { wlRefetchTrigger++; }}
  onClose={() => { isEditModalOpen = false; editingItem = null; }}
/>

<WaightListDeleteConfirmModal
  isOpen={isDeleteModalOpen}
  item={deletingItem}
  onSuccess={() => { wlRefetchTrigger++; }}
  onClose={() => { isDeleteModalOpen = false; deletingItem = null; }}
/>

<style>
  :global(.loading-slide) {
    animation: loading-slide 1.5s infinite linear;
  }
  @keyframes loading-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>