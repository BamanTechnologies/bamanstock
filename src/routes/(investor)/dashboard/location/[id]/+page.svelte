<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import DeleteLocationModal from "$lib/components/investor/DeleteLocationModal.svelte";
  import AddLocationModal from "$lib/components/investor/AddLocationModal.svelte";
  import AssignStockToLocationModal from "$lib/components/investor/AssignStockToLocationModal.svelte";
  import TransferStockModal from "$lib/components/investor/TransferStockModal.svelte";
  import RemoveStockItemModal from "$lib/components/investor/RemoveStockItemModal.svelte";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  // Get location ID from route params
  const locationId = $derived($page.params.id);

  // Mock location data - replace with API call later
  const location = {
    id: locationId,
    name: "Santa Clara Area #1",
    address: "123 Industrial Way, Suite 400, Anytown, ST 12345",
    status: "Active",
  };

  // KPI Cards data
  const kpiCards = [
    {
      label: "Total Revenue",
      value: "$48,988.78",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart",
      iconColor: "bg-green-100",
    },
    {
      label: "Total Stock Value",
      value: "$8,458.798",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/trending-up",
      iconColor: "bg-blue-100",
    },
    {
      label: "Active Merchants",
      value: "12",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/building",
      iconColor: "bg-purple-100",
    },
    {
      label: "Low Stock Items",
      value: "5",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/box",
      iconColor: "bg-orange-100",
    },
  ];

  // Low stock items
  const lowStockItems = [
    {
      id: 1,
      name: "H-PRO-X1",
      quantity: 8,
      threshold: 10,
    },
    {
      id: 2,
      name: "H-PRO-X1",
      quantity: 8,
      threshold: 10,
    },
    {
      id: 3,
      name: "H-PRO-X1",
      quantity: 8,
      threshold: 10,
    },
    {
      id: 4,
      name: "H-PRO-X1",
      quantity: 8,
      threshold: 10,
    },
  ];

  let activeTab = $state("Overview");
  let isDeleteLocationModalOpen = $state(false);
  let isEditLocationModalOpen = $state(false);
  let isAssignStockToLocationModalOpen = $state(false);
  let isTransferStockModalOpen = $state(false);
  let isRemoveStockItemModalOpen = $state(false);
  let stockItemToRemove = $state<(typeof locationStockItems)[0] | undefined>(
    undefined,
  );

  const tabs = ["Overview", "Stock", "Merchants", "Report"];

  // Mock stock items for location
  let locationStockItems = $state([
    {
      id: 1,
      name: "Lenovo IdeaPad 3",
      category: "Electronics",
      unitPrice: "$3,506",
      qty: 100,
      status: "Adequate",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
      icon: "icon/laptop",
    },
    {
      id: 2,
      name: "Beats Pro",
      category: "Electronics",
      unitPrice: "$7,981",
      qty: 140,
      status: "Low",
      statusColor: "text-yellow-600",
      statusDot: "bg-yellow-500",
      icon: "icon/headphones",
    },
    {
      id: 3,
      name: "Nike Jordan",
      category: "Cloth",
      unitPrice: "$450",
      qty: 300,
      status: "Out",
      statusColor: "text-red-600",
      statusDot: "bg-red-500",
      icon: "icon/shoe",
    },
    {
      id: 4,
      name: "Apple Series 5 Watch",
      category: "Electronics",
      unitPrice: "$902",
      qty: 450,
      status: "Adequate",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
      icon: "icon/watch",
    },
    {
      id: 5,
      name: "Amazon Echo Dot",
      category: "Electronics",
      unitPrice: "$3,506",
      qty: 320,
      status: "Low",
      statusColor: "text-yellow-600",
      statusDot: "bg-yellow-500",
      icon: "icon/package",
    },
    {
      id: 6,
      name: "Sanford Chair Sofa",
      category: "Furniture",
      unitPrice: "$7,981",
      qty: 650,
      status: "Out",
      statusColor: "text-red-600",
      statusDot: "bg-red-500",
      icon: "icon/chair",
    },
    {
      id: 7,
      name: "Red Premium Satchel",
      category: "Accessories",
      unitPrice: "$450",
      qty: 700,
      status: "Adequate",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
      icon: "icon/briefcase",
    },
    {
      id: 8,
      name: "Iphone 14 Pro",
      category: "Electronics",
      unitPrice: "$3,506",
      qty: 630,
      status: "Low",
      statusColor: "text-yellow-600",
      statusDot: "bg-yellow-500",
      icon: "icon/package",
    },
    {
      id: 9,
      name: "Gaming Chair",
      category: "Furniture",
      unitPrice: "$7,981",
      qty: 410,
      status: "Out",
      statusColor: "text-red-600",
      statusDot: "bg-red-500",
      icon: "icon/chair",
    },
    {
      id: 10,
      name: "Borealis Backpack",
      category: "Accessories",
      unitPrice: "$450",
      qty: 550,
      status: "Low",
      statusColor: "text-yellow-600",
      statusDot: "bg-yellow-500",
      icon: "icon/briefcase",
    },
  ]);

  let currentStockPage = $state(1);
  let rowsPerStockPage = $state(10);
  const totalStockPages = $derived(
    Math.ceil(locationStockItems.length / rowsPerStockPage),
  );

  // Stock table columns
  const stockColumns = [
    {
      key: "name",
      label: "Stock Item",
      sortable: true,
      render: (row: (typeof locationStockItems)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
              <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.name}</span>
          </div>
        `;
      },
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      sortable: true,
    },
    {
      key: "qty",
      label: "Qty",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: (typeof locationStockItems)[0]) => {
        return `
          <span class="inline-flex items-center gap-1.5 ${row.statusColor}">
            <span class="w-1.5 h-1.5 rounded-full ${row.statusDot}"></span>
            <span class="text-sm">${row.status}</span>
          </span>
        `;
      },
    },
  ];

  const stockFilters = [
    {
      key: "category",
      label: "Category",
      options: [
        { value: "", label: "All Categories" },
        { value: "electronics", label: "Electronics" },
        { value: "cloth", label: "Cloth" },
        { value: "furniture", label: "Furniture" },
        { value: "accessories", label: "Accessories" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
        { value: "adequate", label: "Adequate" },
        { value: "low", label: "Low" },
        { value: "out", label: "Out" },
      ],
    },
  ];

  function handleStockPageChange(page: number) {
    currentStockPage = page;
  }

  function handleStockRowsPerPageChange(rows: number) {
    rowsPerStockPage = rows;
    currentStockPage = 1;
  }

  function handleStockEdit(item: (typeof locationStockItems)[0]) {
    // TODO: Open edit modal
    console.log("Edit stock item:", item);
  }

  function handleStockTransfer(item: (typeof locationStockItems)[0]) {
    // TODO: Open transfer modal
    console.log("Transfer stock item:", item);
  }

  function handleStockDelete(item: (typeof locationStockItems)[0]) {
    stockItemToRemove = item;
    isRemoveStockItemModalOpen = true;
  }

  // Mock merchants for location
  const locationMerchants = [
    {
      id: 1,
      name: "Richard Wilson",
      revenue: "$156,900",
      lastActivity: "2025-12-07",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    ...Array(9).fill({
      id: 2,
      name: "Richard Wilson",
      revenue: "$156,900",
      lastActivity: "2025-12-07",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    }),
  ];

  let currentMerchantsPage = $state(1);
  let rowsPerMerchantsPage = $state(10);
  const totalMerchantsPages = $derived(
    Math.ceil(locationMerchants.length / rowsPerMerchantsPage),
  );

  // Merchants table columns
  const merchantColumns = [
    {
      key: "name",
      label: "Merchant",
      sortable: true,
      render: (row: (typeof locationMerchants)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.name}</span>
          </div>
        `;
      },
    },
    {
      key: "revenue",
      label: "Revenue",
      sortable: true,
    },
    {
      key: "lastActivity",
      label: "Last Activity",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: (typeof locationStockItems)[0]) => {
        return `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-white font-medium bg-[#00C98B]">
        <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
        <span class="text-xs">${row.status}</span>
      </span>
    `;
      },
    },
  ];

  const merchantFilters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All Locations" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
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
        { value: "inactive", label: "Inactive" },
        { value: "invited", label: "Invited" },
      ],
    },
  ];

  function handleMerchantPageChange(page: number) {
    currentMerchantsPage = page;
  }

  function handleMerchantRowsPerPageChange(rows: number) {
    rowsPerMerchantsPage = rows;
    currentMerchantsPage = 1;
  }

  function handleMerchantEdit(item: (typeof locationMerchants)[0]) {
    // TODO: Open edit modal
    console.log("Edit merchant:", item);
  }

  function handleMerchantRefresh(item: (typeof locationMerchants)[0]) {
    // TODO: Refresh merchant data
    console.log("Refresh merchant:", item);
  }

  function handleMerchantView(item: (typeof locationMerchants)[0]) {
    const merchantId = item.name.toLowerCase().replace(/\s+/g, "-");
    goto(`/dashboard/merchants/${merchantId}`);
  }

  // Mock reports for location
  const locationReports = [
    {
      id: 1,
      merchant: "Stan Gaunter",
      date: "24 Dec 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 2,
      merchant: "Stan Gaunter",
      date: "17 Dec 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 3,
      merchant: "Stan Gaunter",
      date: "10 Dec 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 4,
      merchant: "Stan Gaunter",
      date: "03 Dec 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 5,
      merchant: "Stan Gaunter",
      date: "26 Nov 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 6,
      merchant: "Stan Gaunter",
      date: "19 Nov 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 7,
      merchant: "Stan Gaunter",
      date: "12 Nov 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
    {
      id: 8,
      merchant: "Stan Gaunter",
      date: "03 Oct 2024",
      period: "Q2 2025",
      status: "Active",
      statusColor: "text-green-600",
      statusDot: "bg-green-500",
    },
  ];

  let currentReportsPage = $state(1);
  const rowsPerReportsPage = 10;
  const totalReportsPages = $derived(
    Math.ceil(locationReports.length / rowsPerReportsPage),
  );

  function handleBack() {
    goto("/dashboard/location");
  }

  function handleOrder(item: (typeof lowStockItems)[0]) {
    console.log("Order item:", item);
    // TODO: Implement order functionality
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Location</span>
  </button>

  <!-- Location Profile Card -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-semibold text-foreground mb-2">
          {location.name}
        </h2>
        <div class="flex items-center gap-2 mb-2">
          <p class="text-sm text-muted-foreground">{location.address}</p>
          <span
            class="inline-flex items-center gap-1.5 text-xs font-medium text-green-600"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {location.status}
          </span>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="border-[#4DA0E6] text-[#4DA0E6] hover:bg-[#4DA0E6]/10"
          onclick={() => (isDeleteLocationModalOpen = true)}
        >
          Close Location
        </Button>

        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#4DA0E6]/90"
          onclick={() => (isEditLocationModalOpen = true)}
        >
          Edit Location
        </Button>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      {#each tabs as tab}
        <button
          onclick={() => (activeTab = tab)}
          class="pb-4 px-1 border-b-2 transition-colors {activeTab === tab
            ? 'border-info text-info font-medium'
            : 'border-transparent text-muted-foreground hover:text-foreground'}"
        >
          {tab}
        </button>
      {/each}
    </div>
  </div>

  <!-- Tab Content -->
  {#if activeTab === "Overview"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each kpiCards as kpi}
          <div class="bg-card border border-border rounded-lg p-6">
            <div class="flex items-center justify-between mb-4">
              <span class="text-sm text-muted-foreground">{kpi.label}</span>
              <div
                class="{kpi.iconColor} w-10 h-10 rounded-lg flex items-center justify-center"
              >
                <Icon
                  iconName={kpi.icon as any}
                  size={20}
                  class="text-foreground"
                />
              </div>
            </div>
            <p class="text-2xl font-bold text-foreground mb-1">{kpi.value}</p>
            <p
              class="text-sm {kpi.changeType === 'positive'
                ? 'text-green-600'
                : 'text-red-600'}"
            >
              {kpi.change}
            </p>
          </div>
        {/each}
      </div>

      <!-- Charts Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Revenue Over Time Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <div>
              <h3 class="text-lg font-semibold text-foreground mb-1">
                Revenue Over Time
              </h3>
              <p class="text-2xl font-bold text-foreground">$690,237.90</p>
              <p class="text-sm text-green-600">Last 12 Months +15.2%</p>
            </div>
            <div class="flex gap-2">
              {#each ["1D", "1W", "1M", "3M", "6M", "1Y"] as period}
                <button
                  class="px-3 py-1 text-xs rounded transition-colors {period ===
                  '1Y'
                    ? 'bg-info text-info-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
                >
                  {period}
                </button>
              {/each}
            </div>
          </div>
          <!-- Chart placeholder - replace with actual chart component -->
          <div
            class="h-64 bg-muted/30 rounded flex items-center justify-center"
          >
            <p class="text-muted-foreground">Chart will be rendered here</p>
          </div>
        </div>

        <!-- Stock Distribution Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">
              Stock Distribution
            </h3>
            <Dropdown
              options={[
                { value: "weekly", label: "Weekly" },
                { value: "monthly", label: "Monthly" },
                { value: "yearly", label: "Yearly" },
              ]}
              value="weekly"
              class="min-w-[120px]"
            />
          </div>
          <!-- Chart placeholder - replace with actual donut chart component -->
          <div class="flex items-center justify-center gap-8">
            <div
              class="w-48 h-48 bg-muted/30 rounded-full flex items-center justify-center"
            >
              <p class="text-muted-foreground text-sm">Donut Chart</p>
            </div>
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded bg-blue-500"></div>
                <div>
                  <p class="text-sm font-medium text-foreground">Electronics</p>
                  <p class="text-xs text-muted-foreground">698 Sales</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded bg-orange-500"></div>
                <div>
                  <p class="text-sm font-medium text-foreground">Clothing</p>
                  <p class="text-xs text-muted-foreground">545 Sales</p>
                </div>
              </div>
              <div class="flex items-center gap-3">
                <div class="w-4 h-4 rounded bg-green-500"></div>
                <div>
                  <p class="text-sm font-medium text-foreground">Furniture</p>
                  <p class="text-xs text-muted-foreground">456 Sales</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Low Stock Alert Section -->
      <div class="bg-card border border-border rounded-lg p-6">
        <h3 class="text-lg font-semibold text-foreground mb-6">
          Low Stock Alert
        </h3>
        <div class="space-y-4">
          {#each lowStockItems as item}
            <div
              class="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div>
                <p class="text-sm font-medium text-foreground mb-1">
                  {item.name}
                </p>
                <p class="text-xs text-muted-foreground">
                  Qty: {item.quantity} / Threshold: {item.threshold}
                </p>
              </div>
              <Button
                variant="outline"
                class="border-info text-info hover:bg-info/10"
                onclick={() => handleOrder(item)}
              >
                Order
              </Button>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if activeTab === "Stock"}
    <div class="space-y-6">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-lg border border-border"
      >
        <div class="flex flex-1 flex-wrap items-center gap-3">
          <div class="relative min-w-[240px]">
            <Icon
              iconName="icon/search"
              size={18}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by stock name..."
              class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-info/50"
            />
          </div>

          <Dropdown
            options={stockFilters.find((f) => f.key === "category")?.options ||
              []}
            placeholder="Category"
            class="min-w-[140px]"
          />

          <Dropdown
            options={stockFilters.find((f) => f.key === "status")?.options ||
              []}
            placeholder="Status"
            class="min-w-[140px]"
          />
        </div>

        <div class="flex items-center gap-3">
          <Button
            variant="outline"
            class="bg-[#4DA0E6] text-white hover:bg-[#4DA0E6]/90"
            onclick={() => (isTransferStockModalOpen = true)}
          >
            <Icon iconName="icon/refresh-cw" size={16} class="mr-2" />
            Transfer Stock
          </Button>
          <Button
            class="bg-[#4DA0E6] text-white hover:bg-[#4DA0E6]/90"
            onclick={() => (isAssignStockToLocationModalOpen = true)}
          >
            <Icon iconName="icon/plus" size={16} class="mr-2" />
            Assign Stock
          </Button>
        </div>
      </div>

      {#if locationStockItems.length === 0}
        <EmptyState
          illustration="stock"
          title="No Stock Added Yet"
          description="Start by assigning stock to this location."
          actionLabel="Assign Stock"
          onAction={() => (isAssignStockToLocationModalOpen = true)}
        />
      {:else}
        {@const paginatedStockItems = locationStockItems.slice(
          (currentStockPage - 1) * rowsPerStockPage,
          currentStockPage * rowsPerStockPage,
        )}
        <DataTable
          columns={stockColumns}
          data={paginatedStockItems}
          searchable={false}
          filters={[]}
          actions={[
            { icon: "icon/edit", label: "Edit", onClick: handleStockEdit },
            {
              icon: "icon/refresh-cw",
              label: "Transfer",
              onClick: handleStockTransfer,
            },
            {
              icon: "icon/trash",
              label: "Delete",
              onClick: handleStockDelete,
              variant: "destructive",
            },
          ]}
          pagination={{
            currentPage: currentStockPage,
            totalPages: totalStockPages,
            rowsPerPage: rowsPerStockPage,
            onPageChange: handleStockPageChange,
            onRowsPerPageChange: handleStockRowsPerPageChange,
          }}
        />
      {/if}
    </div>
  {:else if activeTab === "Merchants"}
    <div class="space-y-6">
      <!-- Header with Invite Merchant Button -->
      <div class="flex items-center justify-end">
        <Button class="bg-info text-info-foreground hover:bg-info/90">
          <Icon iconName="icon/plus" size={16} class="mr-2" />
          Invite Merchant
        </Button>
      </div>

      <!-- Merchants Table or Empty State -->
      {#if locationMerchants.length === 0}
        <EmptyState
          illustration="merchants"
          title="No Merchants Added Yet"
          description="Start by inviting merchants to this location. Once added, you can assign stock, track performance, and manage merchant activities."
          actionLabel="Invite Merchant"
          onAction={() => {
            // TODO: Open invite merchant modal
            console.log("Invite merchant");
          }}
        />
      {:else}
        {@const paginatedMerchants = locationMerchants.slice(
          (currentMerchantsPage - 1) * rowsPerMerchantsPage,
          currentMerchantsPage * rowsPerMerchantsPage,
        )}
        <DataTable
          columns={merchantColumns}
          data={paginatedMerchants}
          searchable={true}
          searchPlaceholder="Search"
          filters={merchantFilters}
          actions={[
            {
              icon: "icon/edit",
              label: "Edit",
              onClick: handleMerchantEdit,
            },
            {
              icon: "icon/refresh-cw",
              label: "Refresh",
              onClick: handleMerchantRefresh,
            },
            {
              icon: "icon/eye",
              label: "View",
              onClick: handleMerchantView,
            },
          ]}
          pagination={{
            currentPage: currentMerchantsPage,
            totalPages: totalMerchantsPages,
            rowsPerPage: rowsPerMerchantsPage,
            onPageChange: handleMerchantPageChange,
            onRowsPerPageChange: handleMerchantRowsPerPageChange,
          }}
        />
      {/if}
    </div>
  {:else if activeTab === "Report"}
    <div class="space-y-6">
      <!-- Search and Filters -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={20}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search"
                class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
              />
            </div>
          </div>
          <div class="flex gap-3">
            <Dropdown
              options={[
                { value: "last-7-days", label: "Last 7 days" },
                { value: "last-30-days", label: "Last 30 days" },
                { value: "last-90-days", label: "Last 90 days" },
                { value: "custom", label: "Custom Range" },
              ]}
              value="last-7-days"
              placeholder="Select period"
            />
            <Dropdown
              options={[
                { value: "", label: "All Merchants" },
                { value: "stan-gaunter", label: "Stan Gaunter" },
                { value: "richard-wilson", label: "Richard Wilson" },
              ]}
              placeholder="All Merchants"
            />
            <Dropdown
              options={[
                { value: "", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "pending", label: "Pending" },
              ]}
              placeholder="All Status"
            />
          </div>
        </div>

        <!-- Reports Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Merchant
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    Date
                    <Icon
                      iconName="icon/chevron-up"
                      size={14}
                      class="text-muted-foreground"
                    />
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Period
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Status
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              {#each locationReports as report}
                <tr class="hover:bg-muted/30">
                  <td class="px-4 py-4">
                    <span class="text-sm font-medium text-foreground"
                      >{report.merchant}</span
                    >
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm text-foreground">{report.date}</span>
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm text-muted-foreground"
                      >{report.period}</span
                    >
                  </td>
                  <td class="px-4 py-4">
                    <span
                      class="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-white font-medium bg-[#00C98B]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-white"></span>
                      <span class="text-xs">{report.status}</span>
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="p-2 hover:bg-muted rounded transition-colors"
                        aria-label="View"
                      >
                        <Icon
                          iconName="icon/eye"
                          size={16}
                          class="text-muted-foreground"
                        />
                      </button>
                      <button
                        type="button"
                        class="p-2 hover:bg-muted rounded transition-colors"
                        aria-label="Download"
                      >
                        <Icon
                          iconName="icon/download"
                          size={16}
                          class="text-muted-foreground"
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="flex items-center justify-between mt-6 pt-4 border-t border-border"
        >
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Row Per Page</span>
            <Dropdown
              options={[
                { value: "10", label: "10" },
                { value: "20", label: "20" },
                { value: "50", label: "50" },
              ]}
              value="10"
              onchange={(value) => {
                // TODO: Handle rows per page change
                console.log("Rows per page changed:", value);
              }}
              class="min-w-[80px]"
            />
            <span class="text-sm text-muted-foreground">Entries</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentReportsPage === 1}
              onclick={() => currentReportsPage > 1 && currentReportsPage--}
            >
              <Icon iconName="icon/chevron-left" size={16} />
            </button>
            {#each Array(Math.min(5, totalReportsPages)) as _, i}
              {@const pageNum = i + 1}
              <button
                type="button"
                class="px-3 py-1 text-sm rounded transition-colors {currentReportsPage ===
                pageNum
                  ? 'bg-info text-info-foreground'
                  : 'hover:bg-muted'}"
                onclick={() => (currentReportsPage = pageNum)}
              >
                {pageNum}
              </button>
            {/each}
            {#if totalReportsPages > 5}
              <span class="text-sm text-muted-foreground">...</span>
              <button
                type="button"
                class="px-3 py-1 text-sm rounded hover:bg-muted transition-colors"
                onclick={() => (currentReportsPage = totalReportsPages)}
              >
                {totalReportsPages}
              </button>
            {/if}
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentReportsPage === totalReportsPages}
              onclick={() =>
                currentReportsPage < totalReportsPages && currentReportsPage++}
            >
              <Icon iconName="icon/chevron-right" size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Location Modal -->
  <DeleteLocationModal
    bind:isOpen={isDeleteLocationModalOpen}
    locationName={location.name}
    onConfirm={() => {
      console.log("Removing location:", location.name);
      // TODO: Implement API call to remove location
      // Navigate back to locations list after successful deletion
      goto("/dashboard/location");
    }}
  />

  <!-- Edit Location Modal -->
  <AddLocationModal
    bind:isOpen={isEditLocationModalOpen}
    location={{
      name: location.name,
      address: location.address,
      description: "", // Add description field to location data if needed
      status: location.status === "Active",
    }}
    onSubmit={(data) => {
      console.log("Updating location:", data);
      // TODO: Implement API call to update location
      location.name = data.name;
      location.address = data.address;
      location.status = data.status ? "Active" : "Inactive";
    }}
  />

  <!-- Assign Stock to Location Modal -->
  <AssignStockToLocationModal
    bind:isOpen={isAssignStockToLocationModalOpen}
    targetLocation={location.name}
    onAssign={(data) => {
      console.log("Assigning stock to location:", data);
      // TODO: Implement API call to assign stock to location
    }}
  />

  <!-- Transfer Stock Modal -->
  <TransferStockModal
    bind:isOpen={isTransferStockModalOpen}
    sourceLocation={location.name}
    onTransfer={(data) => {
      console.log("Transferring stock:", data);
      // TODO: Implement API call to transfer stock between locations
    }}
  />

  <!-- Remove Stock Item Modal -->
  <RemoveStockItemModal
    bind:isOpen={isRemoveStockItemModalOpen}
    stockItemName={stockItemToRemove?.name}
    onConfirm={() => {
      if (stockItemToRemove) {
        console.log("Removing stock item:", stockItemToRemove);
        // TODO: Implement API call to remove stock item
        locationStockItems = locationStockItems.filter(
          (item) => item.id !== stockItemToRemove?.id,
        );
        stockItemToRemove = undefined;
      }
    }}
  />
</div>
