<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import RemoveStockItemModal from "$lib/components/investor/RemoveStockItemModal.svelte";
  import AddProductModal from "$lib/components/investor/AddProductModal.svelte";

  // Mock stock data - replace with real data later
  let stockItems = $state([
    {
      id: 1,
      name: "Lenovo IdeaPad 3",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$3,506",
      qty: 100,
      status: "Adequate",
      icon: "icon/laptop",
    },
    {
      id: 2,
      name: "Beats Pro",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$7,981",
      qty: 140,
      status: "Low",
      icon: "icon/headphones",
    },
    {
      id: 3,
      name: "Nike Jordan",
      category: "Cloth",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$450",
      qty: 300,
      status: "Out",
      icon: "icon/shoe",
    },
    {
      id: 4,
      name: "Apple Series 5 Watch",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$3,506",
      qty: 450,
      status: "Adequate",
      icon: "icon/watch",
    },
    {
      id: 5,
      name: "Amazon Echo Dot",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$902",
      qty: 320,
      status: "Low",
      icon: "icon/package",
    },
    {
      id: 6,
      name: "Sanford Chair Sofa",
      category: "Furniture",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$7,981",
      qty: 650,
      status: "Out",
      icon: "icon/chair",
    },
    {
      id: 7,
      name: "Red Premium Satchel",
      category: "Accessories",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$450",
      qty: 700,
      status: "Adequate",
      icon: "icon/briefcase",
    },
    {
      id: 8,
      name: "Iphone 14 Pro",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$3,506",
      qty: 630,
      status: "Low",
      icon: "icon/package",
    },
    {
      id: 9,
      name: "Gaming Chair",
      category: "Furniture",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$7,981",
      qty: 410,
      status: "Out",
      icon: "icon/chair",
    },
    {
      id: 10,
      name: "Borealis Backpack",
      category: "Accessories",
      assignedMerchant: "Richard Wilson",
      unitPrice: "$450",
      qty: 550,
      status: "Low",
      icon: "icon/briefcase",
    },
  ]);

  let searchQuery = $state("");
  let assignedMerchantFilter = $state("");
  let locationFilter = $state("");
  let categoryFilter = $state("");
  let statusFilter = $state("");

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(stockItems.length / rowsPerPage));

  let isRemoveStockModalOpen = $state(false);
  let stockItemToRemove = $state<(typeof stockItems)[0] | undefined>(undefined);
  let isAddProductModalOpen = $state(false);

  function getStatusClass(status: string) {
    switch (status) {
      case "Adequate":
        return "text-green-600";
      case "Low":
        return "text-yellow-600";
      case "Out":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  }

  function getStatusDot(status: string) {
    switch (status) {
      case "Adequate":
        return "bg-green-500";
      case "Low":
        return "bg-yellow-500";
      case "Out":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  }

  // Filtered stock items
  const filteredStockItems = $derived(
    stockItems.filter((item) => {
      if (
        searchQuery &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      if (
        assignedMerchantFilter &&
        item.assignedMerchant !== "Richard Wilson"
      ) {
        return false;
      }
      if (categoryFilter && item.category.toLowerCase() !== categoryFilter) {
        return false;
      }
      if (statusFilter && item.status.toLowerCase() !== statusFilter) {
        return false;
      }
      return true;
    })
  );

  const paginatedItems = $derived(
    filteredStockItems.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    )
  );

  // Table configuration
  const columns = [
    {
      key: "name",
      label: "Stock Item",
      sortable: true,
      render: (row: (typeof stockItems)[0]) => {
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
      key: "assignedMerchant",
      label: "Assigned Merchant",
      sortable: true,
      render: (row: (typeof stockItems)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-sm text-foreground">${row.assignedMerchant}</span>
          </div>
        `;
      },
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
      render: (row: (typeof stockItems)[0]) => {
        return `
          <span class="inline-flex items-center gap-1.5 ${getStatusClass(row.status)}">
            <span class="w-1.5 h-1.5 rounded-full ${getStatusDot(row.status)}"></span>
            <span class="text-sm">${row.status}</span>
          </span>
        `;
      },
    },
  ];

  const filters = [
    {
      key: "assignedMerchant",
      label: "Assigned Merchant",
      options: [
        { value: "", label: "All Merchants" },
        { value: "richard-wilson", label: "Richard Wilson" },
        { value: "other", label: "Other" },
      ],
    },
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

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleEdit(item: (typeof stockItems)[0]) {
    // TODO: Open edit modal
    console.log("Edit stock item:", item);
  }

  function handleTransfer(item: (typeof stockItems)[0]) {
    // TODO: Open transfer modal
    console.log("Transfer stock item:", item);
  }

  function handleDelete(item: (typeof stockItems)[0]) {
    stockItemToRemove = item;
    isRemoveStockModalOpen = true;
  }

  function handleConfirmDelete() {
    if (stockItemToRemove) {
      const itemToRemove = stockItemToRemove;
      stockItems = stockItems.filter((item) => item.id !== itemToRemove.id);
      stockItemToRemove = undefined;
    }
  }

  function handleAddStock() {
    isAddProductModalOpen = true;
  }

  function handleCreateProduct(data: {
    productName: string;
    category: string;
    quantity: string;
    unitPrice: string;
    locations: string[];
    description: string;
    image?: File;
  }) {
    console.log("Creating product:", data);
    // TODO: Implement API call to create product
    // Add to stockItems array
    const newStockItem = {
      id: stockItems.length + 1,
      name: data.productName,
      category: data.category,
      assignedMerchant: "Unassigned", // Default
      unitPrice: data.unitPrice,
      qty: Number(data.quantity),
      status: "Adequate", // Default
      icon: "icon/package", // Default icon
    };
    stockItems = [...stockItems, newStockItem];
  }

  function handleSearch(query: string) {
    searchQuery = query;
    currentPage = 1;
  }

  function handleFilterChange(key: string, value: string) {
    if (key === "assignedMerchant") assignedMerchantFilter = value;
    if (key === "location") locationFilter = value;
    if (key === "category") categoryFilter = value;
    if (key === "status") statusFilter = value;
    currentPage = 1;
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Header with Add Stock Button -->
  <div class="flex items-center justify-end">
    <Button
      class="bg-info text-info-foreground hover:bg-info/90"
      onclick={handleAddStock}
    >
      <Icon iconName="icon/plus" size={16} class="mr-2" />
      Add Stock
    </Button>
  </div>

  {#if stockItems.length === 0}
    <EmptyState
      illustration="stock-page"
      title="No Stock Assigned Yet"
      description="This location doesn't have any products assigned. Once stock is added, you'll be able to track quantities, categories, and performance."
      actionLabel="Assign Stock"
      onAction={handleAddStock}
    />
  {:else}
    <DataTable
      {columns}
      data={paginatedItems}
      searchable={true}
      searchPlaceholder="Search by stock name..."
      {filters}
      actions={[
        {
          icon: "icon/edit",
          label: "Edit",
          onClick: handleEdit,
        },
        {
          icon: "icon/refresh-cw",
          label: "Transfer",
          onClick: handleTransfer,
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
      onSearch={handleSearch}
      onFilterChange={handleFilterChange}
    />
  {/if}

  <!-- Remove Stock Item Modal -->
  <RemoveStockItemModal
    bind:isOpen={isRemoveStockModalOpen}
    stockItemName={stockItemToRemove?.name || ""}
    onConfirm={handleConfirmDelete}
  />

  <!-- Add Product Modal -->
  <AddProductModal
    bind:isOpen={isAddProductModalOpen}
    onCreate={handleCreateProduct}
  />
</div>
