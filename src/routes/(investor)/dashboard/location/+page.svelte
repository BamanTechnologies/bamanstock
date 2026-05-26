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
    {
      name: "Santa Clara Area #1",
      totalStockValue: "$156,900",
      merchants: "785",
      lowStockItems: "35",
      status: "Active",
    },
    ...Array(9).fill({
      name: "Santa Clara Area #1",
      totalStockValue: "$156,900",
      merchants: "785",
      lowStockItems: "35",
      status: "Active",
    }),
  ]);

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
        // This will apply the green background and white text
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
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
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
  const totalPages = $derived(Math.ceil(locations.length / rowsPerPage));

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleView(location: (typeof locations)[0]) {
    // Navigate to location details page
    const locationId = location.name.toLowerCase().replace(/\s+/g, "-");
    goto(`/dashboard/location/${locationId}`);
  }

  function handleEdit(location: (typeof locations)[0]) {
    // Convert location data to modal format
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
      locations.push({
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
      // Remove from local state after successful deletion
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
  <Button
    class="bg-primary-blue text-info-foreground hover:opacity-90"
    onclick={handleAddLocation}
  >
    <Icon iconName="icon/plus" size={16} class="mr-2" />
    Add Location
  </Button>
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
    <DataTable
      {columns}
      data={locations}
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
