<script lang="ts">
  import {
    Header,
    SearchBar,
    FilterDropdown,
    MerchantCard,
    InviteMerchantCard,
    Pagination,
    HireMerchantModal,
  } from "$lib/components/investor/index.js";
  import { Button } from "$lib/components/ui/button/index.js";

  let searchQuery = $state("");
  let locationFilter = $state("");
  let statusFilter = $state("");
  let isModalOpen = $state(false);
  let selectedMerchant = $state<typeof mockMerchants[0] | undefined>(undefined);

  const locationOptions = [
    { value: "", label: "All Locations" },
    { value: "addis-ababa", label: "Addis Ababa" },
    { value: "dire-dawa", label: "Dire Dawa" },
    { value: "hawassa", label: "Hawassa" },
    { value: "bahir-dar", label: "Bahir Dar" },
    { value: "mekelle", label: "Mekelle" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

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
      name: "Sarah Johnson",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 180,
      category: "Fashion & Apparel",
    },
    {
      id: 3,
      name: "Michael Chen",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 320,
      category: "Home & Kitchen",
    },
    {
      id: 4,
      name: "Emily Davis",
      avatar: "/landingprofile.png",
      status: "pending" as const,
      productsSold: 95,
      category: "Beauty & Personal Care",
    },
    {
      id: 5,
      name: "David Wilson",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 410,
      category: "Sports & Outdoors",
    },
    {
      id: 6,
      name: "Lisa Anderson",
      avatar: "/landingprofile.png",
      status: "active" as const,
      productsSold: 275,
      category: "Books & Media",
    },
    {
      id: 7,
      name: "James Brown",
      avatar: "/landingprofile.png",
      status: "inactive" as const,
      productsSold: 150,
      category: "Toys & Games",
    },
    {
      id: 8,
      name: "Maria Garcia",
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
      name: "Jennifer Martinez",
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

      const matchesStatus =
        !statusFilter || merchant.status === statusFilter;

      const matchesLocation = true;

      return matchesSearch && matchesStatus && matchesLocation;
    })
  );

  function handleHire(merchantId: number) {
    const merchant = mockMerchants.find((m) => m.id === merchantId);
    if (merchant) {
      selectedMerchant = merchant;
      isModalOpen = true;
    }
  }

  function handleInvite() {
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
  <Header />

  <main class="container mx-auto px-5 sm:px-6 lg:px-8 py-8">
    <!-- Title -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-foreground mb-2">
        Find & Work With Trusted Merchants
      </h1>
      <p class="text-muted-foreground">
        Browse registered merchants or invite new ones to manage stock and sales together.
      </p>
    </div>

    <div class="space-y-4 mb-10">
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        <div class="w-full sm:flex-1 sm:max-w-xl">
          <SearchBar
            bind:value={searchQuery}
            placeholder="Search merchants by name, location, or business type"
          />
        </div>

        <Button
          onclick={handleInvite}
          class="bg-info text-info-foreground hover:bg-info/90 h-9 px-6 whitespace-nowrap flex-shrink-0 sm:ml-auto"
        >
          + Invite Merchant
        </Button>
      </div>

      <div class="flex flex-wrap gap-3">
        <FilterDropdown
          label="Location"
          options={locationOptions}
          bind:value={locationFilter}
        />
        <FilterDropdown
          label="Status"
          options={statusOptions}
          bind:value={statusFilter}
        />
      </div>
    </div>

    <div
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10"
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
