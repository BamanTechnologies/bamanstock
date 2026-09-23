<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import SendSmsModal from "$lib/components/investor/SendSmsModal.svelte";
  import { getAuthClient } from "$graphql/client.ts";
  import CUSTOMER_DETAIL_QUERY from "$graphql/queries/customers/detail/detail.gql";
  import CUSTOMER_ORDERS_QUERY from "$graphql/queries/customers/detail/customer_orders.gql";
  import CUSTOMER_PAYMENTS_QUERY from "$graphql/queries/customers/detail/cusotmer_payments.gql";
  import WAIGHT_LISTS_QUERY from "$graphql/queries/customers/detail/waight_lists.gql";
  import WaightListsTab from "$lib/components/investor/WaightListsTab.svelte";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import ARCHIVE_ORDER from "$graphql/mutation/order/archive.gql";
  import { _ } from "svelte-i18n";

  const customerId = $derived($page.params.id ?? "");

  let activeTab = $state("Orders");
  const tabs = ["Orders", "Payments", "Waight Lists"];

  let isSmsModalOpen = $state(false);
  let detailRefetchTrigger = $state(0);

  function handleBack() {
    goto("/dashboard/customers");
  }

  // ===================== Overview =====================
  let customerDetail = $state<any>(null);
  let detailLoading = $state(true);

  $effect(() => {
    void detailRefetchTrigger;
    detailLoading = true;
    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const res = await client.query({ query: CUSTOMER_DETAIL_QUERY, variables: { id: customerId } });
        customerDetail = (res.data as any)?.customers_by_pk ?? null;
      } catch {
        customerDetail = null;
      } finally {
        detailLoading = false;
      }
    }, 300);
    return () => clearTimeout(timer);
  });

  // ===================== Orders Tab =====================
  let orders = $state<any[]>([]);
  let ordersTotalCount = $state(0);
  let ordersTotalAmount = $state(0);
  let ordersLoading = $state(false);
  let ordersCurrentPage = $state(1);
  let ordersRowsPerPage = $state(10);
  let ordersSubFilter = $state<"active" | "archived">("active");

  let isOrderArchiveModalOpen = $state(false);
  let orderArchivingItem = $state<any>(null);
  let orderArchiveLoading = $state(false);
  let orderArchiveError = $state<string | null>(null);

  let isOrderActivateModalOpen = $state(false);
  let orderActivatingItem = $state<any>(null);
  let orderActivateLoading = $state(false);
  let orderActivateError = $state<string | null>(null);

  const ordersTotalPages = $derived(Math.max(1, Math.ceil(ordersTotalCount / ordersRowsPerPage)));

  $effect(() => {
    void customerId;
    void activeTab;
    void ordersCurrentPage;
    void ordersRowsPerPage;
    void ordersSubFilter;
    void detailRefetchTrigger;

    if (activeTab !== "Orders") return;
    ordersLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const res = await client.query({
          query: CUSTOMER_ORDERS_QUERY,
          variables: {
            customerId,
            limit: ordersRowsPerPage,
            offset: (ordersCurrentPage - 1) * ordersRowsPerPage,
            filter: { is_deleted: { _eq: ordersSubFilter === "archived" } },
          },
        });
        const data = res.data as any;
        orders = data?.orders ?? [];
        ordersTotalCount = data?.orders_count?.aggregate?.count ?? 0;
        ordersTotalAmount = data?.orders_total?.aggregate?.sum?.total_amount ?? 0;
      } catch {
        orders = [];
        ordersTotalCount = 0;
        ordersTotalAmount = 0;
      } finally {
        ordersLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function openOrderArchiveModal(orderItem: any) {
    orderArchivingItem = orderItem;
    orderArchiveError = null;
    isOrderArchiveModalOpen = true;
  }

  function closeOrderArchiveModal() {
    isOrderArchiveModalOpen = false;
    orderArchivingItem = null;
    orderArchiveError = null;
  }

  async function confirmOrderArchive() {
    if (!orderArchivingItem) return;
    orderArchiveLoading = true;
    orderArchiveError = null;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: ARCHIVE_ORDER,
        variables: { id: orderArchivingItem.id, isDeleted: true },
      });
      isOrderArchiveModalOpen = false;
      orderArchivingItem = null;
      detailRefetchTrigger++;
    } catch (err: any) {
      orderArchiveError = err.message ?? "An unexpected error occurred";
    } finally {
      orderArchiveLoading = false;
    }
  }

  function openOrderActivateModal(orderItem: any) {
    orderActivatingItem = orderItem;
    orderActivateError = null;
    isOrderActivateModalOpen = true;
  }

  function closeOrderActivateModal() {
    isOrderActivateModalOpen = false;
    orderActivatingItem = null;
    orderActivateError = null;
  }

  async function confirmOrderActivate() {
    if (!orderActivatingItem) return;
    orderActivateLoading = true;
    orderActivateError = null;
    try {
      const client = getAuthClient("investor");
      await client.mutate({
        mutation: ARCHIVE_ORDER,
        variables: { id: orderActivatingItem.id, isDeleted: false },
      });
      isOrderActivateModalOpen = false;
      orderActivatingItem = null;
      detailRefetchTrigger++;
    } catch (err: any) {
      orderActivateError = err.message ?? "An unexpected error occurred";
    } finally {
      orderActivateLoading = false;
    }
  }

  // ===================== Payments Tab =====================
  let payments = $state<any[]>([]);
  let paymentsTotalCount = $state(0);
  let paymentsLoading = $state(false);
  let paymentsCurrentPage = $state(1);
  let paymentsRowsPerPage = $state(10);
  let paymentsSubFilter = $state<"active" | "archived">("active");

  const paymentsTotalPages = $derived(Math.max(1, Math.ceil(paymentsTotalCount / paymentsRowsPerPage)));

  $effect(() => {
    void customerId;
    void activeTab;
    void paymentsCurrentPage;
    void paymentsRowsPerPage;
    void paymentsSubFilter;
    void detailRefetchTrigger;

    if (activeTab !== "Payments") return;
    paymentsLoading = true;

    const timer = setTimeout(async () => {
      try {
        const client = getAuthClient("investor");
        const res = await client.query({
          query: CUSTOMER_PAYMENTS_QUERY,
          variables: {
            customerId,
            limit: paymentsRowsPerPage,
            offset: (paymentsCurrentPage - 1) * paymentsRowsPerPage,
            filter: { order: { is_deleted: { _eq: paymentsSubFilter === "archived" } } },
          },
        });
        const data = res.data as any;
        payments = data?.payment ?? [];
        paymentsTotalCount = data?.payments_count?.aggregate?.count ?? 0;
      } catch {
        payments = [];
        paymentsTotalCount = 0;
      } finally {
        paymentsLoading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

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

  function fmtCurrency(val: unknown): string {
    if (val == null) return "ETB 0";
    const num = Number(val);
    if (isNaN(num)) return String(val);
    return `ETB ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  function statusBadge(status: string): string {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700";
      case "unpaid":
        return "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700";
      case "partially_paid":
        return "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700";
      default:
        return "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
    }
  }

  function fmtDate(val: string | null | undefined): string {
    if (!val) return "-";
    return new Date(val).toLocaleDateString();
  }

  function customerStatus(d: any): { label: string; class: string } {
    const totalOrders = d?.total_orders?.aggregate?.count ?? 0;
    const unpaidOrders = d?.total_unpayed_or_partially_Payed_orders?.aggregate?.count ?? 0;
    if (totalOrders === 0) {
      return { label: "Pending", class: "bg-gray-100 dark:bg-gray-900/40 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700" };
    }
    if (unpaidOrders > 0) {
      return { label: "In Debt", class: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700" };
    }
    return { label: "Active", class: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700" };
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

  const overviewKpiCards = $derived.by(() => {
    const d = customerDetail;
    return [
      {
        label: "Total Orders",
        value: String(d?.total_orders?.aggregate?.count ?? 0),
        icon: "icon/shopping-bag" as const,
        color: "bg-blue-100 dark:bg-blue-900/40",
      },
      {
        label: "Total Order Value",
        value: fmtCurrency(d?.total_order_payments?.aggregate?.sum?.total_amount),
        icon: "icon/bar-chart" as const,
        color: "bg-green-100 dark:bg-green-900/40",
      },
      {
        label: "Total Outstanding",
        value: fmtCurrency(d?.total_outstanding?.aggregate?.sum?.outstanding_amount),
        icon: "icon/trending-up" as const,
        color: "bg-orange-100 dark:bg-orange-900/40",
      },
      {
        label: "Total Payments Received",
        value: fmtCurrency(d?.total_payments_received?.aggregate?.sum?.amount),
        icon: "icon/credit-card" as const,
        color: "bg-purple-100 dark:bg-purple-900/40",
      },
    ];
  });
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-xs sm:text-base text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Customers</span>
  </button>

  <!-- Customer Profile Card -->
  <div class="bg-card border border-border rounded-lg p-3 sm:p-6">
    <div class="flex flex-col sm:flex-row gap-y-2 sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0"
          style="background-color: {avatarColor(customerDetail?.first_name ?? 'C')}"
        >
          {customerDetail ? initials(customerDetail.first_name, customerDetail.last_name) : 'C'}
        </div>
        <div>
          {#if detailLoading}
            <div class="h-6 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div class="h-4 w-32 bg-muted/60 rounded animate-pulse"></div>
          {:else if customerDetail}
            <div class="flex items-center gap-3">
              <h2 class="text-sm sm:text-2xl font-semibold text-foreground">
                {customerDetail.first_name} {customerDetail.last_name}
              </h2>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {customerStatus(customerDetail).class}">
                {customerStatus(customerDetail).label}
              </span>
            </div>
            <div class="flex items-center gap-4 mt-1">
              <span class="text-xs sm:text-sm text-muted-foreground">
                {customerDetail.phone_number ?? "-"}
              </span>
              <span class="text-xs sm:text-sm text-muted-foreground">
                {customerDetail.address ?? "-"}
              </span>
            </div>
          {:else}
            <h2 class="text-sm sm:text-2xl font-semibold text-foreground">Customer</h2>
          {/if}
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button
          class="bg-[var(--primary-blue)] text-white text-xs sm:text-base hover:opacity-90"
          onclick={() => (isSmsModalOpen = true)}
        >
          <Icon iconName="icon/send" size={16} class="mr-2" />
          {$_('sendSmsMessage')}
        </Button>
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#if detailLoading}
      {#each [1,2,3,4] as _}
        <div class="bg-card border border-border rounded-lg p-5 animate-pulse">
          <div class="h-4 bg-muted rounded w-24 mb-3"></div>
          <div class="h-8 bg-muted rounded w-32"></div>
        </div>
      {/each}
    {:else}
      {#each overviewKpiCards as kpi}
        <div class="bg-card border border-border rounded-lg p-3 sm:p-6">
          <div class="flex items-center justify-between mb-2 sm:mb-4">
            <span class="text-sm text-muted-foreground">{kpi.label}</span>
            <div class="{kpi.color} w-10 h-10 rounded-lg flex items-center justify-center">
              <Icon iconName={kpi.icon} size={20} class="text-foreground" />
            </div>
          </div>
          <p class="text-xl sm:text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
        </div>
      {/each}
    {/if}
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-3 sm:gap-6 overflow-x-auto no-scrollbar">
      {#each tabs as tab}
        <button
          onclick={() => {
            activeTab = tab;
            if (tab === "Orders") { ordersCurrentPage = 1; }
            if (tab === "Payments") { paymentsCurrentPage = 1; }
          }}
          class="pb-2 sm:pb-4 px-1 text-xs sm:text-base border-b-2 transition-colors {activeTab === tab
            ? 'border-info text-info font-medium'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          {$_(`tab${tab}`)}
        </button>
      {/each}
    </div>
  </div>

  <!-- ==================== Tab: Orders ==================== -->
  {#if activeTab === "Orders"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-foreground">Orders</h3>
          <select
            class="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-border"
            value={ordersSubFilter}
            onchange={(e) => {
              ordersSubFilter = e.currentTarget.value as "active" | "archived";
              ordersCurrentPage = 1;
            }}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
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
                <th class="px-4 py-3 font-medium">{$_('orderId')}</th>
                <th class="px-4 py-3 font-medium">{$_('orderDate')}</th>
                <th class="px-4 py-3 font-medium">Items</th>
                <th class="px-4 py-3 font-medium">{$_('status')}</th>
                <th class="px-4 py-3 font-medium">{$_('totalAmount')}</th>
                <th class="px-4 py-3 font-medium">{$_('outstanding')}</th>
                <th class="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if orders.length === 0 && !ordersLoading}
                <tr>
                  <td colspan="7" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/shopping-bag" size={32} class="text-muted-foreground" />
                      <p>No orders found</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each orders as order}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground font-medium text-xs">{order.id?.slice(0, 8)}...</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{fmtDate(order.created_at)}</td>
                    <td class="px-4 py-3 text-foreground">{order.order_quantity ?? 0}</td>
                    <td class="px-4 py-3">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border {statusBadge(order.status)}">
                        {order.status}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(order.total_amount)}</td>
                    <td class="px-4 py-3 text-foreground">{fmtCurrency(order.outstanding_amount)}</td>
                    <td class="px-4 py-3 text-right">
                      {#if order.is_deleted}
                        <button
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground hover:bg-muted transition-colors"
                          onclick={() => openOrderActivateModal(order)}
                          title="{$_('activate')}"
                        >
                          <Icon iconName="icon/rotate-ccw" size={14} />
                          {$_(order.is_deleted ? 'activate' : 'archive')}
                        </button>
                      {:else}
                        <button
                          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border text-foreground hover:border-destructive/40 hover:text-destructive transition-colors"
                          onclick={() => openOrderArchiveModal(order)}
                          title="{$_('archive')}"
                        >
                          <Icon iconName="icon/archive" size={14} />
                          {$_(order.is_deleted ? 'activate' : 'archive')}
                        </button>
                      {/if}
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
                ordersRowsPerPage = Number(e.currentTarget.value);
                ordersCurrentPage = 1;
              }}
            >
              <option value="10" selected={ordersRowsPerPage === 10}>10</option>
              <option value="20" selected={ordersRowsPerPage === 20}>20</option>
              <option value="50" selected={ordersRowsPerPage === 50}>50</option>
            </select>
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={ordersCurrentPage === 1}
              onclick={() => ordersCurrentPage--}
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
              onclick={() => ordersCurrentPage++}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>

  <!-- ==================== Tab: Payments ==================== -->
  {:else if activeTab === "Payments"}
    <div class="space-y-6">
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        <div class="px-4 py-3 border-b border-border flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-foreground">Payments</h3>
          <select
            class="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:border-border"
            value={paymentsSubFilter}
            onchange={(e) => {
              paymentsSubFilter = e.currentTarget.value as "active" | "archived";
              paymentsCurrentPage = 1;
            }}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {#if paymentsLoading}
          <div class="h-1 bg-muted/30 w-full overflow-hidden">
            <div class="h-full w-full bg-[#4DA0E6] loading-slide"></div>
          </div>
        {/if}

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="uppercase bg-muted/30 border-b border-border">
              <tr class="text-left text-xs text-muted-foreground uppercase">
                <th class="px-4 py-3 font-medium">{$_('orderId')}</th>
                <th class="px-4 py-3 font-medium">{$_('paymentDate')}</th>
                <th class="px-4 py-3 font-medium">{$_('amount')}</th>
                <th class="px-4 py-3 font-medium">{$_('paymentMethod')}</th>
                <th class="px-4 py-3 font-medium">{$_('merchant')}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#if payments.length === 0 && !paymentsLoading}
                <tr>
                  <td colspan="5" class="px-4 py-12 text-center text-muted-foreground">
                    <div class="flex flex-col items-center gap-2">
                      <Icon iconName="icon/credit-card" size={32} class="text-muted-foreground" />
                      <p>No payments found</p>
                    </div>
                  </td>
                </tr>
              {:else}
                {#each payments as payment}
                  <tr class="hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3 text-foreground font-medium text-xs">{payment.order_id?.slice(0, 8)}...</td>
                    <td class="px-4 py-3 text-muted-foreground text-xs">{fmtDate(payment.created_at)}</td>
                    <td class="px-4 py-3 text-foreground font-medium">{fmtCurrency(payment.amount)}</td>
                    <td class="px-4 py-3 text-foreground">{payment.payment_method ?? "-"}</td>
                    <td class="px-4 py-3 text-foreground">
                      {payment.merchant ? `${payment.merchant.first_name} ${payment.merchant.last_name}` : "-"}
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
                paymentsRowsPerPage = Number(e.currentTarget.value);
                paymentsCurrentPage = 1;
              }}
            >
              <option value="10" selected={paymentsRowsPerPage === 10}>10</option>
              <option value="20" selected={paymentsRowsPerPage === 20}>20</option>
              <option value="50" selected={paymentsRowsPerPage === 50}>50</option>
            </select>
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-1">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80"
              style="background-color:#4DA0E620; color:#4DA0E6;"
              disabled={paymentsCurrentPage === 1}
              onclick={() => paymentsCurrentPage--}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each getVisiblePages(paymentsCurrentPage, paymentsTotalPages) as p}
              {#if typeof p === "number"}
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {p === paymentsCurrentPage ? 'text-white' : 'text-foreground border border-border hover:bg-muted'}"
                  style={p === paymentsCurrentPage ? 'background-color:#4DA0E6;' : ''}
                  onclick={() => paymentsCurrentPage = p}
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
              disabled={paymentsCurrentPage === paymentsTotalPages}
              onclick={() => paymentsCurrentPage++}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === "Waight Lists"}
    <WaightListsTab query={WAIGHT_LISTS_QUERY} customerId={customerId} />
  {/if}
</div>

<ConfirmModal
  bind:isOpen={isOrderArchiveModalOpen}
  title="Archive Order"
  message="Are you sure you want to archive this order? This will also archive its items and payments."
  error={orderArchiveError}
  confirmText="Archive"
  loading={orderArchiveLoading}
  onConfirm={confirmOrderArchive}
  onClose={closeOrderArchiveModal}
/>

<ConfirmModal
  bind:isOpen={isOrderActivateModalOpen}
  title="Activate Order"
  message="Are you sure you want to activate this order back?"
  error={orderActivateError}
  confirmText="Activate"
  loading={orderActivateLoading}
  onConfirm={confirmOrderActivate}
  onClose={closeOrderActivateModal}
/>

<SendSmsModal
  bind:isOpen={isSmsModalOpen}
  customerIds={[customerId]}
  onSuccess={() => detailRefetchTrigger++}
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
