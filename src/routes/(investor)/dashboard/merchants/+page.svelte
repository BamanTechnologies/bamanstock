<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { goto } from "$app/navigation";
  import InviteMerchantModal from "$lib/components/investor/InviteMerchantModal.svelte";
  import DeleteMerchantModal from "$lib/components/investor/DeleteMerchantModal.svelte";

  // Mock data - replace with real data later
  const summaryCards = [
    {
      label: "Total Merchants",
      value: "148",
      icon: "icon/user",
      color: "bg-green-100",
    },
    {
      label: "Active Merchants",
      value: "36",
      icon: "icon/users",
      color: "bg-blue-100",
    },
    {
      label: "Merchant per Location",
      value: "7",
      icon: "icon/building",
      color: "bg-purple-100",
    },
  ];

  let merchants = $state([
    {
      name: "Richard Wilson",
      revenue: "$156,900",
      transactions: "785",
      location: "Branch #2",
      status: "Invited",
    },
    {
      name: "Richard Wilson",
      revenue: "$156,900",
      transactions: "785",
      location: "Branch #2",
      status: "Active",
    },
    {
      name: "Richard Wilson",
      revenue: "$156,900",
      transactions: "785",
      location: "Branch #2",
      status: "Declined",
    },
    ...Array(7).fill({
      name: "Richard Wilson",
      revenue: "$156,900",
      transactions: "785",
      location: "Branch #2",
      status: "Active",
    }),
  ]);

  function getStatusClass(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Invited":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "Declined":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }

  function getStatusDot(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Invited":
        return "bg-gray-500";
      case "Declined":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  // Table configuration
  const columns = [
    {
      key: "name",
      label: "Merchant",
      sortable: true,
      render: (row: (typeof merchants)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-sm text-foreground">${row.name}</span>
          </div>
        `;
      },
    },
    { key: "revenue", label: "Revenue", sortable: true },
    { key: "transactions", label: "Transactions" },
    { key: "location", label: "Location" },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: (typeof merchants)[0]) => {
        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-medium border ${getStatusClass(row.status)}">
            <span class="w-1.5 h-1.5 rounded-full ${getStatusDot(row.status)}"></span>
            ${row.status}
          </span>
        `;
      },
    },
  ];

  const filters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All Locations" },
        { value: "branch-1", label: "Branch #1" },
        { value: "branch-2", label: "Branch #2" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "active", label: "Active" },
        { value: "invited", label: "Invited" },
        { value: "declined", label: "Declined" },
      ],
    },
  ];

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(merchants.length / rowsPerPage));
  let isInviteModalOpen = $state(false);
  let isDeleteModalOpen = $state(false);
  let merchantToDelete = $state<(typeof merchants)[0] | null>(null);

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleView(merchant: (typeof merchants)[0]) {
    // Navigate to merchant details page
    const merchantId = merchant.name.toLowerCase().replace(/\s+/g, "-");
    goto(`/dashboard/merchants/${merchantId}`);
  }

  function handleDelete(merchant: (typeof merchants)[0]) {
    merchantToDelete = merchant;
    isDeleteModalOpen = true;
  }

  function handleConfirmDelete() {
    if (merchantToDelete) {
      console.log("Deleting merchant:", merchantToDelete);
      // TODO: Implement API call to delete merchant
      // Remove from local state after successful deletion
      const index = merchants.findIndex((m) => m === merchantToDelete);
      if (index > -1) {
        merchants.splice(index, 1);
      }
      merchantToDelete = null;
    }
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Action Buttons - PDF and Invite Merchant -->
  <div class="flex items-center justify-end gap-4">
    <Icon
      iconName="icon/file-text"
      size={20}
      class="text-red-500 cursor-pointer"
    />
    <Button
      class="bg-info text-info-foreground hover:bg-info/90"
      onclick={() => (isInviteModalOpen = true)}
    >
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      Invite Merchant
    </Button>
  </div>

  <!-- Summary Cards -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    {#each summaryCards as card}
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-3xl font-bold text-foreground mb-1">{card.value}</p>
            <p class="text-sm text-muted-foreground">{card.label}</p>
          </div>
          <div
            class="{card.color} w-12 h-12 rounded-lg flex items-center justify-center"
          >
            <Icon
              iconName={card.icon as any}
              size={24}
              class="text-foreground"
            />
          </div>
        </div>
      </div>
    {/each}
  </div>

  <!-- Table Section -->
  <DataTable
    {columns}
    data={merchants}
    searchable={true}
    searchPlaceholder="Search"
    {filters}
    actions={[
      {
        icon: "icon/eye",
        label: "View",
        onClick: handleView,
      },
      {
        icon: "icon/trash",
        label: "Delete",
        onClick: handleDelete,
        variant: "destructive",
      },
    ]}
    pagination={{
      currentPage,
      totalPages,
      rowsPerPage,
      onPageChange: handlePageChange,
      onRowsPerPageChange: handleRowsPerPageChange,
    }}
  />

  <!-- Invite Merchant Modal -->
  <InviteMerchantModal
    bind:isOpen={isInviteModalOpen}
    onSendInvitation={(data) => {
      console.log("Sending invitation:", data);
      // TODO: Implement API call to send invitation
    }}
  />

  <!-- Delete Merchant Modal -->
  <DeleteMerchantModal
    bind:isOpen={isDeleteModalOpen}
    merchantName={merchantToDelete?.name || ""}
    onConfirm={handleConfirmDelete}
  />
</div>
