<script lang="ts">
  import {
    SearchBar,
    FilterDropdown,
    MerchantCard,
    InviteMerchantCard,
    Pagination,
    HireMerchantModal,
  } from "$lib/components/investor/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { _ } from "svelte-i18n";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import { goto } from "$app/navigation";

  let searchQuery = $state("");
  let locationFilter = $state("");
  let statusFilter = $state("");
  let isModalOpen = $state(false);
  let selectedMerchant = $state<(typeof mockMerchants)[0] | undefined>(
    undefined
  );

  const locationOptions = $derived([
    { value: "", label: $_('allLocations') },
    { value: "addis-ababa", label: $_('locAddisAbaba') },
    { value: "dire-dawa", label: $_('locDireDawa') },
    { value: "hawassa", label: $_('locHawassa') },
    { value: "bahir-dar", label: $_('locBahirDar') },
    { value: "mekelle", label: $_('locMekelle') },
  ]);

  const statusOptions = $derived([
    { value: "", label: $_('allStatus') },
    { value: "active", label: $_('statusActive') },
    { value: "declined", label: $_('statusDeclined') },
    { value: "invited", label: $_('statusInvited') },
  ]);

  // ── Mock Data (replace with real API later)
  const mockMerchants = [
    {
      id: 1,
      name: "Jason Russel",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 230,
      category: "Electronics & Gadgets",
    },
    {
      id: 2,
      name: "Jason Russel",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 180,
      category: "Fashion & Apparel",
    },
    {
      id: 3,
      name: "Michael Ch",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 320,
      category: "Home & Kitchen",
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "/landingprofile.png",
      status: "invited" as const,
      productsSold: 95,
      category: "Home & Kitchen",
    },
    {
      id: 5,
      name: "Jason Russeln",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 410,
      category: "Sports & Outdoors",
    },
    {
      id: 6,
      name: "Jason Russel",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 275,
      category: "Books & Media",
    },
    {
      id: 7,
      name: "James Jac",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 150,
      category: "Toys & Games",
    },
    {
      id: 8,
      name: "Jason Russel",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 380,
      category: "Health & Wellness",
    },
    {
      id: 9,
      name: "Robert Taylor",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 220,
      category: "Automotive",
    },
    {
      id: 10,
      name: "Jason Russel",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 290,
      category: "Food & Beverages",
    },
    {
      id: 11,
      name: "William Lee",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 340,
      category: "Electronics & Gadgets",
    },
  ];

  const filteredMerchants = $derived(
    mockMerchants.filter((merchant) => {
      const matchesSearch =
        !searchQuery ||
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        merchant.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = !statusFilter || merchant.status === statusFilter;

      const matchesLocation = true;

      return matchesSearch && matchesStatus && matchesLocation;
    })
  );

  function requireAuth() {
    if (!authStore.isAuthenticated) {
      goto("/onboarding/signin");
      return false;
    }
    return true;
  }

  function handleHire(merchantId: number) {
    if (!requireAuth()) return;
    const merchant = mockMerchants.find((m) => m.id === merchantId);
    if (merchant) {
      selectedMerchant = merchant;
      isModalOpen = true;
    }
  }

  function handleInvite() {
    if (!requireAuth()) return;
    selectedMerchant = mockMerchants[0];
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
    // TODO: implement real API call
  }

  function handlePageChange(page: number) {
    console.log("Page changed to:", page);
    // TODO: real pagination
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
        <FilterDropdown
          label={$_('filterStatus')}
          options={statusOptions}
          bind:value={statusFilter}
        />
      </div>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-10"
      style="row-gap: 41px; column-gap: 36.79px;"
    >
      {#each filteredMerchants as merchant}
        <MerchantCard
          name={merchant.name}
          avatar={merchant.avatar}
          status={merchant.status}
          productsSold={merchant.productsSold}
          category={merchant.category}
          onHire={() => handleHire(merchant.id)}
        />
      {/each}

      <InviteMerchantCard onInvite={handleInvite} />
    </div>

    <Pagination
      currentPage={1}
      totalPages={15}
      rowsPerPage={12}
      totalEntries={180}
      onPageChange={handlePageChange}
    />
  </main>

  <HireMerchantModal
    bind:isOpen={isModalOpen}
    merchant={selectedMerchant}
    onClose={handleCloseModal}
    onSendInvitation={handleSendInvitation}
  />
</div>
