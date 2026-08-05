<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import CreateStockModal from "$lib/components/investor/CreateStockModal.svelte";
  import UpdateStockModal from "$lib/components/investor/UpdateStockModal.svelte";
  import DeleteStockConfirmModal from "$lib/components/investor/DeleteStockConfirmModal.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { getAuthClient } from "$graphql/client.ts";
  import INVESTOR_STOCKS_QUERY from "$graphql/queries/stocks/stocks.gql";
  import { _ } from "svelte-i18n";
  import SearchSelect from "$lib/components/investor/search-select/SearchSelect.svelte";
  import PRODUCT_QUERY from "$graphql/queries/selector/products.gql";
  import COMPANY_QUERY from "$graphql/queries/selector/company.gql";
  import LOCATION_QUERY from "$graphql/queries/selector/location.gql";

  let isCreateStockModalOpen = $state(false);
  let isUpdateStockModalOpen = $state(false);
  let stockItemToEdit = $state<any>(null);
  let isDeleteStockModalOpen = $state(false);
  let stockItemToDelete = $state<any>(null);
  let refetchTrigger = $state(0);

  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let sortColumn = $state($page.url.searchParams.get("sort") || "created_at");
  let sortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "desc"
  );

  let stockItems = $state<any[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);
  let fetchError = $state<string | null>(null);

  let productFilterId = $state("");
  let companyFilterId = $state("");
  let branchFilterId = $state("");
  let statusFilter = $state("");

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
          { product: { name: { _ilike: `%${debouncedSearch}%` } } },
          { batch_number: { _ilike: `%${debouncedSearch}%` } },
        ],
      });
    }
    if (productFilterId) {
      conditions.push({ product_id: { _eq: productFilterId } });
    }
    if (companyFilterId) {
      conditions.push({ branchByBranch: { company: { _eq: companyFilterId } } });
    }
    if (branchFilterId) {
      conditions.push({ branchByBranch: { id: { _eq: branchFilterId } } });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "name":
        return [{ product: { name: sortDirection } }];
      case "type":
        return [{ product: { type: { name: sortDirection } } }];
      case "batch":
        return [{ batch_number: sortDirection }];
      case "branch":
        return [{ branchByBranch: { name: sortDirection } }];
      case "expiry":
        return [{ expiry_date: sortDirection }];
      case "quantity":
        return [{ quantity: sortDirection }];
      case "created_at":
        return [{ created_at: sortDirection }];
      default:
        return [{ created_at: sortDirection }];
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (rowsPerPage !== 10) params.set("limit", String(rowsPerPage));
    if (sortColumn !== "created_at") params.set("sort", sortColumn);
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
    void productFilterId;
    void companyFilterId;
    void branchFilterId;
    void refetchTrigger;

    loading = true;
    fetchError = null;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query<{
          stock: any[];
          stock_aggregate: { aggregate: { count: number } };
        }>({
          query: INVESTOR_STOCKS_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: buildOrder(),
          },
        });
        stockItems = result.data?.stock ?? [];
        totalCount = result.data?.stock_aggregate?.aggregate?.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as Error).message;
        stockItems = [];
        totalCount = 0;
      } finally {
        loading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function formatName(val: string | null | undefined): string {
    if (!val) return "-";
    return val
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  }

  function attributeLabel(key: string): string {
    if (key === "model_number") return "Model No";
    if (key === "capacity_unit") return "Capacity unit";
    return key.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function attributeEntries(attrs: Record<string, unknown> | null | undefined): [string, unknown][] {
    if (!attrs) return [];
    return Object.entries(attrs).filter(([, v]) => v != null && String(v).trim() !== "");
  }

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleEdit(item: any) {
    stockItemToEdit = item;
    isUpdateStockModalOpen = true;
  }

  function handleDelete(item: any) {
    stockItemToDelete = item;
    isDeleteStockModalOpen = true;
  }

  function handleAddStock() {
    isCreateStockModalOpen = true;
  }

  function handleRefetch() {
    refetchTrigger++;
  }

  function handleSearch(query: string) {
    searchQuery = query;
    currentPage = 1;
  }

  function handleSort(column: string) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }
    currentPage = 1;
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
  <div class="flex items-center justify-end">
    <Button
      class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
      onclick={handleAddStock}
    >
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      {$_('addStock')}
    </Button>
  </div>

  {#if fetchError}
    <div class="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-lg">
      <Icon iconName="icon/alert-circle" size={48} class="text-destructive mb-4" />
      <p class="text-destructive font-medium">{$_('somethingWentWrong')}</p>
      <p class="text-muted-foreground text-sm mt-1">{fetchError}</p>
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
            placeholder={$_('searchByStockName')}
            class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
            bind:value={searchQuery}
          />
        </div>
        <div class="flex gap-2 ml-auto flex-wrap items-center">
          <div class="w-full sm:w-44">
            <SearchSelect
              query={PRODUCT_QUERY}
              dataKey="products"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder="Product"
              onSelect={(item) => { productFilterId = item?.id ?? ""; currentPage = 1; }}
            />
          </div>
          <div class="w-full sm:w-44">
            <SearchSelect
              query={COMPANY_QUERY}
              dataKey="companies"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder="Company"
              onSelect={(item) => { companyFilterId = item?.id ?? ""; currentPage = 1; }}
            />
          </div>
          <div class="w-full sm:w-44">
            <SearchSelect
              query={LOCATION_QUERY}
              dataKey="branches"
              filterBuilder={(s) => ({ name: { _ilike: `%${s}%` } })}
              displayLabel={(item) => item.name}
              placeholder="Branch"
              onSelect={(item) => { branchFilterId = item?.id ?? ""; currentPage = 1; }}
            />
          </div>
          <div class="w-full sm:w-32">
            <select
              class="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none"
              onchange={(e) => { statusFilter = e.currentTarget.value; currentPage = 1; }}
            >
              <option value="">All Status</option>
              <option value="adequate">Adequate</option>
              <option value="low">Low Stock</option>
              <option value="out">Out</option>
            </select>
          </div>
        </div>
      </div>

      {#if loading}
        <div class="h-1 bg-muted/30 w-full overflow-hidden">
          <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
        </div>
      {/if}

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
                  {$_('navStock')}
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
                  onclick={() => handleSort("type")}
                >
                  {$_('category')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'type' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'type' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("batch")}
                >
                  {$_('batch')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'batch' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'batch' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("branch")}
                >
                  {$_('navLocation')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'branch' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'branch' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("quantity")}
                >
                  Qty
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'quantity' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'quantity' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("created_at")}
                >
                  {$_('received')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'created_at' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'created_at' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => handleSort("expiry")}
                >
                  Expiry
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'expiry' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'expiry' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">Attributes</th>
              <th class="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            {#if stockItems.length === 0 && !loading}
              <tr>
                <td colspan="10" class="p-0">
                  <EmptyState
                    illustration="stock-page"
                    title="No Stock Assigned Yet"
                    description="This location doesn't have any products assigned. Once stock is added, you'll be able to track quantities, categories, and performance."
                    actionLabel="Assign Stock"
                    onAction={handleAddStock}
                  />
                </td>
              </tr>
            {:else}
              {#each stockItems as row}
                <tr class="hover:bg-muted/20 transition-colors">
                  <td class="px-4 py-4" onclick={(e) => e.stopPropagation()}>
                    <input type="checkbox" class="rounded" />
                  </td>
                  <td class="px-4 py-4 text-foreground">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon iconName="icon/package" size={20} class="text-muted-foreground" />
                      </div>
                      <span class="text-sm font-medium text-foreground">{row.product?.name ?? "-"}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-foreground">{formatName(row.product?.type?.name)}</td>
                  <td class="px-4 py-4 text-foreground font-mono text-xs">{row.batch_number ?? "-"}</td>
                  <td class="px-4 py-4 text-foreground">{formatName(row.branch?.name)}</td>
                  <td class="px-4 py-4 text-foreground">{row.quantity ?? 0}</td>
                  <td class="px-4 py-4 text-muted-foreground text-xs">
                    {row.created_at ? new Date(row.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td class="px-4 py-4">
                    {#if row.expiry_date}
                      {@const expired = new Date(row.expiry_date) < new Date()}
                      <span class="inline-flex items-center gap-1 text-xs {expired ? 'text-destructive' : 'text-muted-foreground'}">
                        {#if expired}
                          <Icon iconName="icon/alert-circle" size={12} class="text-destructive" />
                        {/if}
                        {new Date(row.expiry_date).toLocaleDateString()}
                      </span>
                    {:else}
                      <span class="text-muted-foreground text-xs">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-4 text-foreground">
                    {#if attributeEntries(row.attributes).length > 0}
                      <div class="flex flex-col gap-0.5 text-sm">
                        {#each attributeEntries(row.attributes) as [k, v]}
                          <div class="flex gap-1">
                            <span class="text-muted-foreground text-xs">{attributeLabel(k)}:</span>
                            <span class="text-foreground">{String(v)}</span>
                          </div>
                        {/each}
                      </div>
                    {:else}
                      <span class="text-muted-foreground">—</span>
                    {/if}
                  </td>
                  <td class="px-4 py-4 text-right" onclick={(e) => e.stopPropagation()}>
                    <button
                      onclick={() => handleEdit(row)}
                      class="p-1.5 rounded hover:bg-muted transition-colors"
                      aria-label={$_('edit')}
                    >
                      <Icon iconName="icon/edit" size={16} class="text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onclick={() => handleDelete(row)}
                      class="p-1.5 rounded hover:bg-muted transition-colors"
                      aria-label={$_('delete')}
                    >
                      <Icon iconName="icon/trash" size={16} class="text-muted-foreground hover:text-destructive" />
                    </button>
                  </td>
                </tr>
              {/each}
            {/if}
          </tbody>
        </table>
      </div>

      <div class="p-4 border-t border-border flex flex-col sm:flex-row gap-2 items-center justify-between">
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

  <CreateStockModal
    bind:isOpen={isCreateStockModalOpen}
    onSuccess={handleRefetch}
  />

  <UpdateStockModal
    bind:isOpen={isUpdateStockModalOpen}
    stock={stockItemToEdit}
    onSuccess={handleRefetch}
  />

  <DeleteStockConfirmModal
    bind:isOpen={isDeleteStockModalOpen}
    stock={stockItemToDelete}
    onSuccess={handleRefetch}
  />
</div>

<style>
  :global(.loading-slide) {
    animation: loading-slide 1.5s infinite linear;
  }
  @keyframes loading-slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>
