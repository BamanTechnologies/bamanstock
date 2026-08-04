<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import CreateMerchantModal from "$lib/components/investor/CreateMerchantModal.svelte";
  import UpdateMerchantModal from "$lib/components/investor/UpdateMerchantModal.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import INVESTOR_MERCHANTS_QUERY from "$graphql/queries/merchants/investor_merchants.gql";
  import DELETE_MERCHANT from "$graphql/mutation/merchant/delete.gql";
  import { _ } from "svelte-i18n";

  let isCreateModalOpen = $state(false);
  let isEditModalOpen = $state(false);
  let isDeleteModalOpen = $state(false);
  let deletingMerchant = $state<any>(null);
  let editingMerchant = $state<any>(null);
  let deleteLoading = $state(false);

  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let sortColumn = $state($page.url.searchParams.get("sort") || "orders");
  let sortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let merchants = $state<any[]>([]);
  let totalCount = $state(0);
  let totalMerchants = $state(0);
  let activeMerchants = $state(0);
  let locationCount = $state(0);
  let loading = $state(true);
  let fetchError = $state<string | null>(null);

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
          { branchByBranch: { name: { _ilike: `%${debouncedSearch}%` } } },
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

  function fmt(val: unknown): string {
    if (val == null) return "0";
    return String(val).replace(/^\$/, "ETB ");
  }

  function formatBranch(name: string | null | undefined): string {
    if (!name) return "-";
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "name":
        return [{ first_name: sortDirection }];
      case "sales":
        return [{ orders_aggregate: { sum: { total_amount: sortDirection } } }];
      case "total_outstanding":
        return [{ orders_aggregate: { sum: { outstanding_amount: sortDirection } } }];
      case "orders":
        return [{ orders_aggregate: { count: sortDirection } }];
      case "location":
        return [{ branchByBranch: { name: sortDirection } }];
      default:
        return [{ orders_aggregate: { count: "desc" } }];
    }
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
          merchant: any[];
          total: { aggregate: { count: number } };
          total_merchants: { aggregate: { count: number } };
          active_merchants: { aggregate: { count: number } };
          merchants_location: { aggregate: { count: number } };
        }>({
          query: INVESTOR_MERCHANTS_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: buildOrder(),
          },
        });
        merchants = result.data?.merchant ?? [];
        totalCount = result.data?.total?.aggregate?.count ?? 0;
        totalMerchants = result.data?.total_merchants?.aggregate?.count ?? 0;
        activeMerchants = result.data?.active_merchants?.aggregate?.count ?? 0;
        locationCount = result.data?.merchants_location?.aggregate?.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as Error).message;
        merchants = [];
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

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleView(merchant: any) {
    goto(`/dashboard/merchants/${merchant.id}`);
  }

  function handleEdit(merchant: any) {
    editingMerchant = merchant;
    isEditModalOpen = true;
  }

  function handleDeleteClick(merchant: any) {
    deletingMerchant = merchant;
    isDeleteModalOpen = true;
  }

  async function handleDeleteConfirm() {
    if (!deletingMerchant) return;
    deleteLoading = true;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: DELETE_MERCHANT,
        variables: { id: deletingMerchant.id },
      });
      isDeleteModalOpen = false;
      deletingMerchant = null;
      fetchError = null;
      refetchTrigger++;
    } catch (err: any) {
      fetchError = (err as Error).message;
    } finally {
      deleteLoading = false;
    }
  }

  function handleDeleteCancel() {
    isDeleteModalOpen = false;
    deletingMerchant = null;
  }

  let refetchTrigger = $state(0);

  function handleCreateSuccess() {
    refetchTrigger++;
  }

  function handleEditSuccess() {
    refetchTrigger++;
  }

  const summaryCards = $derived([
    { label: $_('totalMerchants'),      value: String(totalMerchants), icon: "icon/user",     color: "bg-green-100 dark:bg-green-900/40" },
    { label: $_('activeMerchants'),     value: String(activeMerchants), icon: "icon/users",    color: "bg-blue-100 dark:bg-blue-900/40"  },
    { label: $_('merchantsPerLocation'), value: String(locationCount),  icon: "icon/building", color: "bg-purple-100 dark:bg-purple-900/40" },
  ]);

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
  <div class="flex items-center justify-end gap-4">
    <Icon
      iconName="icon/file-text"
      size={20}
      class="text-red-500 cursor-pointer"
    />
    <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={() => (isCreateModalOpen = true)}>
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      {$_('inviteMerchant')}
    </Button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each summaryCards as card}
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 min-w-0">
            {#if loading}
              <div class="h-8 w-24 rounded bg-muted/60 dark:bg-muted/30 animate-pulse mb-2" />
              <div class="h-4 w-32 rounded bg-muted/40 dark:bg-muted/20 animate-pulse" />
            {:else}
              <p class="text-3xl font-bold text-foreground mb-1">{card.value}</p>
              <p class="text-sm text-muted-foreground">{card.label}</p>
            {/if}
          </div>
          <div class="{card.color} w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
            <Icon iconName={card.icon as any} size={24} class="text-foreground" />
          </div>
        </div>
      </div>
    {/each}
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
  {:else if merchants.length === 0 && !loading}
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
        <Icon iconName="icon/users" size={48} class="text-muted-foreground mb-4" />
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
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-muted/30 border-b border-border">
            <tr class="text-left text-xs text-muted-foreground uppercase">
              <th class="px-4 py-3 w-10">
                <input type="checkbox" class="rounded" />
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
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
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("sales")}
                >
                  {$_('sales')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'sales' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'sales' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("total_outstanding")}
                >
                  {$_('totalOutstanding')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'total_outstanding' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'total_outstanding' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("orders")}
                >
                  {$_('transactions')}
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
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("location")}
                >
                  {$_('navLocation')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'location' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'location' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
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
            {#each merchants as row}
              <tr
                class="hover:bg-muted/20 transition-colors cursor-pointer"
                onclick={() => handleView(row)}
              >
                <td class="px-4 py-4" onclick={(e) => e.stopPropagation()}>
                  <input type="checkbox" class="rounded" />
                </td>
                <td class="px-4 py-4 text-foreground">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style="background-color: {avatarColor(row.first_name)}">
                      {initials(row.first_name, row.last_name)}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm text-foreground font-medium truncate">{row.first_name} {row.last_name}</span>
                      <span class="text-xs text-muted-foreground truncate">{row.phone_number ?? "-"}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-foreground">{fmt(row.sales?.aggregate?.sum?.total_amount)}</td>
                <td class="px-4 py-4 text-foreground">{fmt(row.total_outstanding?.aggregate?.sum?.outstanding_amount)}</td>
                <td class="px-4 py-4 text-foreground">{row.total_orders?.aggregate?.count ?? 0}</td>
                <td class="px-4 py-4 text-foreground">{formatBranch(row.branch?.name)}</td>
                <td class="px-4 py-4 text-right" onclick={(e) => e.stopPropagation()}>
                  <button
                    onclick={() => handleEdit(row)}
                    class="p-1.5 rounded hover:bg-muted transition-colors"
                    aria-label="Edit"
                  >
                    <!-- <Icon iconName="icon/pencil" size={16} class="text-muted-foreground hover:text-info" /> -->
                    <Icon iconName="icon/edit" size={16} class="text-muted-foreground hover:text-foreground" />

                  </button>
                  <button
                    onclick={() => handleDeleteClick(row)}
                    class="p-1.5 rounded hover:bg-muted transition-colors"
                    aria-label={$_('delete')}
                  >
                    <Icon iconName="icon/trash" size={16} class="text-muted-foreground hover:text-destructive" />
                  </button>
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

<CreateMerchantModal bind:isOpen={isCreateModalOpen} onSuccess={handleCreateSuccess} />

<UpdateMerchantModal
  bind:isOpen={isEditModalOpen}
  merchant={editingMerchant}
  onSuccess={handleEditSuccess}
/>

<ConfirmModal
  bind:isOpen={isDeleteModalOpen}
  title="Remove Merchant"
  message={deletingMerchant ? `Are you sure you want to remove <strong>${deletingMerchant.first_name} ${deletingMerchant.last_name}</strong>? This action will revoke their access to all assigned stocks and cannot be undone.` : ""}
  confirmText="Remove Merchant"
  loading={deleteLoading}
  onConfirm={handleDeleteConfirm}
  onClose={handleDeleteCancel}
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
