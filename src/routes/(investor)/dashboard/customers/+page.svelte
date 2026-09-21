<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import SendSmsModal from "$lib/components/investor/SendSmsModal.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import { nonDeletedFilter } from "$lib/graphql/filters";
  import CUSTOMERS_LIST_QUERY from "$graphql/queries/customers/list.gql";
  import { _ } from "svelte-i18n";

  let isSmsModalOpen = $state(false);
  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let sortColumn = $state($page.url.searchParams.get("sort") || "orders");
  let sortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let customers = $state<any[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);
  let fetchError = $state<string | null>(null);
  let selectedIds = $state<Set<string>>(new Set());
  let refetchTrigger = $state(0);

  let debouncedSearch = $state($page.url.searchParams.get("search") ?? "");
  let debounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(debounceTimer);
    if (searchQuery === debouncedSearch) return;
    debounceTimer = setTimeout(() => {
      debouncedSearch = searchQuery;
      currentPage = 1;
    }, 400);
    return () => clearTimeout(debounceTimer);
  });

  const totalPages = $derived(Math.max(1, Math.ceil(totalCount / rowsPerPage)));

  function buildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];
    if (debouncedSearch) {
      conditions.push({
        _or: [
          { first_name: { _ilike: `%${debouncedSearch}%` } },
          { last_name: { _ilike: `%${debouncedSearch}%` } },
          { phone_number: { _ilike: `%${debouncedSearch}%` } },
          { address: { _ilike: `%${debouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
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

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "name":
        return [{ first_name: sortDirection }];
      case "orders":
        return [{ orders_aggregate: { count: sortDirection } }];
      case "date":
        return [{ created_at: sortDirection }];
      default:
        return [{ orders_aggregate: { count: "desc" } }];
    }
  }

  function customerStatus(row: any): { label: string; class: string } {
    const totalOrders = row.total_orders?.aggregate?.count ?? 0;
    const unpaidOrders = row.total_unpayed_or_partially_Payed_orders?.aggregate?.count ?? 0;
    if (totalOrders === 0) {
      return { label: "Pending", class: "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700" };
    }
    if (unpaidOrders > 0) {
      return { label: "In Debt", class: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700" };
    }
    return { label: "Active", class: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700" };
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (rowsPerPage !== 10) params.set("limit", String(rowsPerPage));
    if (sortColumn !== "orders") params.set("sort", sortColumn);
    if (sortDirection !== "desc") params.set("dir", sortDirection);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void debouncedSearch;
    void currentPage;
    void rowsPerPage;
    void sortColumn;
    void sortDirection;
    void refetchTrigger;

    loading = true;
    fetchError = null;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          customers: any[];
          total: { aggregate: { count: number } };
        }>({
          query: CUSTOMERS_LIST_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: buildOrder(),
            ordersFilter: nonDeletedFilter(),
          },
        });
        customers = result.data?.customers ?? [];
        totalCount = result.data?.total?.aggregate?.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as Error).message;
        customers = [];
        totalCount = 0;
      } finally {
        loading = false;
      }
    }, 300);

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

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleView(customer: any) {
    goto(`/dashboard/customers/${customer.id}`);
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    selectedIds = next;
  }

  function toggleSelectAll() {
    if (selectedIds.size === customers.length && customers.length > 0) {
      selectedIds = new Set();
    } else {
      selectedIds = new Set(customers.map((c) => c.id));
    }
  }

  const allSelected = $derived(
    customers.length > 0 && selectedIds.size === customers.length
  );

  const selectedArray = $derived(Array.from(selectedIds));

  function handleSmsSuccess() {
    selectedIds = new Set();
    refetchTrigger++;
  }

  function getVisiblePages(current: number, total: number): (number | string)[] {
    const pages: (number | string)[] = [];
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else if (current <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    } else if (current >= total - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = total - 4; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = current - 1; i <= current + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(total);
    }
    return pages;
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <div class="flex items-center justify-between gap-4">
    <div></div>
    <Button
      class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4] disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={selectedIds.size === 0}
      onclick={() => (isSmsModalOpen = true)}
    >
      <Icon iconName="icon/send" size={16} class="mr-2" />
      {$_('sendSmsMessage')}
      {#if selectedIds.size > 0}
        <span class="ml-1.5 px-1.5 py-0.5 text-xs rounded-full bg-white/20">{selectedIds.size}</span>
      {/if}
    </Button>
  </div>

  {#if fetchError}
    <div class="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-lg">
      <Icon iconName="icon/alert-circle" size={48} class="text-destructive mb-4" />
      <p class="text-destructive font-medium">{$_('somethingWentWrong')}</p>
      <p class="text-muted-foreground text-sm mt-1">{fetchError}</p>
      <Button
        variant="outline"
        onclick={() => refetchTrigger++}
        class="mt-4 border-border text-foreground hover:bg-muted"
      >
        <Icon iconName="icon/refresh-cw" size={16} class="mr-2" />
        Try Again
      </Button>
    </div>
  {:else if customers.length === 0 && !loading}
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-border">
        <div class="relative w-72">
          <Icon
            iconName="icon/search"
            size={16}
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder={$_('search')}
            class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
            bind:value={searchQuery}
          />
        </div>
      </div>
      <div class="flex flex-col items-center justify-center py-16">
        <Icon iconName="icon/user" size={48} class="text-muted-foreground mb-4" />
        <p class="text-foreground font-medium">{$_('pageSubtitle')}</p>
      </div>
    </div>
  {:else}
    <div class="bg-card border border-border rounded-lg overflow-hidden">
      <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
        <div class="relative w-72 shrink-0">
          <Icon
            iconName="icon/search"
            size={16}
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder={$_('search')}
            class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
            bind:value={searchQuery}
          />
        </div>
        {#if selectedIds.size > 0}
          <span class="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
        {/if}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="uppercase bg-muted/30 border-b border-border">
            <tr class="text-left text-xs text-muted-foreground uppercase">
              <th class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  class="rounded"
                  checked={allSelected}
                  onchange={toggleSelectAll}
                />
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("name")}
                >
                  {$_('merchant')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'name' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'name' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("orders")}
                >
                  {$_('totalOrders')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'orders' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'orders' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium uppercase">{$_('phone')}</th>
              <th class="px-4 py-3 font-medium uppercase">{$_('unpaidOrders')}</th>
              <th class="px-4 py-3 font-medium uppercase">{$_('status')}</th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("date")}
                >
                  {$_('dateJoined')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'date' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'date' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
            </tr>
            {#if loading}
              <tr>
                <td colspan="7" class="p-0">
                  <div class="h-1 bg-muted/30 w-full overflow-hidden">
                    <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
                  </div>
                </td>
              </tr>
            {/if}
          </thead>
          <tbody class="divide-y divide-border">
            {#each customers as row}
              <tr
                class="hover:bg-muted/20 transition-colors cursor-pointer"
                onclick={() => handleView(row)}
              >
                <td class="px-4 py-4" onclick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    class="rounded"
                    checked={selectedIds.has(row.id)}
                    onchange={() => toggleSelect(row.id)}
                  />
                </td>
                <td class="px-4 py-4 text-foreground">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style="background-color: {avatarColor(row.first_name)}">
                      {initials(row.first_name, row.last_name)}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm text-foreground font-medium truncate">{row.first_name} {row.last_name}</span>
                      <span class="text-xs text-muted-foreground truncate">{row.address ?? "-"}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-foreground">{row.total_orders?.aggregate?.count ?? 0}</td>
                <td class="px-4 py-4 text-muted-foreground text-xs">{row.phone_number ?? "-"}</td>
                <td class="px-4 py-4 text-foreground">{row.total_unpayed_or_partially_Payed_orders?.aggregate?.count ?? 0}</td>
                <td class="px-4 py-4">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {customerStatus(row).class}">
                    {customerStatus(row).label}
                  </span>
                </td>
                <td class="px-4 py-4 text-muted-foreground text-xs">
                  {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-border flex flex-col gap-2 sm:flex-row items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm text-muted-foreground">Row Per Page</span>
          <select
            class="px-2 py-1 border border-border rounded bg-background text-foreground text-sm"
            onchange={(e) => {
              rowsPerPage = Number(e.currentTarget.value);
              currentPage = 1;
            }}
          >
            <option value="10" selected={rowsPerPage === 10}>10</option>
            <option value="20" selected={rowsPerPage === 20}>20</option>
            <option value="50" selected={rowsPerPage === 50}>50</option>
            <option value="100" selected={rowsPerPage === 100}>100</option>
          </select>
          <span class="text-sm text-muted-foreground">Entries</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
            style="background-color:#4DA0E620; color:#4DA0E6;"
            disabled={currentPage === 1}
            onclick={() => handlePageChange(currentPage - 1)}
          >
            <Icon iconName="icon/chevron-left" size={16} />
          </button>
          {#each getVisiblePages(currentPage, totalPages) as p}
            {#if typeof p === "number"}
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === currentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                style={p === currentPage ? 'background-color:#4DA0E6;' : ''}
                onclick={() => handlePageChange(p)}
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
            onclick={() => handlePageChange(currentPage + 1)}
          >
            <Icon iconName="icon/chevron-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>

<SendSmsModal
  bind:isOpen={isSmsModalOpen}
  customerIds={selectedArray}
  onSuccess={handleSmsSuccess}
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
