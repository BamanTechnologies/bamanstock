<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import EmptyState from "$lib/components/investor/EmptyState.svelte";
  import RemoveStockItemModal from "$lib/components/investor/RemoveStockItemModal.svelte";
  import AddProductModal from "$lib/components/investor/AddProductModal.svelte";

  // Mock stock data - replace with real data later
  let stockItems = $state([
    { id: 1,  name: "Lenovo IdeaPad 3",     category: "Electronics", assignedMerchant: "Richard Wilson",  unitPrice: "$3,506",  qty: 100, status: "Adequate", icon: "icon/package" },
    { id: 2,  name: "Beats Pro Headphones", category: "Electronics", assignedMerchant: "Stan Gaunter",    unitPrice: "$7,981",  qty: 8,   status: "Low",      icon: "icon/package" },
    { id: 3,  name: "Nike Jordan Shoes",    category: "Cloth",       assignedMerchant: "Carlos Curran",   unitPrice: "$450",    qty: 0,   status: "Out",      icon: "icon/package" },
    { id: 4,  name: "Apple Watch Series 9", category: "Electronics", assignedMerchant: "Richard Wilson",  unitPrice: "$4,299",  qty: 450, status: "Adequate", icon: "icon/package" },
    { id: 5,  name: "Amazon Echo Dot",      category: "Electronics", assignedMerchant: "Beth Noah",       unitPrice: "$902",    qty: 12,  status: "Low",      icon: "icon/package" },
    { id: 6,  name: "Sanford Sofa",         category: "Furniture",   assignedMerchant: "James Morgan",    unitPrice: "$7,981",  qty: 0,   status: "Out",      icon: "icon/package" },
    { id: 7,  name: "Premium Satchel Bag",  category: "Accessories", assignedMerchant: "Olivia Chen",     unitPrice: "$450",    qty: 700, status: "Adequate", icon: "icon/package" },
    { id: 8,  name: "iPhone 15 Pro",        category: "Electronics", assignedMerchant: "Richard Wilson",  unitPrice: "$5,200",  qty: 9,   status: "Low",      icon: "icon/package" },
    { id: 9,  name: "Gaming Chair Pro",     category: "Furniture",   assignedMerchant: "Marcus Davis",    unitPrice: "$7,981",  qty: 0,   status: "Out",      icon: "icon/package" },
    { id: 10, name: "Borealis Backpack",    category: "Accessories", assignedMerchant: "Sarah Johnson",   unitPrice: "$450",    qty: 550, status: "Low",      icon: "icon/package" },
    { id: 11, name: "Samsung 4K TV 55\"",   category: "Electronics", assignedMerchant: "Stan Gaunter",    unitPrice: "$12,500", qty: 210, status: "Adequate", icon: "icon/package" },
    { id: 12, name: "Levi's Denim Jacket",  category: "Cloth",       assignedMerchant: "Carlos Curran",   unitPrice: "$320",    qty: 0,   status: "Out",      icon: "icon/package" },
    { id: 13, name: "Office Desk Premium",  category: "Furniture",   assignedMerchant: "Daniel Park",     unitPrice: "$3,200",  qty: 85,  status: "Adequate", icon: "icon/package" },
    { id: 14, name: "Fitbit Charge 6",      category: "Electronics", assignedMerchant: "Fatima Hassan",   unitPrice: "$1,800",  qty: 5,   status: "Low",      icon: "icon/package" },
    { id: 15, name: "Leather Wallet",       category: "Accessories", assignedMerchant: "Lucas Ferreira",  unitPrice: "$180",    qty: 320, status: "Adequate", icon: "icon/package" },
    { id: 16, name: "Running Shoes Nike",   category: "Cloth",       assignedMerchant: "Nina Patel",      unitPrice: "$520",    qty: 0,   status: "Out",      icon: "icon/package" },
    { id: 17, name: "iPad Air 5th Gen",     category: "Electronics", assignedMerchant: "Richard Wilson",  unitPrice: "$6,900",  qty: 180, status: "Adequate", icon: "icon/package" },
    { id: 18, name: "Bookshelf 5-Tier",     category: "Furniture",   assignedMerchant: "Kwame Asante",    unitPrice: "$1,200",  qty: 14,  status: "Low",      icon: "icon/package" },
    { id: 19, name: "Adidas Hoodie",        category: "Cloth",       assignedMerchant: "Priya Sharma",    unitPrice: "$280",    qty: 420, status: "Adequate", icon: "icon/package" },
    { id: 20, name: "Sony WH-1000XM5",      category: "Electronics", assignedMerchant: "Thomas Green",    unitPrice: "$3,100",  qty: 7,   status: "Low",      icon: "icon/package" },
  ]);

  let searchQuery = $state("");
  let assignedMerchantFilter = $state("");
  let locationFilter = $state("");
  let categoryFilter = $state("");
  let statusFilter = $state("");

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(filteredStockItems.length / rowsPerPage));

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
      if (assignedMerchantFilter && item.assignedMerchant.toLowerCase().replace(/\s+/g, "-") !== assignedMerchantFilter) return false;
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
        { value: "stan-gaunter", label: "Stan Gaunter" },
        { value: "carlos-curran", label: "Carlos Curran" },
        { value: "beth-noah", label: "Beth Noah" },
        { value: "james-morgan", label: "James Morgan" },
        { value: "others", label: "Others" },
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
      class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
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
  onSearch={handleSearch}
  onFilterChange={handleFilterChange}
  actions={[
    { icon: "icon/edit",  label: "Edit",   onClick: handleEdit },
    { icon: "icon/trash", label: "Delete", onClick: handleDelete, variant: "destructive" },
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
