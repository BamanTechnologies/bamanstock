<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { goto } from "$app/navigation";
  import InviteMerchantModal from "$lib/components/investor/InviteMerchantModal.svelte";

  let isInviteModalOpen = $state(false);

  // Mock data - replace with real data later
  const summaryCards = [
    {
      label: "Total Merchants",
      value: "20",
      icon: "icon/user",
      color: "bg-green-100 dark:bg-green-900/40",
    },
    {
      label: "Active Merchants",
      value: "13",
      icon: "icon/users",
      color: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      label: "Merchant per Location",
      value: "4",
      icon: "icon/building",
      color: "bg-purple-100 dark:bg-purple-900/40",
    },
  ];

  const merchants = [
    { name: "Richard Wilson",   revenue: "$156,900", transactions: "785", location: "Branch #1", status: "Active" },
    { name: "Stan Gaunter",     revenue: "$98,450",  transactions: "521", location: "Branch #2", status: "Active" },
    { name: "Carlos Curran",    revenue: "$74,200",  transactions: "390", location: "Branch #3", status: "Invited" },
    { name: "Beth Noah",        revenue: "$62,300",  transactions: "318", location: "Branch #1", status: "Active" },
    { name: "Yohannes Abayneh", revenue: "$48,760",  transactions: "241", location: "Branch #4", status: "Active" },
    { name: "Emma Collins",     revenue: "$38,900",  transactions: "198", location: "Branch #2", status: "Invited" },
    { name: "James Morgan",     revenue: "$29,500",  transactions: "154", location: "Branch #5", status: "Active" },
    { name: "Olivia Chen",      revenue: "$24,780",  transactions: "132", location: "Branch #3", status: "Declined" },
    { name: "Marcus Davis",     revenue: "$21,340",  transactions: "110", location: "Branch #1", status: "Active" },
    { name: "Sarah Johnson",    revenue: "$19,800",  transactions: "97",  location: "Branch #2", status: "Active" },
    { name: "Daniel Park",      revenue: "$17,200",  transactions: "88",  location: "Branch #4", status: "Invited" },
    { name: "Fatima Hassan",    revenue: "$15,600",  transactions: "79",  location: "Branch #5", status: "Active" },
    { name: "Lucas Ferreira",   revenue: "$13,900",  transactions: "71",  location: "Branch #3", status: "Active" },
    { name: "Nina Patel",       revenue: "$12,400",  transactions: "64",  location: "Branch #1", status: "Declined" },
    { name: "Kwame Asante",     revenue: "$10,890",  transactions: "58",  location: "Branch #2", status: "Active" },
    { name: "Priya Sharma",     revenue: "$9,750",   transactions: "51",  location: "Branch #4", status: "Invited" },
    { name: "Thomas Green",     revenue: "$8,620",   transactions: "45",  location: "Branch #5", status: "Active" },
    { name: "Amara Obi",        revenue: "$7,480",   transactions: "39",  location: "Branch #3", status: "Active" },
    { name: "Lena Müller",      revenue: "$6,340",   transactions: "33",  location: "Branch #1", status: "Declined" },
    { name: "Ravi Kumar",       revenue: "$5,200",   transactions: "27",  location: "Branch #2", status: "Active" },
  ];

  function getStatusClass(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700";
      case "Invited":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
      case "Declined":
        return "bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
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
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusClass(row.status)}">
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
        { value: "Branch #1", label: "Branch #1" },
        { value: "Branch #2", label: "Branch #2" },
        { value: "Branch #3", label: "Branch #3" },
        { value: "Branch #4", label: "Branch #4" },
        { value: "Branch #5", label: "Branch #5" },
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
    console.log("Delete merchant:", merchant);
    // Show confirmation and delete
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
    <Button class="bg-[var(--primary-blue)] text-white hover:opacity-90" onclick={() => (isInviteModalOpen = true)}>
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
    onRowClick={handleView}
    actions={[
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
</div>

<InviteMerchantModal bind:isOpen={isInviteModalOpen} />
