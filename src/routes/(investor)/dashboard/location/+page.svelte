<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";

  // Mock location data - replace with real data later
  const locations = [
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
  ];

  function getStatusClass(status: string) {
    switch (status) {
      case "Active":
        return "text-green-600";
      case "Inactive":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  }

  function getStatusDot(status: string) {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "Inactive":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
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
        { value: "", label: "All Locations" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "", label: "All Status" },
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
    console.log("View location:", location);
    // Navigate to location details page when implemented
  }

  function handleEdit(location: (typeof locations)[0]) {
    console.log("Edit location:", location);
    // Open edit modal or navigate to edit page
  }

  function handleDelete(location: (typeof locations)[0]) {
    console.log("Delete location:", location);
    // Show confirmation and delete
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Header with Add Location Button -->
  <div class="flex items-center justify-end">
    <Button class="bg-info text-info-foreground hover:bg-info/90">
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      Add Location
    </Button>
  </div>

  <!-- Table Section -->
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
</div>
