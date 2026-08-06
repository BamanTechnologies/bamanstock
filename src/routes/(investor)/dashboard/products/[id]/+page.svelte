<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import CreateProductModal from "$lib/components/investor/CreateProductModal.svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { getAuthClient } from "$graphql/client.js";
  import PRODUCT_DETAIL_QUERY from "$graphql/queries/product/detail/product_by_id.gql";
  import PRODUCT_STOCKS_QUERY from "$graphql/queries/product/detail/product_stocks.gql";
  import PRODUCT_ORDERS_QUERY from "$graphql/queries/product/detail/product_orders.gql";
  import PRODUCT_STOCK_MOVEMENTS_QUERY from "$graphql/queries/product/detail/product_stock_movements.gql";
  import {
    formatProductTypeLabel,
    buildProductLabel,
  } from "$lib/inventory/product-labels";

  const productId = $derived($page.params.id);

  let activeTab = $state($page.url.searchParams.get("tab") ?? "Overview");
  const tabs = ["Overview", "Stock", "Orders", "Stock Movement"];

  function switchTab(tab: string) {
    activeTab = tab;
    const params = new URLSearchParams($page.url.searchParams);
    params.set("tab", tab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  function handleBack() {
    goto("/dashboard/products");
  }

  // ===================== Overview Tab =====================
  let detailData = $state<any>(null);
  let detailLoading = $state(true);
  let detailRefetchTrigger = $state(0);
  let isEditModalOpen = $state(false);

  $effect(() => {
    void detailRefetchTrigger;
    detailLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: PRODUCT_DETAIL_QUERY,
          variables: { id: productId },
        });
        detailData = (result.data as any) ?? null;
      } catch {
        detailData = null;
      } finally {
        detailLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  const product = $derived(detailData?.products_by_pk ?? null);

  const overviewKpiCards = $derived.by(() => {
    if (!detailData) return [];
    const d = detailData;
    return [
      {
        label: "Total Orders",
        value: String(d.total_orders?.aggregate?.count ?? 0),
        icon: "icon/shopping-cart" as const,
        iconColor: "bg-blue-100 dark:bg-blue-900/40",
      },
      {
        label: "Total Sales",
        value: fmtCurrency(d.total_product_sales?.aggregate?.sum?.total_amount),
        icon: "icon/bar-chart" as const,
        iconColor: "bg-green-100 dark:bg-green-900/40",
      },
      {
        label: "Outstanding",
        value: fmtCurrency(d.total_product_sales_outstanding?.aggregate?.sum?.outstanding_amount),
        icon: "icon/credit-card" as const,
        iconColor: "bg-orange-100 dark:bg-orange-900/40",
      },
      {
        label: "Total Transfers",
        value: String(d.total_transfers?.aggregate?.count ?? 0),
        icon: "icon/refresh-cw" as const,
        iconColor: "bg-purple-100 dark:bg-purple-900/40",
      },
    ];
  });

  const isLowStock = $derived(
    !!product &&
      (product.current_available_stock ?? 0) <= (product.treshold_quantity ?? 0)
  );

  const attributeEntries = $derived.by(() => {
    const attrs = product?.attributes ?? {};
    if (typeof attrs !== "object" || attrs === null) return [];
    return Object.entries(attrs).filter(([, v]) => v != null && v !== "");
  });

  function formatAttrKey(key: string): string {
    return key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  function formatAttrValue(key: string, value: unknown): string {
    if (key === "thickness" && typeof value === "number") return `${value}mm`;
    return String(value);
  }

  // ===================== Tab: Stock =====================
  function stockSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (stockDebouncedSearch) params.set("stk_search", stockDebouncedSearch); else params.delete("stk_search");
    if (stockCurrentPage > 1) params.set("stk_page", String(stockCurrentPage)); else params.delete("stk_page");
    if (stockRowsPerPage !== 10) params.set("stk_limit", String(stockRowsPerPage)); else params.delete("stk_limit");
    if (stockSortColumn !== "created_at") params.set("stk_sort", stockSortColumn); else params.delete("stk_sort");
    if (stockSortDirection !== "desc") params.set("stk_dir", stockSortDirection); else params.delete("stk_dir");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let stockSearchQuery = $state($page.url.searchParams.get("stk_search") ?? "");
  let stockCurrentPage = $state(Number($page.url.searchParams.get("stk_page")) || 1);
  let stockRowsPerPage = $state(Number($page.url.searchParams.get("stk_limit")) || 10);
  let stockSortColumn = $state($page.url.searchParams.get("stk_sort") || "created_at");
  let stockSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("stk_dir") as "asc" | "desc") || "desc"
  );

  let stockData = $state<any[]>([]);
  let stockTotalCount = $state(0);
  let stockLoading = $state(false);

  let stockDebouncedSearch = $state($page.url.searchParams.get("stk_search") ?? "");
  let stockDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(stockDebounceTimer);
    if (stockSearchQuery === stockDebouncedSearch) return;
    stockDebounceTimer = setTimeout(() => {
      stockDebouncedSearch = stockSearchQuery;
      stockCurrentPage = 1;
    }, 400);
    return () => clearTimeout(stockDebounceTimer);
  });

  const stockTotalPages = $derived(Math.max(1, Math.ceil(stockTotalCount / stockRowsPerPage)));

  function stockBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [
      { product: { id: { _eq: productId } } },
    ];
    if (stockDebouncedSearch) {
      conditions.push({
        _or: [
          { batch_number: { _ilike: `%${stockDebouncedSearch}%` } },
          { product: { name: { _ilike: `%${stockDebouncedSearch}%` } } },
          { product: { product_type: { name: { _ilike: `%${stockDebouncedSearch}%` } } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function stockBuildOrder(): Record<string, unknown>[] {
    switch (stockSortColumn) {
      case "batch":
        return [{ batch_number: stockSortDirection }];
      case "type":
        return [{ product: { product_type: { name: stockSortDirection } } }];
      case "location":
        return [{ branchByBranch: { name: stockSortDirection } }];
      case "quantity":
        return [{ quantity: stockSortDirection }];
      case "created_at":
      default:
        return [{ created_at: stockSortDirection }];
    }
  }

  $effect(() => {
    if (activeTab !== "Stock") return;
    void stockDebouncedSearch;
    void stockCurrentPage;
    void stockRowsPerPage;
    void stockSortColumn;
    void stockSortDirection;
    stockLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: PRODUCT_STOCKS_QUERY,
          variables: {
            limit: stockRowsPerPage,
            offset: (stockCurrentPage - 1) * stockRowsPerPage,
            filter: stockBuildFilter(),
            order: stockBuildOrder(),
          },
        });
        const d = result.data as any;
        stockData = d?.stock ?? [];
        stockTotalCount = d?.stock_aggregate?.aggregate?.count ?? 0;
        stockSyncUrl();
      } catch {
        stockData = [];
        stockTotalCount = 0;
      } finally {
        stockLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  function stockHandleSort(column: string) {
    if (stockSortColumn === column) {
      stockSortDirection = stockSortDirection === "asc" ? "desc" : "asc";
    } else {
      stockSortColumn = column;
      stockSortDirection = "asc";
    }
    stockCurrentPage = 1;
  }

  // ===================== Tab: Orders =====================
  function ordersSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (ordersDebouncedSearch) params.set("ord_search", ordersDebouncedSearch); else params.delete("ord_search");
    if (ordersCurrentPage > 1) params.set("ord_page", String(ordersCurrentPage)); else params.delete("ord_page");
    if (ordersRowsPerPage !== 10) params.set("ord_limit", String(ordersRowsPerPage)); else params.delete("ord_limit");
    if (ordersSortColumn !== "status") params.set("ord_sort", ordersSortColumn); else params.delete("ord_sort");
    if (ordersSortDirection !== "asc") params.set("ord_dir", ordersSortDirection); else params.delete("ord_dir");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let ordersSearchQuery = $state($page.url.searchParams.get("ord_search") ?? "");
  let ordersCurrentPage = $state(Number($page.url.searchParams.get("ord_page")) || 1);
  let ordersRowsPerPage = $state(Number($page.url.searchParams.get("ord_limit")) || 10);
  let ordersSortColumn = $state($page.url.searchParams.get("ord_sort") || "status");
  let ordersSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("ord_dir") as "asc" | "desc") || "asc"
  );

  let ordersData = $state<any[]>([]);
  let ordersTotalCount = $state(0);
  let ordersLoading = $state(false);

  let ordersDebouncedSearch = $state($page.url.searchParams.get("ord_search") ?? "");
  let ordersDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(ordersDebounceTimer);
    if (ordersSearchQuery === ordersDebouncedSearch) return;
    ordersDebounceTimer = setTimeout(() => {
      ordersDebouncedSearch = ordersSearchQuery;
      ordersCurrentPage = 1;
    }, 400);
    return () => clearTimeout(ordersDebounceTimer);
  });

  const ordersTotalPages = $derived(Math.max(1, Math.ceil(ordersTotalCount / ordersRowsPerPage)));

  function ordersBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [
      { stock: { product_id: { _eq: productId } } },
    ];
    if (ordersDebouncedSearch) {
      conditions.push({
        _or: [
          { customer: { first_name: { _ilike: `%${ordersDebouncedSearch}%` } } },
          { customer: { last_name: { _ilike: `%${ordersDebouncedSearch}%` } } },
          { customer: { phone_number: { _ilike: `%${ordersDebouncedSearch}%` } } },
          { merchant: { first_name: { _ilike: `%${ordersDebouncedSearch}%` } } },
          { merchant: { last_name: { _ilike: `%${ordersDebouncedSearch}%` } } },
          { status: { _ilike: `%${ordersDebouncedSearch}%` } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function ordersBuildOrder(): Record<string, unknown>[] {
    switch (ordersSortColumn) {
      case "customer":
        return [{ customer: { first_name: ordersSortDirection } }];
      case "merchant":
        return [{ merchant: { first_name: ordersSortDirection } }];
      case "total":
        return [{ total_amount: ordersSortDirection }];
      case "outstanding":
        return [{ outstanding_amount: ordersSortDirection }];
      case "status":
      default:
        return [{ status: ordersSortDirection }];
    }
  }

  $effect(() => {
    if (activeTab !== "Orders") return;
    void ordersDebouncedSearch;
    void ordersCurrentPage;
    void ordersRowsPerPage;
    void ordersSortColumn;
    void ordersSortDirection;
    ordersLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: PRODUCT_ORDERS_QUERY,
          variables: {
            limit: ordersRowsPerPage,
            offset: (ordersCurrentPage - 1) * ordersRowsPerPage,
            filter: ordersBuildFilter(),
            orderBy: ordersBuildOrder(),
          },
        });
        const d = result.data as any;
        ordersData = d?.orders ?? [];
        ordersTotalCount = d?.total?.aggregate?.count ?? 0;
        ordersSyncUrl();
      } catch {
        ordersData = [];
        ordersTotalCount = 0;
      } finally {
        ordersLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  function ordersHandleSort(column: string) {
    if (ordersSortColumn === column) {
      ordersSortDirection = ordersSortDirection === "asc" ? "desc" : "asc";
    } else {
      ordersSortColumn = column;
      ordersSortDirection = "asc";
    }
    ordersCurrentPage = 1;
  }

  function orderStatusClass(status: string): string {
    const s = String(status ?? "").toUpperCase();
    if (s.includes("COMPLETED") || s.includes("PAID") || s.includes("DELIVERED")) {
      return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
    }
    if (s.includes("CANCELLED") || s.includes("CANCELED") || s.includes("REJECTED")) {
      return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300";
    }
    if (s.includes("PENDING") || s.includes("PROCESSING")) {
      return "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300";
    }
    if (s.includes("PARTIAL")) {
      return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
    }
    if (s.includes("OVERDUE") || s.includes("OUTSTANDING")) {
      return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
    }
    return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300";
  }

  // ===================== Tab: Stock Movement =====================
  function smSyncUrl() {
    const params = new URLSearchParams($page.url.searchParams.toString());
    if (smDateFrom) params.set("sm_from", smDateFrom); else params.delete("sm_from");
    if (smDateTo) params.set("sm_to", smDateTo); else params.delete("sm_to");
    if (smDebouncedSearch) params.set("sm_search", smDebouncedSearch); else params.delete("sm_search");
    if (smCurrentPage > 1) params.set("sm_page", String(smCurrentPage)); else params.delete("sm_page");
    if (smRowsPerPage !== 10) params.set("sm_limit", String(smRowsPerPage)); else params.delete("sm_limit");
    if (smSortColumn !== "created_at") params.set("sm_sort", smSortColumn); else params.delete("sm_sort");
    if (smSortDirection !== "desc") params.set("sm_dir", smSortDirection); else params.delete("sm_dir");
    params.set("tab", activeTab);
    goto(`?${params.toString()}`, { replaceState: true, keepFocus: true, noScroll: true });
  }

  let smDateFrom = $state($page.url.searchParams.get("sm_from") ?? "");
  let smDateTo = $state($page.url.searchParams.get("sm_to") ?? "");
  let smSearchQuery = $state($page.url.searchParams.get("sm_search") ?? "");
  let smCurrentPage = $state(Number($page.url.searchParams.get("sm_page")) || 1);
  let smRowsPerPage = $state(Number($page.url.searchParams.get("sm_limit")) || 10);
  let smSortColumn = $state($page.url.searchParams.get("sm_sort") || "created_at");
  let smSortDirection = $state<"asc" | "desc">(
    ($page.url.searchParams.get("sm_dir") as "asc" | "desc") || "desc"
  );

  let smData = $state<any[]>([]);
  let smTotalCount = $state(0);
  let smLoading = $state(false);

  let smDebouncedSearch = $state($page.url.searchParams.get("sm_search") ?? "");
  let smDebounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    clearTimeout(smDebounceTimer);
    if (smSearchQuery === smDebouncedSearch) return;
    smDebounceTimer = setTimeout(() => {
      smDebouncedSearch = smSearchQuery;
      smCurrentPage = 1;
    }, 400);
    return () => clearTimeout(smDebounceTimer);
  });

  const smTotalPages = $derived(Math.max(1, Math.ceil(smTotalCount / smRowsPerPage)));

  function smBuildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [
      { product_id: { _eq: productId } },
    ];
    if (smDateFrom) conditions.push({ created_at: { _gte: `${smDateFrom}T00:00:00` } });
    if (smDateTo) conditions.push({ created_at: { _lte: `${smDateTo}T23:59:59` } });
    if (smDebouncedSearch) {
      conditions.push({
        _or: [
          { reference_type: { _ilike: `%${smDebouncedSearch}%` } },
          { stock: { batch_number: { _ilike: `%${smDebouncedSearch}%` } } },
          { merchant: { first_name: { _ilike: `%${smDebouncedSearch}%` } } },
          { merchant: { last_name: { _ilike: `%${smDebouncedSearch}%` } } },
          { branch: { name: { _ilike: `%${smDebouncedSearch}%` } } },
        ],
      });
    }
    return conditions.length ? { _and: conditions } : {};
  }

  function smBuildOrder(): Record<string, unknown>[] {
    switch (smSortColumn) {
      case "movement_type":
        return [{ movement_type: smSortDirection }];
      case "product":
        return [{ stock: { product: { name: smSortDirection } } }];
      case "branch":
        return [{ branch: { name: smSortDirection } }];
      case "quantity":
        return [{ quantity_delta: smSortDirection }];
      case "created_at":
      default:
        return [{ created_at: smSortDirection }];
    }
  }

  $effect(() => {
    if (activeTab !== "Stock Movement") return;
    void smDateFrom;
    void smDateTo;
    void smDebouncedSearch;
    void smCurrentPage;
    void smRowsPerPage;
    void smSortColumn;
    void smSortDirection;
    smLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const result = await client.query({
          query: PRODUCT_STOCK_MOVEMENTS_QUERY,
          variables: {
            limit: smRowsPerPage,
            offset: (smCurrentPage - 1) * smRowsPerPage,
            filter: smBuildFilter(),
            order: smBuildOrder(),
          },
        });
        const d = result.data as any;
        smData = d?.stock_movements ?? [];
        smTotalCount = d?.stock_movements_aggregate?.aggregate?.count ?? 0;
        smSyncUrl();
      } catch {
        smData = [];
        smTotalCount = 0;
      } finally {
        smLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  function smHandleSort(column: string) {
    if (smSortColumn === column) {
      smSortDirection = smSortDirection === "asc" ? "desc" : "asc";
    } else {
      smSortColumn = column;
      smSortDirection = "asc";
    }
    smCurrentPage = 1;
  }

  function movementTypeClass(type: string): string {
    switch (type) {
      case "PURCHASE": return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300";
      case "SALE": return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
      case "TRANSFER_IN": return "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300";
      case "TRANSFER_OUT": return "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300";
      default: return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300";
    }
  }

  // ===================== Shared Utilities =====================
  const AVATAR_COLORS = [
    "#4DA0E6","#D15B7A","#34A853","#FBBC05",
    "#FF6B6B","#6B5B95","#88B04B","#F7CAC9",
    "#92A8D1","#955251","#B565A7","#009B77",
  ];

  function avatarColor(name: string): string {
    return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
  }

  function initials(first_name: string, last_name: string): string {
    return (first_name?.charAt(0) ?? "") + (last_name?.charAt(0) ?? "");
  }

  function fmtCurrency(val: unknown): string {
    if (val == null) return "ETB 0";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center text-xs sm:text-base gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Products</span>
  </button>

  <!-- Product Profile Card -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        {#if detailLoading}
          <div class="h-6 w-48 bg-muted rounded animate-pulse mb-2" />
          <div class="h-4 w-32 bg-muted/60 rounded animate-pulse" />
        {:else}
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-md bg-[#4DA0E6]/10 flex items-center justify-center shrink-0">
              <Icon iconName="icon/package" size={20} class="text-[#4DA0E6]" />
            </div>
            <h2 class="text-sm sm:text-2xl font-semibold text-foreground">
              {product ? buildProductLabel(product) : "-"}
            </h2>
          </div>
          <div class="flex items-center gap-2 flex-wrap mb-2">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-[#4DA0E6]/10 text-[#4DA0E6]"
            >
              {formatProductTypeLabel(product?.product_type?.name)}
            </span>
            {#if product?.is_active}
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                Active
              </span>
            {:else}
              <span
                class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                Inactive
              </span>
            {/if}
          </div>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Unit: {product?.default_unit ?? "-"}
            {#if product?.barcode}
              · Barcode: <span class="font-mono">{product.barcode}</span>
            {/if}
            {#if product?.qr_code}
              · QR: <span class="font-mono">{product.qr_code}</span>
            {/if}
          </p>
        {/if}
      </div>

      {#if !detailLoading}
        <div class="flex flex-col items-start lg:items-end gap-2">
          {#if isLowStock}
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Low Stock · {product.current_available_stock ?? 0} / {product.treshold_quantity ?? 0}
            </span>
          {:else}
            <span
              class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              In Stock
            </span>
          {/if}
          <p class="text-xl sm:text-2xl font-bold text-foreground">
            {product?.current_available_stock ?? 0} {product?.default_unit ?? ""}
          </p>
          <p class="text-xs sm:text-sm text-muted-foreground">
            Threshold: {product?.treshold_quantity ?? 0}
          </p>
          <Button
            class="bg-[#4DA0E6] text-white text-xs sm:text-sm hover:bg-[#4DA0E6]/90 mt-1"
            onclick={() => (isEditModalOpen = true)}
          >
            <Icon iconName="icon/edit" size={14} class="mr-1.5" />
            Edit Product
          </Button>
        </div>
      {/if}
    </div>

    {#if !detailLoading && attributeEntries.length > 0}
      <div class="flex items-center gap-2 flex-wrap mt-4 pt-4 border-t border-border">
        <span class="text-xs text-muted-foreground mr-1">Attributes:</span>
        {#each attributeEntries as [key, value]}
          <span
            class="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium bg-muted/40 border border-border text-foreground"
          >
            {formatAttrKey(key)}: {formatAttrValue(key, value)}
          </span>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
      {#each tabs as tab}
        <button
          onclick={() => switchTab(tab)}
          class="pb-2 sm:pb-4 px-1 text-xs sm:text-base border-b-2 transition-colors {activeTab === tab
            ? 'border-info text-info font-medium'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <!-- ==================== Tab: Overview ==================== -->
  {#if activeTab === "Overview"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#if detailLoading}
          {#each [1,2,3,4] as _}
            <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
              <div class="h-4 bg-muted rounded w-24 mb-3" />
              <div class="h-8 bg-muted rounded w-32 mb-3" />
              <div class="h-5 bg-muted rounded w-36" />
            </div>
          {/each}
        {:else}
          {#each overviewKpiCards as kpi}
            <div class="bg-card border border-border rounded-lg p-3 sm:p-6">
              <div class="flex items-center justify-between mb-2 sm:mb-4">
                <span class="text-xs sm:text-sm text-muted-foreground">{kpi.label}</span>
                <div class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center">
                  <Icon iconName={kpi.icon} size={20} class="text-foreground" />
                </div>
              </div>
              <p class="text-xl sm:text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            </div>
          {/each}
        {/if}
      </div>

      <!-- Low Stock Alert Banner -->
      {#if !detailLoading && isLowStock}
        <div
          class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/40 rounded-lg"
        >
          <div class="flex items-center gap-3">
            <Icon iconName="icon/alert-triangle" size={20} class="text-amber-500 shrink-0" />
            <div>
              <p class="text-sm font-medium text-foreground">Low Stock Alert</p>
              <p class="text-xs text-muted-foreground">
                Current stock ({product.current_available_stock ?? 0} {product.default_unit ?? ""}) is at or
                below the reorder threshold ({product.treshold_quantity ?? 0}).
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            class="border-info text-info hover:bg-info/10"
            onclick={() => switchTab("Orders")}
          >
            View Orders
          </Button>
        </div>
      {/if}

      <!-- Attributes Card -->
      <div class="bg-card border border-border rounded-lg p-3 sm:p-6">
        <h3 class="text-xs sm:text-lg font-semibold text-foreground mb-3 sm:mb-6">Product Information</h3>
        {#if detailLoading}
          <div class="space-y-3">
            {#each [1,2,3] as _}
              <div class="h-4 bg-muted/60 rounded animate-pulse w-2/3" />
            {/each}
          </div>
        {:else if attributeEntries.length === 0}
          <div class="text-center py-8">
            <Icon iconName="icon/tag" size={40} class="text-muted-foreground mx-auto mb-3" />
            <p class="text-muted-foreground">No additional product attributes</p>
          </div>
        {:else}
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {#each attributeEntries as [key, value]}
              <div class="flex items-center justify-between p-3 border border-border rounded-lg">
                <span class="text-xs sm:text-sm text-muted-foreground">{formatAttrKey(key)}</span>
                <span class="text-xs sm:text-sm font-medium text-foreground">{formatAttrValue(key, value)}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

  <!-- ==================== Tab: Stock ==================== -->
  {:else if activeTab === "Stock"}
    <div class="space-y-6">
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
              placeholder="Search by batch, product..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={stockSearchQuery}
            />
          </div>
        </div>

        {#if stockLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("type")}>
                    Type
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'type' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'type' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("batch")}>
                    Batch #
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'batch' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'batch' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("location")}>
                    Location
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'location' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'location' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Origin</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("quantity")}>
                    Qty
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'quantity' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Expiry</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => stockHandleSort("created_at")}>
                    Date Added
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={stockSortColumn === 'created_at' && stockSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if stockData.length === 0 && !stockLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>No stock found for this product</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each stockData as item}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground">{item.type ?? "-"}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{item.batch_number ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{item.branch?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{item.origin?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{item.quantity ?? 0} {item.unit ?? ""}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "-"}
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
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
              bind:value={stockRowsPerPage}
              onchange={() => { stockCurrentPage = 1; }}
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
              disabled={stockCurrentPage === 1}
              onclick={() => stockCurrentPage = stockCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(stockCurrentPage, stockTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === stockCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === stockCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => stockCurrentPage = p}
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
              disabled={stockCurrentPage === stockTotalPages}
              onclick={() => stockCurrentPage = stockCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Orders ==================== -->
  {:else if activeTab === "Orders"}
    <div class="space-y-6">
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
              placeholder="Search by customer, merchant, status..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={ordersSearchQuery}
            />
          </div>
        </div>

        {#if ordersLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => ordersHandleSort("customer")}>
                    Customer
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={ordersSortColumn === 'customer' && ordersSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={ordersSortColumn === 'customer' && ordersSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => ordersHandleSort("merchant")}>
                    Merchant
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={ordersSortColumn === 'merchant' && ordersSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={ordersSortColumn === 'merchant' && ordersSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => ordersHandleSort("status")}>
                    Status
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={ordersSortColumn === 'status' && ordersSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={ordersSortColumn === 'status' && ordersSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Unit</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => ordersHandleSort("total")}>
                    Total
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={ordersSortColumn === 'total' && ordersSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={ordersSortColumn === 'total' && ordersSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => ordersHandleSort("outstanding")}>
                    Outstanding
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={ordersSortColumn === 'outstanding' && ordersSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={ordersSortColumn === 'outstanding' && ordersSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if ordersData.length === 0 && !ordersLoading}
                <tr>
                  <td colspan="6" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/shopping-cart" size={32} class="text-muted-foreground" />
                      <p>No orders found for this product</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each ordersData as order}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-3">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                          style="background-color: {avatarColor(order.customer?.first_name ?? 'C')}"
                        >
                          {initials(order.customer?.first_name, order.customer?.last_name)}
                        </div>
                        <div>
                          <span class="text-sm font-medium text-foreground">
                            {order.customer ? `${order.customer.first_name ?? ""} ${order.customer.last_name ?? ""}` : "-"}
                          </span>
                          {#if order.customer?.phone_number}
                            <p class="text-xs text-muted-foreground">{order.customer.phone_number}</p>
                          {/if}
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-foreground">
                      {order.merchant ? `${order.merchant.first_name ?? ""} ${order.merchant.last_name ?? ""}` : "-"}
                    </td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {orderStatusClass(order.status)}">
                        {order.status ?? "-"}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{order.unit ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(order.total_amount)}</td>
                    <td class="px-4 py-3 text-foreground">{fmtCurrency(order.outstanding_amount)}</td>
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
              bind:value={ordersRowsPerPage}
              onchange={() => { ordersCurrentPage = 1; }}
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
              disabled={ordersCurrentPage === 1}
              onclick={() => ordersCurrentPage = ordersCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(ordersCurrentPage, ordersTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === ordersCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === ordersCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => ordersCurrentPage = p}
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
              disabled={ordersCurrentPage === ordersTotalPages}
              onclick={() => ordersCurrentPage = ordersCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Stock Movement ==================== -->
  {:else if activeTab === "Stock Movement"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg px-4 py-3">
        <div class="flex items-end gap-3 flex-wrap">
          <div class="flex-1 min-w-0 max-w-[200px]">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">From</label>
            <input
              type="date"
              bind:value={smDateFrom}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
          <div class="flex-1 min-w-0 max-w-[200px]">
            <label class="text-xs font-medium text-muted-foreground mb-1 block">To</label>
            <input
              type="date"
              bind:value={smDateTo}
              class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
            />
          </div>
        </div>
      </div>

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
              placeholder="Search by batch, reference..."
              class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border"
              bind:value={smSearchQuery}
            />
          </div>
        </div>

        {#if smLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">Reference</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => smHandleSort("movement_type")}>
                    Type
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'movement_type' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'movement_type' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => smHandleSort("product")}>
                    Product
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'product' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'product' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Batch #</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => smHandleSort("branch")}>
                    Location
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'branch' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'branch' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">Merchant</th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => smHandleSort("quantity")}>
                    Qty
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'quantity' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'quantity' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
                <th class="px-4 py-3 font-medium">
                  <button type="button" class="flex items-center gap-1 hover:text-foreground transition-colors uppercase" onclick={() => smHandleSort("created_at")}>
                    Date
                    <span class="flex flex-col ml-0.5">
                      <Icon iconName="icon/chevron-up" size={10} class={smSortColumn === 'created_at' && smSortDirection === 'asc' ? 'text-info -mb-0.5' : 'text-muted-foreground/50 -mb-0.5'} />
                      <Icon iconName="icon/chevron-down" size={10} class={smSortColumn === 'created_at' && smSortDirection === 'desc' ? 'text-info' : 'text-muted-foreground/50'} />
                    </span>
                  </button>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if smData.length === 0 && !smLoading}
                <tr>
                  <td colspan="8" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/box" size={32} class="text-muted-foreground" />
                      <p>No stock movements found for this product</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each smData as movement}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground text-xs">{movement.reference_type ?? "-"}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {movementTypeClass(movement.movement_type)}">
                        {movement.movement_type}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-foreground">{movement.stock?.product?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{movement.stock?.batch_number ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">{movement.branch?.name ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">
                      {movement.merchant ? `${movement.merchant.first_name ?? ""} ${movement.merchant.last_name ?? ""}` : "-"}
                    </td>
                    <td class="px-4 py-3 text-foreground font-medium">{movement.quantity_delta ?? 0}</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">
                      {movement.created_at ? new Date(movement.created_at).toLocaleDateString() : "-"}
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
              bind:value={smRowsPerPage}
              onchange={() => { smCurrentPage = 1; }}
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
              disabled={smCurrentPage === 1}
              onclick={() => smCurrentPage = smCurrentPage - 1}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(smCurrentPage, smTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === smCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === smCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => smCurrentPage = p}
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
              disabled={smCurrentPage === smTotalPages}
              onclick={() => smCurrentPage = smCurrentPage + 1}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>

<CreateProductModal
  bind:isOpen={isEditModalOpen}
  productId={productId}
  onSuccess={() => {
    detailRefetchTrigger++;
  }}
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
