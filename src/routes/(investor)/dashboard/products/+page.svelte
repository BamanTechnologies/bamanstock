<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import CreateProductModal from "$lib/components/investor/CreateProductModal.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { getAuthClient } from "$graphql/client.ts";
  import PRODUCTS_LIST_QUERY from "$graphql/queries/product/products_list.gql";
  import PRODUCT_TYPE_QUERY from "$graphql/queries/selector/product_category.gql";
  import DELETE_PRODUCT from "$graphql/mutation/product/delete.gql";
  import { _ } from "svelte-i18n";

  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let typeFilterId = $state($page.url.searchParams.get("type") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 10);
  let sortColumn = $state($page.url.searchParams.get("sort") || "name");
  let sortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("dir") as "asc" | "desc") || "asc"
  );

  let products = $state<any[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);
  let fetchError = $state<string | null>(null);
  let productTypes = $state<Array<{ id: string; name: string }>>([]);
  let refetchTrigger = $state(0);

  let isCreateModalOpen = $state(false);
  let editingProductId = $state("");
  let isDeleteModalOpen = $state(false);
  let deletingProduct = $state<any>(null);
  let deleteLoading = $state(false);
  let deleteError = $state<string | null>(null);

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
          { product_type: { name: { _ilike: `%${debouncedSearch}%` } } },
        ],
      });
    }
    if (typeFilterId) {
      conditions.push({ product_type: { id: { _eq: typeFilterId } } });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function buildOrder(): Record<string, unknown>[] {
    switch (sortColumn) {
      case "type":
        return [{ product_type: { name: sortDirection } }];
      case "status":
        return [{ is_active: sortDirection }];
      case "stock":
        return [{ current_available_stock: sortDirection }];
      case "name":
      default:
        return [{ name: sortDirection }];
    }
  }

  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (typeFilterId) params.set("type", typeFilterId);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (rowsPerPage !== 10) params.set("limit", String(rowsPerPage));
    if (sortColumn !== "name") params.set("sort", sortColumn);
    if (sortDirection !== "asc") params.set("dir", sortDirection);
    const qs = params.toString();
    goto(qs ? `?${qs}` : $page.url.pathname, { replaceState: true, keepFocus: true, noScroll: true });
  }

  $effect(() => {
    void debouncedSearch;
    void typeFilterId;
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
          products: any[];
          total: { aggregate: { count: number } };
        }>({
          query: PRODUCTS_LIST_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            orderBy: buildOrder(),
          },
        });
        products = result.data?.products ?? [];
        totalCount = result.data?.total?.aggregate?.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as Error).message;
        products = [];
        totalCount = 0;
      } finally {
        loading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  $effect(() => {
    const client = getAuthClient("investor");
    client
      .query<{ product_types: Array<{ id: string; name: string }> }>({
        query: PRODUCT_TYPE_QUERY,
        variables: { limit: 100, offset: 0, filter: {} },
      })
      .then((r) => {
        productTypes = r.data?.product_types ?? [];
      })
      .catch(() => {});
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

  function handleCreateSuccess() {
    refetchTrigger++;
  }

  function handleDeleteClick(product: any) {
    deletingProduct = product;
    deleteError = null;
    isDeleteModalOpen = true;
  }

  async function handleDeleteConfirm() {
    if (!deletingProduct) return;
    deleteLoading = true;
    deleteError = null;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: DELETE_PRODUCT,
        variables: { id: deletingProduct.id },
      });
      isDeleteModalOpen = false;
      deletingProduct = null;
      refetchTrigger++;
    } catch (err: any) {
      deleteError = err.message ?? "An unexpected error occurred";
    } finally {
      deleteLoading = false;
    }
  }

  function handleDeleteCancel() {
    isDeleteModalOpen = false;
    deletingProduct = null;
    deleteError = null;
  }

  function handleView(product: any) {
    goto(`/dashboard/products/${product.id}`);
  }

  function handleEdit(product: any) {
    editingProductId = product.id;
    isCreateModalOpen = true;
  }

  function handleDelete(product: any) {
    console.log("Delete product:", product);
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
      onclick={() => {
        editingProductId = "";
        isCreateModalOpen = true;
      }}
    >
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      Add Product
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
        <div class="relative w-full sm:w-72 shrink-0">
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

        <div class="w-full sm:w-44">
          <select
            class="w-full px-3 py-2 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none cursor-pointer"
            value={typeFilterId}
            onchange={(e) => {
              typeFilterId = e.currentTarget.value;
              currentPage = 1;
            }}
          >
            <option value="">{`${$_('filterAll')} ${$_('category')}`}</option>
            {#each productTypes as type}
              <option value={type.id}>{type.name}</option>
            {/each}
          </select>
        </div>
      </div>

      {#if loading}
        <div class="h-1 bg-muted/30 w-full overflow-hidden">
          <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
        </div>
      {/if}

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
                  {$_('productName')}
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
              <th class="px-4 py-3 font-medium uppercase">Unit</th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("status")}
                >
                  {$_('filterStatus')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'status' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'status' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 font-medium">
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors uppercase"
                  onclick={() => handleSort("stock")}
                >
                  {$_('totalStock')}
                  <span class="flex flex-col ml-0.5">
                    <Icon iconName="icon/chevron-up" size={10}
                      class={sortColumn === 'stock' && sortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'}
                    />
                    <Icon iconName="icon/chevron-down" size={10}
                      class={sortColumn === 'stock' && sortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'}
                    />
                  </span>
                </button>
              </th>
              <th class="px-4 py-3 text-right font-medium uppercase">{$_('actions')}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            {#if products.length === 0 && !loading}
              <tr>
                <td colspan="7" class="p-0">
                  <EmptyState
                    illustration="stock-page"
                    title="No Products Found"
                    description="No products match your current search or filters. Try adjusting your criteria to find what you're looking for."
                  />
                </td>
              </tr>
            {:else}
              {#each products as product}
                <tr class="hover:bg-muted/20 transition-colors cursor-pointer" onclick={() => handleView(product)}>
                  <td class="px-4 py-4">
                    <input type="checkbox" class="rounded" onclick={(e) => e.stopPropagation()} />
                  </td>
                  <td class="px-4 py-4 text-foreground">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-md bg-[#4DA0E6]/10 flex items-center justify-center shrink-0">
                        <Icon iconName="icon/package" size={16} class="text-[#4DA0E6]" />
                      </div>
                      <span class="text-sm font-medium text-foreground truncate">{product.name ?? "-"}</span>
                    </div>
                  </td>
                  <td class="px-4 py-4 text-foreground">{product.product_type?.name ?? "-"}</td>
                  <td class="px-4 py-4 text-foreground">{product.default_unit ?? "-"}</td>
                  <td class="px-4 py-4">
                    {#if product.is_active}
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {$_('statusActive')}
                      </span>
                    {:else}
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        {$_('inactive')}
                      </span>
                    {/if}
                  </td>
                  <td class="px-4 py-4">
                    {#if (product.current_available_stock ?? 0) <= (product.treshold_quantity ?? 0)}
                      <span
                        class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                      >
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        {$_('statusLowStock')} · {product.current_available_stock ?? 0} / {product.treshold_quantity ?? 0}
                      </span>
                    {:else}
                      <span class="text-foreground">
                        {product.current_available_stock ?? 0} {product.default_unit ?? ""}
                      </span>
                    {/if}
                  </td>
                  <td class="px-4 py-4 text-right">
                    <button
                      onclick={(e) => { e.stopPropagation(); handleView(product); }}
                      class="p-1.5 rounded hover:bg-muted transition-colors"
                      aria-label={$_('view')}
                    >
                      <Icon iconName="icon/eye" size={16} class="text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onclick={(e) => { e.stopPropagation(); handleEdit(product); }}
                      class="p-1.5 rounded hover:bg-muted transition-colors"
                      aria-label={$_('edit')}
                    >
                      <Icon iconName="icon/edit" size={16} class="text-muted-foreground hover:text-foreground" />
                    </button>
                    <button
                      onclick={(e) => { e.stopPropagation(); handleDeleteClick(product); }}
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

<CreateProductModal
  bind:isOpen={isCreateModalOpen}
  productId={editingProductId}
  onSuccess={handleCreateSuccess}
/>

<ConfirmModal
  bind:isOpen={isDeleteModalOpen}
  title="Delete Product"
  message={deletingProduct ? `Are you sure you want to delete <strong>${deletingProduct.name}</strong>? This action cannot be undone.` : ""}
  error={deleteError}
  confirmText="Delete Product"
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
