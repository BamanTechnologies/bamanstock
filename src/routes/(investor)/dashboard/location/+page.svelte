<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { goto } from "$app/navigation";
  import DeleteLocationModal from "$lib/components/investor/DeleteLocationModal.svelte";
  import AddLocationModal from "$lib/components/investor/AddLocationModal.svelte";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";

  // Mock location data - replace with real data later
  let locations = $state([
    { id: 1,  name: "Santa Clara Area #1",   totalStockValue: "$156,900", merchants: "24", lowStockItems: "8",  status: "Active"   },
    { id: 2,  name: "Downtown Branch #2",    totalStockValue: "$98,450",  merchants: "18", lowStockItems: "3",  status: "Active"   },
    { id: 3,  name: "Eastside Warehouse #3", totalStockValue: "$74,200",  merchants: "15", lowStockItems: "12", status: "Active"   },
    { id: 4,  name: "Northpark Plaza #4",    totalStockValue: "$62,300",  merchants: "11", lowStockItems: "5",  status: "Active"   },
    { id: 5,  name: "Westfield Center #5",   totalStockValue: "$48,760",  merchants: "9",  lowStockItems: "2",  status: "Active"   },
    { id: 6,  name: "Lakeside Hub #6",       totalStockValue: "$38,900",  merchants: "7",  lowStockItems: "0",  status: "Inactive" },
    { id: 7,  name: "Riverside Depot #7",    totalStockValue: "$29,500",  merchants: "6",  lowStockItems: "4",  status: "Active"   },
    { id: 8,  name: "Hilltop Store #8",      totalStockValue: "$24,780",  merchants: "5",  lowStockItems: "1",  status: "Active"   },
    { id: 9,  name: "Harbor Point #9",       totalStockValue: "$21,340",  merchants: "4",  lowStockItems: "0",  status: "Inactive" },
    { id: 10, name: "Midtown Market #10",    totalStockValue: "$19,800",  merchants: "3",  lowStockItems: "6",  status: "Active"   },
  ]);

  let searchQuery = $state("");
  const filteredLocations = $derived(
    searchQuery
      ? locations.filter(l => l.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : locations
  );

  let isDeleteLocationModalOpen = $state(false);
  let locationToDelete = $state<(typeof locations)[0] | null>(null);
  let isAddLocationModalOpen = $state(false);
  let locationToEdit = $state<{
    name: string;
    address: string;
    description: string;
    status: boolean;
  } | null>(null);

  function getStatusClass(status: string) {
    switch (status) {
      case "Active":
        return "bg-success/70 text-success-foreground px-3 py-1 rounded-md font-medium";
      case "Inactive":
        return "bg-muted text-muted-foreground px-3 py-1 rounded-md font-medium";
      default:
        return "bg-muted text-muted-foreground px-3 py-1 rounded-md font-medium";
    }
  }

  function getStatusDot(status: string) {
    switch (status) {
      case "Active":
        return "bg-current";
      case "Inactive":
        return "bg-current";
      default:
        return "bg-current";
    }
  }

  // Table configuration
  const columns = [
    {
      key: "name",
      label: "Location Name",
      sortable: true,
    },
    {
      key: "totalStockValue",
      label: "Total Stock Value",
      sortable: true,
    },
    {
      key: "merchants",
      label: "Merchants",
    },
    {
      key: "lowStockItems",
      label: "Low Stock Items",
      render: (row: (typeof locations)[0]) => {
        return `
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700">
            ${row.lowStockItems}
          </span>
        `;
      },
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: (typeof locations)[0]) => {
        return `
          <span class="inline-flex items-center gap-1.5 ${getStatusClass(row.status)}">
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
        { value: "", label: "Locations" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "Status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ];

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(filteredLocations.length / rowsPerPage));

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleView(location: (typeof locations)[0]) {
    const locationId = location.name.toLowerCase().replace(/\s+/g, "-");
    goto(`/dashboard/location/${locationId}`);
  }

  function handleEdit(location: (typeof locations)[0]) {
    locationToEdit = {
      name: location.name,
      address: "123 Industrial Way, Suite 400, Anytown, ST 12345", // Mock address
      description: "", // Mock description
      status: location.status === "Active",
    };
    isAddLocationModalOpen = true;
  }

  function handleAddLocation() {
    locationToEdit = null; // Clear edit data for new location
    isAddLocationModalOpen = true;
  }

  function handleLocationSubmit(data: {
    name: string;
    address: string;
    description: string;
    status: boolean;
  }) {
    if (locationToEdit) {
      // Edit mode - update existing location
      console.log("Updating location:", data);
      // TODO: Implement API call to update location
      const index = locations.findIndex((l) => l.name === locationToEdit?.name);
      if (index > -1) {
        locations[index] = {
          ...locations[index],
          name: data.name,
          status: data.status ? "Active" : "Inactive",
        };
      }
    } else {
      // Create mode - add new location
      console.log("Creating location:", data);
      // TODO: Implement API call to create location
      const newId = locations.length > 0 ? Math.max(...locations.map(l => l.id)) + 1 : 1;
      locations.push({
        id: newId,
        name: data.name,
        totalStockValue: "$0",
        merchants: "0",
        lowStockItems: "0",
        status: data.status ? "Active" : "Inactive",
      });
    }
    locationToEdit = null;
  }

  function handleDelete(location: (typeof locations)[0]) {
    locationToDelete = location;
    isDeleteLocationModalOpen = true;
  }

  function handleConfirmDelete() {
    if (locationToDelete) {
      console.log("Deleting location:", locationToDelete);
      // TODO: Implement API call to delete location
      const index = locations.findIndex((l) => l === locationToDelete);
      if (index > -1) {
        locations.splice(index, 1);
      }
      locationToDelete = null;
    }
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Header with Add Location Button -->
  <div class="flex items-center justify-end">
    <button
      type="button"
      onclick={handleAddLocation}
      class="inline-flex items-center gap-2 px-4 py-2 bg-info text-info-foreground text-sm font-medium rounded-md hover:bg-info/80 active:scale-95 transition-all duration-150"
    >
      <Icon iconName="icon/plus" size={16} />
      Add Location
    </button>
  </div>

  <!-- Empty State or Table Section -->
  {#if locations.length === 0}
    <EmptyState
      illustration="location"
      title="No Locations Added Yet"
      description="Start by creating your first location. Once added, you can assign stock, invite merchants, and track performance across branches."
      actionLabel="Create Location"
      onAction={handleAddLocation}
    />
  {:else}
    <!-- Search input -->
    <div class="relative w-72">
      <input type="text" placeholder="Search locations..." bind:value={searchQuery}
        class="w-full rounded-full border border-border pl-10 pr-4 py-2 text-sm bg-background" />
      <Icon iconName="icon/search" size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
    </div>

    <DataTable
      {columns}
      data={filteredLocations}
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
          icon: "icon/edit",
          label: "Edit",
          onClick: handleEdit,
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
  {/if}

  <!-- Delete Location Modal -->
  <DeleteLocationModal
    bind:isOpen={isDeleteLocationModalOpen}
    locationName={locationToDelete?.name || ""}
    onConfirm={handleConfirmDelete}
  />

  <!-- Add/Edit Location Modal -->
  <AddLocationModal
    bind:isOpen={isAddLocationModalOpen}
    location={locationToEdit}
    onSubmit={handleLocationSubmit}
  />
</div>
