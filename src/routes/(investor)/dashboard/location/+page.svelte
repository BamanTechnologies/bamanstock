<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import AddLocationModal from "$lib/components/investor/AddLocationModal.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import INVESTOR_BRANCHES_QUERY from "$graphql/queries/locations/branches.gql";
  import DELETE_BRANCH from "$graphql/mutation/locations/delete.gql";
  import { _ } from "svelte-i18n";

  let isAddLocationModalOpen = $state(false);
  let locationToEdit = $state<{
    id?: string;
    name: string;
    address: string;
    company?: string;
    companyName?: string;
  } | null>(null);

  let isDeleteModalOpen = $state(false);
  let deletingLocation = $state<{ id: string; name: string } | null>(null);
  let deleteLoading = $state(false);

  let refetchTrigger = $state(0);

  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let sortColumn = $state($page.url.searchParams.get("sort") || "name");
  let sortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "asc"
  );

  let locations = $state<any[]>([]);
  let totalCount = $state(0);
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
          { name: { _ilike: `%${debouncedSearch}%` } },
          { address: { _ilike: `%${debouncedSearch}%` } },
          { companyByCompany: { name: { _ilike: `%${debouncedSearch}%` } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "name":
        return [{ name: sortDirection }];
      case "address":
        return [{ address: sortDirection }];
      case "company":
        return [{ companyByCompany: { name: sortDirection } }];
      case "stock_value":
        return [{ stocks_aggregate: { sum: { selling_price: sortDirection } } }];
      case "merchants":
        return [{ merchants_aggregate: { count: sortDirection } }];
      case "customers":
        return [{ company_customers_aggregate: { count: sortDirection } }];
      default:
        return [{ name: sortDirection }];
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (rowsPerPage !== 10) params.set("limit", String(rowsPerPage));
    if (sortColumn !== "name") params.set("sort", sortColumn);
    if (sortDirection !== "asc") params.set("dir", sortDirection);
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
          branches: any[];
          total: { aggregate: { count: number } };
        }>({
          query: INVESTOR_BRANCHES_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: buildOrder(),
          },
        });
        locations = result.data?.branches ?? [];
        totalCount = result.data?.total?.aggregate?.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as Error).message;
        locations = [];
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

  function handleView(location: any) {
    goto(`/dashboard/location/${location.id}`);
  }

  function handleAddLocation() {
    locationToEdit = null;
    isAddLocationModalOpen = true;
  }

  function handleEdit(loc: any) {
    locationToEdit = {
      id: loc.id,
      name: loc.name,
      address: loc.address ?? "",
      company: loc.company?.id ?? "",
      companyName: loc.company?.name ?? "",
    };
    isAddLocationModalOpen = true;
  }

  function handleLocationSuccess() {
    locationToEdit = null;
    refetchTrigger++;
  }

  function handleDeleteClick(loc: any) {
    deletingLocation = { id: loc.id, name: loc.name };
    isDeleteModalOpen = true;
  }

  async function handleDeleteConfirm() {
    if (!deletingLocation) return;
    deleteLoading = true;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: DELETE_BRANCH,
        variables: { id: deletingLocation.id },
      });
      isDeleteModalOpen = false;
      deletingLocation = null;
      refetchTrigger++;
    } catch (err: any) {
      console.error("Delete failed:", err);
    } finally {
      deleteLoading = false;
    }
  }

  const AVATAR_COLORS = [
    "#4DA0E6", "#D15B7A", "#34A853", "#FBBC05",
    "#FF6B6B", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77",
  ];

  function avatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  }

  function formatName(name: string | null | undefined): string {
    if (!name) return "-";
    return name
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function fmtCurrency(val: unknown): string {
    if (val == null || val === 0) return "ETB 0";
    const cleaned = String(val).replace(/[^0-9.\-]/g, "");
    const num = parseFloat(cleaned);
    if (isNaN(num)) return String(val);
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
  <div class="flex items-center justify-end gap-4">
    <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={handleAddLocation}>
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      {$_('addLocation')}
    </Button>
  </div>

  {#if fetchError}
    <div class="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-lg">
      <Icon iconName="icon/alert-circle" size={48} class="text-destructive mb-4" />
      <p class="text-destructive font-medium">{$_('somethingWentWrong')}</p>
      <p class="text-muted-foreground text-sm mt-1">{fetchError}</p>
    </div>
  {:else if locations.length === 0 && !loading}
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
        <Icon iconName="icon/building" size={48} class="text-muted-foreground mb-4" />
        <p class="text-foreground font-medium">{$_('noLocationsFound')}</p>
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
          <thead class="uppercase bg-muted/30 border-b border-border">
            <tr class="text-left text-xs text-muted-foreground uppercase">
              <th class="px-4 py-3 w-10">
                <input type="checkbox" class="rounded" />
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("name")}
                >
                  {$_('navLocation')}
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
                  onclick={() => handleSort("address")}
                >
                  {$_('address')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'address' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'address' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("company")}
                >
                  {$_('company')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'company' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'company' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("stock_value")}
                >
                  {$_('totalStockValue')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'stock_value' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'stock_value' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("merchants")}
                >
                  {$_('navMerchants')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'merchants' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'merchants' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("customers")}
                >
                  {$_('customers')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'customers' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'customers' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
            {#if loading}
              <tr>
                <td colspan="8" class="p-0">
                  <div class="h-1 bg-muted/30 w-full overflow-hidden">
                    <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
                  </div>
                </td>
              </tr>
            {/if}
          </thead>
          <tbody class="divide-y divide-border">
            {#each locations as row}
              <tr
                class="hover:bg-muted/20 transition-colors cursor-pointer"
                onclick={() => handleView(row)}
              >
                <td class="px-4 py-4" onclick={(e) => e.stopPropagation()}>
                  <input type="checkbox" class="rounded" />
                </td>
                <td class="px-4 py-4 text-foreground">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0" style="background-color: {avatarColor(row.name)}">
                      {row.name?.charAt(0).toUpperCase()}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-sm text-foreground font-medium truncate">{formatName(row.name)}</span>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-4 text-foreground max-w-[200px] truncate">{row.address ?? "-"}</td>
                <td class="px-4 py-4 text-foreground">{row.company?.name ?? "-"}</td>
                <td class="px-4 py-4 text-foreground">
                  {#if row.stock_value?.aggregate?.sum?.selling_price}
                    {fmtCurrency(row.stock_value.aggregate.sum.selling_price)}
                  {:else}
                    $0
                  {/if}
                </td>
                <td class="px-4 py-4 text-foreground">{row.merchants?.aggregate?.count ?? 0}</td>
                <td class="px-4 py-4 text-foreground">{row.total_customers?.aggregate?.count ?? 0}</td>
                <td class="px-4 py-4 text-right" onclick={(e) => e.stopPropagation()}>
                  <button
                    onclick={() => handleEdit(row)}
                    class="p-1.5 rounded hover:bg-muted transition-colors"
                    aria-label={$_('edit')}
                  >
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

<AddLocationModal
  bind:isOpen={isAddLocationModalOpen}
  location={locationToEdit}
  onSuccess={handleLocationSuccess}
  onClose={() => { locationToEdit = null; }}
/>

<ConfirmModal
  bind:isOpen={isDeleteModalOpen}
  title="Remove Location"
  message="Are you sure you want to remove <strong>{deletingLocation?.name ?? ""}</strong>? All merchants and stocks assigned to this location will need to be reassigned or will become unassigned."
  confirmText="Remove Location"
  loading={deleteLoading}
  onConfirm={handleDeleteConfirm}
  onClose={() => { deletingLocation = null; }}
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
