<script lang="ts">
  import {
    SearchBar,
    FilterDropdown,
    MerchantCard,
    InviteMerchantCard,
    Pagination,
    HireMerchantModal,
    EmptyState,
  } from "$lib/components/investor/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { _ } from "svelte-i18n";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { getAnonymousClient } from "$graphql/client.ts";
  import LANDING_QUERY from "$graphql/queries/merchants/landing.gql";
  import type { ApolloError } from "@apollo/client";

  let searchQuery = $state($page.url.searchParams.get("search") ?? "");
  let locationFilter = $state($page.url.searchParams.get("location") ?? "");
  let currentPage = $state(Number($page.url.searchParams.get("page")) || 1);
  let rowsPerPage = $state(Number($page.url.searchParams.get("limit")) || 12);

  let isModalOpen = $state(false);
  let selectedMerchant = $state<{
    id: number;
    name: string;
    avatar?: string;
    status: "active" | "declined" | "invited";
    productsSold: number;
    category: string;
  } | undefined>(undefined);

  let merchants = $state<any[]>([]);
  let totalCount = $state(0);
  let loading = $state(true);
  let fetchError = $state<string | null>(null);

  // Debounced search (prevents redundant queries while typing)
  let debouncedSearch = $state(searchQuery);
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

  const locationOptions = $derived([
    { value: "", label: $_('allLocations') },
    { value: "addis-ababa", label: $_('locAddisAbaba') },
    { value: "dire-dawa", label: $_('locDireDawa') },
    { value: "hawassa", label: $_('locHawassa') },
    { value: "bahir-dar", label: $_('locBahirDar') },
    { value: "mekelle", label: $_('locMekelle') },
  ]);

  const totalPages = $derived(Math.max(1, Math.ceil(totalCount / rowsPerPage)));

  function buildFilter(): Record<string, unknown> {
    const conditions: Record<string, unknown>[] = [];

    if (debouncedSearch) {
      conditions.push({
        _or: [
          { first_name: { _ilike: `%${debouncedSearch}%` } },
          { last_name: { _ilike: `%${debouncedSearch}%` } },
        ],
      });
    }

    return conditions.length ? { _and: conditions } : {};
  }

  // Sync URL with current filter/page state
  function syncUrl() {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (currentPage > 1) params.set("page", String(currentPage));
    if (rowsPerPage !== 12) params.set("limit", String(rowsPerPage));
    const qs = params.toString();
    goto(qs ? `?${qs}` : "/", { replaceState: true, keepFocus: true, noScroll: true });
  }

  // Fetch merchants when deps change
  $effect(() => {
    void debouncedSearch;
    void locationFilter;
    void currentPage;
    void rowsPerPage;

    loading = true;
    fetchError = null;

    const timer = setTimeout(async () => {
      try {
        const client = getAnonymousClient();
        const result = await client.query<{
          merchant: Array<{
            id: string;
            first_name: string;
            last_name: string;
            address: string;
            phone_number: string;
            branch: { id: string; name: string; address: string; company: string; created_at: string } | null;
            orders_aggregate: { aggregate: { count: number } };
          }>;
          total_merchants: { aggregate: { count: number } };
        }>({
          query: LANDING_QUERY,
          variables: {
            limit: rowsPerPage,
            offset: (currentPage - 1) * rowsPerPage,
            filter: buildFilter(),
            order: [{ orders_aggregate: { count: "desc_nulls_last" } }],
          },
        });
        merchants = result.data?.merchant ?? [];
        totalCount = result.data?.total_merchants.aggregate.count ?? 0;
        syncUrl();
      } catch (err) {
        fetchError = (err as ApolloError).message;
        merchants = [];
        totalCount = 0;
      } finally {
        loading = false;
      }
    }, 300);

    return () => clearTimeout(timer);
  });

  function requireAuth() {
    if (!authStore.isAuthenticated) {
      goto("/onboarding/signin");
      return false;
    }
    return true;
  }

  function handleHire(merchantId: string) {
    if (!requireAuth()) return;
    const m = merchants.find((m) => m.id === merchantId);
    if (m) {
      selectedMerchant = {
        id: m.id,
        name: `${m.first_name} ${m.last_name}`,
        status: "active",
        productsSold: m.orders_aggregate?.aggregate?.count ?? 0,
        category: m.branch?.company ?? m.branch?.name ?? "",
      };
      isModalOpen = true;
    }
  }

  function handleInvite() {
    if (!requireAuth()) return;
    isModalOpen = true;
  }

  function handleCloseModal() {
    isModalOpen = false;
    selectedMerchant = undefined;
  }

  function handleSendInvitation(data: {
    location: string;
    categories: string[];
    products: string[];
    canCreateProduct: boolean;
    canAssignStock: boolean;
  }) {
    console.log("Sending invitation:", {
      merchant: selectedMerchant?.name,
      ...data,
    });
  }

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }
</script>

<div class="min-h-screen bg-background">
  <main class="container mx-auto px-5 sm:px-6 lg:px-8 py-8">
    <div class="mb-8">
      <h1
        class="flex-none text-foreground"
        style="width: 507px; max-width: 100%; height: 38px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 700; font-size: 29px; line-height: 38px; flex: none; order: 0; flex-grow: 0;"
      >
        {$_('pageTitle')}
      </h1>
      <p
        class="flex-none mt-2 text-muted-foreground"
        style="width: 528px; max-width: 100%; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 400; font-size: 13px; line-height: 18px; flex: none; order: 1; flex-grow: 0;"
      >
        {$_('pageSubtitle')}
      </p>
    </div>

    <div class="space-y-4 mb-10">
      <div
        class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
      >
        <div class="w-full sm:flex-1" style="max-width: 484px;">
          <SearchBar
            bind:value={searchQuery}
            placeholder={$_('searchPlaceholder')}
          />
        </div>

        <button
          type="button"
          onclick={handleInvite}
          class="flex flex-row justify-center items-center flex-none sm:ml-auto"
          style="padding: 7px 20px; gap: 4px; width: 148px; height: 38px; border-radius: 5px; flex-grow: 0; background: var(--primary-blue);"
        >
          <Icon iconName="icon/plus" size={13} class="text-white flex-none" />
          <span
            class="flex-none text-center"
            style="font-family: 'Nunito Sans', sans-serif; font-weight: 500; font-size: 13px; line-height: 20px; color: #FFFFFF;"
          >
            {$_('inviteMerchant')}
          </span>
        </button>
      </div>

      <div class="flex flex-wrap gap-3">
        <FilterDropdown
          label={$_('filterLocation')}
          options={locationOptions}
          bind:value={locationFilter}
        />
      </div>
    </div>

    {#if fetchError}
      <div class="flex flex-col items-center justify-center py-16">
        <Icon iconName="icon/alert-circle" size={48} class="text-destructive mb-4" />
        <p class="text-destructive font-medium">{$_('somethingWentWrong')}</p>
        <p class="text-muted-foreground text-sm mt-1">{fetchError}</p>
      </div>
    {:else if loading}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10"
        style="row-gap: 41px; column-gap: 36.79px;"
      >
        {#each Array(7) as _}
          <div
            class="flex flex-col bg-card border border-border animate-pulse rounded-[9.8px]"
            style="width: 311.52px; height: 225.21px; padding: 18px 12.26px 23px;"
          >
            <div class="flex items-start gap-3">
              <div class="size-14 rounded-full bg-muted dark:bg-muted/50 shrink-0" />
              <div class="flex-1 space-y-2 pt-2">
                <div class="h-4 w-28 rounded bg-muted dark:bg-muted/50" />
                <div class="h-3 w-20 rounded bg-muted/60 dark:bg-muted/30" />
              </div>
            </div>
            <div class="mt-auto space-y-3">
              <div class="h-3 w-24 rounded bg-muted/60 dark:bg-muted/30" />
              <div class="h-9 w-full rounded-md bg-muted dark:bg-muted/50" />
            </div>
          </div>
        {/each}
        <div
          class="flex flex-col bg-card border border-border animate-pulse rounded-[9.8px]"
          style="width: 311.52px; height: 225.21px; align-self: stretch;"
        >
          <div class="flex flex-col items-center justify-center h-full gap-3 px-6">
            <div class="size-14 rounded-full bg-muted dark:bg-muted/50" />
            <div class="h-4 w-32 rounded bg-muted dark:bg-muted/50" />
            <div class="h-3 w-44 rounded bg-muted/60 dark:bg-muted/30" />
            <div class="h-9 w-full rounded-md bg-muted dark:bg-muted/50 mt-2" />
          </div>
        </div>
      </div>
    {:else if merchants.length === 0}
      <EmptyState
        illustration="merchants"
        title="No Merchants Found"
        description={$_('pageSubtitle')}
      />
    {:else}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10"
        style="row-gap: 41px; column-gap: 36.79px;"
      >
        {#each merchants as m}
          <MerchantCard
            name={`${m.first_name} ${m.last_name}`}
            status="active"
            productsSold={m.orders_aggregate?.aggregate?.count ?? 0}
            location={m.address || m.branch?.name || ""}
            onHire={() => handleHire(m.id)}
          />
        {/each}

        <InviteMerchantCard onInvite={handleInvite} />
      </div>
    {/if}

    {#if !loading && merchants.length > 0}
      <Pagination
        bind:currentPage
        bind:rowsPerPage
        totalPages={totalPages}
        totalEntries={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    {/if}
  </main>

  <HireMerchantModal
    bind:isOpen={isModalOpen}
    merchant={selectedMerchant}
    onClose={handleCloseModal}
    onSendInvitation={handleSendInvitation}
  />
</div>
