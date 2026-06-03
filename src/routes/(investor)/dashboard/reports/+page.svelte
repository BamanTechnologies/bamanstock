<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { DataTable } from "$lib/components/ui/data-table/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import IconKpiCard from "$lib/components/investor/reports/IconKpiCard.svelte";
  import StatKpiCard from "$lib/components/investor/reports/StatKpiCard.svelte";
  import ReportFilterBar from "$lib/components/investor/reports/ReportFilterBar.svelte";

  const tabs = ["Sales", "Revenue & Profit", "Payments", "Stock Movement", "Low Stock"];

  let activeTab = $state($page.url.searchParams.get("tab") ?? "Sales");
  $effect(() => {
    const tab = $page.url.searchParams.get("tab");
    if (tab !== null) activeTab = tab;
  });

  function switchTab(tab: string) {
    activeTab = tab;
    goto(`?tab=${encodeURIComponent(tab)}`, { replaceState: true, noScroll: true });
  }

  // Revenue & Profit tab data
  const revenueKpiCards = [
    {
      label: "Total Revenue",
      value: "$40,565,000",
      change: "25.5",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
    {
      label: "Growth Profit",
      value: "$795,902.50",
      change: "12.2",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
    {
      label: "Growth Margin %",
      value: "4558",
      change: "16.3",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
  ];

  let chartTimeframe = $state("1Y");
  const timeframeOptions = ["1D", "1W", "1M", "3M", "6M", "1Y"];

  const revenueByCategory = [
    {
      category: "Electronics",
      items: "500+ items",
      revenue: "$48,901.35 Revenue",
    },
    {
      category: "Clothing",
      items: "500+ items",
      revenue: "$109,820.50 Revenue",
    },
    {
      category: "Home Supplies",
      items: "190+ items",
      revenue: "$548,900.12 Revenue",
    },
    {
      category: "Beauty",
      items: "350+ items",
      revenue: "$36,700.50 Revenue",
    },
    {
      category: "Groceries",
      items: "1200+ items",
      revenue: "$8965 Revenue",
    },
  ];

  let revenueDateRange = $state("01-Jan-2025 - 12-Dec-2025");

  // Payments tab data
  const paymentsKpiCards = [
    { label: "Total Amount", value: "$4,56,000", icon: "icon/bar-chart"      as any, iconBgClass: "bg-green-50  dark:bg-green-900/40",  iconColor: "#16a34a", borderColor: "border-green-500"  },
    { label: "Total Paid",   value: "$2,56,42",  icon: "icon/credit-card"    as any, iconBgClass: "bg-blue-50   dark:bg-blue-900/40",   iconColor: "#3b82f6", borderColor: "border-blue-500"   },
    { label: "Total Unpaid", value: "$1,52,45",  icon: "icon/dollar-sign"    as any, iconBgClass: "bg-orange-50 dark:bg-orange-900/40", iconColor: "#f97316", borderColor: "border-orange-500" },
    { label: "Overdue",      value: "$2,56,12",  icon: "icon/alert-triangle" as any, iconBgClass: "bg-red-50    dark:bg-red-900/40",    iconColor: "#ef4444", borderColor: "border-red-500"    },
  ];

  // Mock payments report data
  let paymentsReportData = $state([
    {
      id: "INV001",
      merchant: "Carl Evans",
      dueDate: "24 Dec 2024",
      amount: "$500",
      paid: "$500",
      amountDue: "$500",
      status: "Paid",
    },
    {
      id: "INV002",
      merchant: "Minerva Rameriz",
      dueDate: "10 Dec 2024",
      amount: "$1500",
      paid: "$1500",
      amountDue: "$1500",
      status: "Paid",
    },
    {
      id: "INV003",
      merchant: "Robert Lamon",
      dueDate: "27 Nov 2024",
      amount: "$600",
      paid: "$600",
      amountDue: "$600",
      status: "Paid",
    },
    {
      id: "INV004",
      merchant: "Patricia Lewis",
      dueDate: "18 Nov 2024",
      amount: "$1000",
      paid: "$1000",
      amountDue: "$1000",
      status: "Paid",
    },
    {
      id: "INV005",
      merchant: "Mark Joslyn",
      dueDate: "06 Nov 2024",
      amount: "$1200",
      paid: "$1200",
      amountDue: "$1200",
      status: "Paid",
    },
    {
      id: "INV006",
      merchant: "Marsha Betts",
      dueDate: "25 Oct 2024",
      amount: "$800",
      paid: "$800",
      amountDue: "$800",
      status: "Paid",
    },
    {
      id: "INV007",
      merchant: "Daniel Jude",
      dueDate: "14 Oct 2024",
      amount: "$2000",
      paid: "$2000",
      amountDue: "$2000",
      status: "Paid",
    },
    {
      id: "INV008",
      merchant: "Emma Bates",
      dueDate: "03 Oct 2024",
      amount: "$100",
      paid: "$100",
      amountDue: "$100",
      status: "Paid",
    },
    {
      id: "INV009",
      merchant: "Richard Fralick",
      dueDate: "20 Sep 2024",
      amount: "$300",
      paid: "$300",
      amountDue: "$300",
      status: "Paid",
    },
    {
      id: "INV010",
      merchant: "Michelle Robison",
      dueDate: "10 Sep 2024",
      amount: "$5000",
      paid: "$0",
      amountDue: "$5000",
      status: "Unpaid",
    },
    {
      id: "INV011",
      merchant: "John Smith",
      dueDate: "05 Jan 2025",
      amount: "$750",
      paid: "$750",
      amountDue: "$750",
      status: "Paid",
    },
    {
      id: "INV012",
      merchant: "Sarah Johnson",
      dueDate: "15 Jan 2025",
      amount: "$1200",
      paid: "$0",
      amountDue: "$1200",
      status: "Unpaid",
    },
  ]);

  let paymentsDateRange = $state("01-Jan-2025 - 12-Dec-2025");
  let paymentsPage = $state(1);
  let paymentsRowsPerPage = $state(10);
  const paymentsTotalPages = $derived(
    Math.ceil(paymentsReportData.length / paymentsRowsPerPage),
  );

  // Payments table columns
  const paymentsColumns = [
    {
      key: "id",
      label: "Invoice ID",
      sortable: true,
    },
    {
      key: "merchant",
      label: "Merchant",
      sortable: true,
      render: (row: (typeof paymentsReportData)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.merchant}</span>
          </div>
        `;
      },
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
    },
    {
      key: "paid",
      label: "Paid",
      sortable: true,
    },
    {
      key: "amountDue",
      label: "Amount Due",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: (typeof paymentsReportData)[0]) => {
        const isPaid = row.status === "Paid";
        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
            isPaid ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
          }">
            <span class="w-1.5 h-1.5 rounded-full ${
              isPaid ? "bg-green-600" : "bg-red-600"
            }"></span>
            ${row.status}
          </span>
        `;
      },
    },
  ];

  const paymentsFilters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All" },
        { value: "branch-1", label: "Branch #1" },
        { value: "branch-2", label: "Branch #2" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
      ],
    },
    {
      key: "products",
      label: "Products",
      options: [
        { value: "", label: "All" },
        { value: "electronics", label: "Electronics" },
        { value: "computers", label: "Computers" },
        { value: "shoe", label: "Shoe" },
        { value: "furniture", label: "Furniture" },
        { value: "accessories", label: "Accessories" },
      ],
    },
  ];

  function handlePaymentsPageChange(page: number) {
    paymentsPage = page;
  }

  function handlePaymentsRowsPerPageChange(rows: number) {
    paymentsRowsPerPage = rows;
    paymentsPage = 1;
  }

  // Stock Movement tab data
  const stockMovementKpiCards = [
    {
      label: "Total Stock In",
      value: "1340 Units",
      change: "25.5",
      changeType: "positive",
      changeLabel: "From Last Month",
      icon: "icon/package",
      iconColor: "bg-green-100 dark:bg-green-900/40",
      textColor: "text-green-600 dark:text-green-400",
      borderColor: "border-l-green-500",
    },
    {
      label: "Total Stock Out",
      value: "895 Units",
      change: "12.2",
      changeType: "positive",
      changeLabel: "From Last Month",
      icon: "icon/shopping-bag",
      iconColor: "bg-blue-100 dark:bg-blue-900/40",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-l-blue-500",
    },
    {
      label: "Number of Transfers",
      value: "87",
      change: "16.3",
      changeType: "positive",
      changeLabel: "From Last Month",
      icon: "icon/refresh-cw",
      iconColor: "bg-pink-100 dark:bg-pink-900/40",
      textColor: "text-pink-600 dark:text-pink-400",
      borderColor: "border-l-pink-500",
    },
  ];

  // Mock stock movement data
  let stockMovementData = $state([
    {
      id: 1,
      fromWarehouse: "Lavish Warehouse",
      toWarehouse: "North Zone Warehouse",
      numberOfProducts: "20",
      quantityTransferred: "15",
      referenceNumber: "#458924",
      date: "24 Dec 2024",
    },
    {
      id: 2,
      fromWarehouse: "Quaint Warehouse",
      toWarehouse: "Nova Storage Hub",
      numberOfProducts: "25",
      quantityTransferred: "20",
      referenceNumber: "#429054",
      date: "10 Dec 2024",
    },
    {
      id: 3,
      fromWarehouse: "Central Distribution",
      toWarehouse: "East Side Depot",
      numberOfProducts: "18",
      quantityTransferred: "12",
      referenceNumber: "#512389",
      date: "05 Dec 2024",
    },
    {
      id: 4,
      fromWarehouse: "Main Storage",
      toWarehouse: "West End Warehouse",
      numberOfProducts: "30",
      quantityTransferred: "25",
      referenceNumber: "#487621",
      date: "28 Nov 2024",
    },
    {
      id: 5,
      fromWarehouse: "Primary Hub",
      toWarehouse: "Secondary Facility",
      numberOfProducts: "15",
      quantityTransferred: "10",
      referenceNumber: "#523147",
      date: "20 Nov 2024",
    },
    {
      id: 6,
      fromWarehouse: "Distribution Center",
      toWarehouse: "Regional Warehouse",
      numberOfProducts: "22",
      quantityTransferred: "18",
      referenceNumber: "#498765",
      date: "15 Nov 2024",
    },
    {
      id: 7,
      fromWarehouse: "Storage Facility A",
      toWarehouse: "Storage Facility B",
      numberOfProducts: "28",
      quantityTransferred: "22",
      referenceNumber: "#456789",
      date: "10 Nov 2024",
    },
    {
      id: 8,
      fromWarehouse: "Warehouse Alpha",
      toWarehouse: "Warehouse Beta",
      numberOfProducts: "35",
      quantityTransferred: "30",
      referenceNumber: "#432156",
      date: "05 Nov 2024",
    },
    {
      id: 9,
      fromWarehouse: "Supply Chain Hub",
      toWarehouse: "Retail Distribution",
      numberOfProducts: "40",
      quantityTransferred: "35",
      referenceNumber: "#419876",
      date: "01 Nov 2024",
    },
    {
      id: 10,
      fromWarehouse: "Fulfillment Hub",
      toWarehouse: "EdgeWare Solutions",
      numberOfProducts: "45",
      quantityTransferred: "35",
      referenceNumber: "#139064",
      date: "10 Sep 2024",
    },
    {
      id: 11,
      fromWarehouse: "Logistics Center",
      toWarehouse: "Express Warehouse",
      numberOfProducts: "32",
      quantityTransferred: "28",
      referenceNumber: "#145678",
      date: "25 Sep 2024",
    },
    {
      id: 12,
      fromWarehouse: "Main Depot",
      toWarehouse: "Satellite Storage",
      numberOfProducts: "27",
      quantityTransferred: "20",
      referenceNumber: "#152345",
      date: "15 Sep 2024",
    },
  ]);

  let stockMovementDateRange = $state("01-Jan-2025 - 12-Dec-2025");
  let stockMovementSearchQuery = $state("");
  let stockMovementPage = $state(1);
  let stockMovementRowsPerPage = $state(10);
  const stockMovementTotalPages = $derived(
    Math.ceil(stockMovementData.length / stockMovementRowsPerPage),
  );

  // Stock Movement table columns
  const stockMovementColumns = [
    {
      key: "fromWarehouse",
      label: "From Warehouse",
      sortable: true,
    },
    {
      key: "toWarehouse",
      label: "To Warehouse",
      sortable: true,
    },
    {
      key: "numberOfProducts",
      label: "No of Products",
      sortable: true,
    },
    {
      key: "quantityTransferred",
      label: "Quantity Transferred",
      sortable: true,
    },
    {
      key: "referenceNumber",
      label: "Reference Number",
      sortable: true,
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
    },
  ];

  const stockMovementFilters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All" },
        { value: "branch-1", label: "Branch #1" },
        { value: "branch-2", label: "Branch #2" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
      ],
    },
    {
      key: "products",
      label: "Products",
      options: [
        { value: "", label: "All" },
        { value: "electronics", label: "Electronics" },
        { value: "computers", label: "Computers" },
        { value: "shoe", label: "Shoe" },
        { value: "furniture", label: "Furniture" },
        { value: "accessories", label: "Accessories" },
      ],
    },
  ];

  function handleStockMovementPageChange(page: number) {
    stockMovementPage = page;
  }

  function handleStockMovementRowsPerPageChange(rows: number) {
    stockMovementRowsPerPage = rows;
    stockMovementPage = 1;
  }

  function handleEditStockMovement(row: (typeof stockMovementData)[0]) {
    console.log("Edit stock movement:", row);
    // TODO: Open edit modal
  }

  function handleDeleteStockMovement(row: (typeof stockMovementData)[0]) {
    console.log("Delete stock movement:", row);
    // TODO: Open delete confirmation modal
  }

  // Low Stock tab data
  const lowStockKpiCards = [
    { label: "Total Low Stock Items", value: "142",        valueColor: "text-foreground", change: "25.5", changeLabel: "From Last Month", icon: "icon/alert-triangle" as any, iconColor: "bg-green-100 dark:bg-green-900/40", textColor: "text-green-600 dark:text-green-400", borderColor: "border-l-green-500" },
    { label: "Critical Stock Items",  value: "35",         valueColor: "text-red-500",    change: "12.2", changeLabel: "From Last Month", icon: "icon/shopping-bag"   as any, iconColor: "bg-blue-100 dark:bg-blue-900/40",  textColor: "text-blue-600 dark:text-blue-400",  borderColor: "border-l-blue-500"  },
    { label: "Value at Risk",         value: "$12,890.75", valueColor: "text-foreground", change: "16.3", changeLabel: "From Last Month", icon: "icon/eye"            as any, iconColor: "bg-pink-100 dark:bg-pink-900/40",  textColor: "text-pink-600 dark:text-pink-400",  borderColor: "border-l-pink-500"  },
  ];

  // Mock low stock data
  let lowStockData = $state([
    {
      id: 1,
      sku: "PT001",
      location: "Lavish Warehouse",
      productName: "Lenovo IdeaPad 3",
      category: "Computers",
      qty: 20,
      qtyAlert: 15,
      icon: "icon/laptop",
    },
    {
      id: 2,
      sku: "PT002",
      location: "Quaint Warehouse",
      productName: "Beats Pro",
      category: "Electronics",
      qty: 25,
      qtyAlert: 20,
      icon: "icon/headphones",
    },
    {
      id: 3,
      sku: "PT003",
      location: "Traditional Warehouse",
      productName: "Nike Jordan",
      category: "Shoe",
      qty: 40,
      qtyAlert: 35,
      icon: "icon/shoe",
    },
    {
      id: 4,
      sku: "PT004",
      location: "Modern Storage",
      productName: "Apple Series 5 Watch",
      category: "Electronics",
      qty: 30,
      qtyAlert: 25,
      icon: "icon/watch",
    },
    {
      id: 5,
      sku: "PT005",
      location: "Central Depot",
      productName: "Amazon Echo Dot",
      category: "Electronics",
      qty: 35,
      qtyAlert: 30,
      icon: "icon/package",
    },
    {
      id: 6,
      sku: "PT006",
      location: "Main Warehouse",
      productName: "Sanford Chair Sofa",
      category: "Furniture",
      qty: 28,
      qtyAlert: 25,
      icon: "icon/chair",
    },
    {
      id: 7,
      sku: "PT007",
      location: "Distribution Center",
      productName: "Red Premium Satchel",
      category: "Bags",
      qty: 22,
      qtyAlert: 20,
      icon: "icon/briefcase",
    },
    {
      id: 8,
      sku: "PT008",
      location: "Storage Facility",
      productName: "Iphone 14 Pro",
      category: "Phone",
      qty: 18,
      qtyAlert: 15,
      icon: "icon/package",
    },
    {
      id: 9,
      sku: "PT009",
      location: "Regional Hub",
      productName: "Gaming Chair",
      category: "Furniture",
      qty: 32,
      qtyAlert: 30,
      icon: "icon/chair",
    },
    {
      id: 10,
      sku: "PT010",
      location: "Supply Chain",
      productName: "Borealis Backpack",
      category: "Bags",
      qty: 26,
      qtyAlert: 25,
      icon: "icon/briefcase",
    },
    {
      id: 11,
      sku: "PT011",
      location: "Logistics Center",
      productName: "Samsung Galaxy S24",
      category: "Phone",
      qty: 24,
      qtyAlert: 20,
      icon: "icon/package",
    },
    {
      id: 12,
      sku: "PT012",
      location: "Express Warehouse",
      productName: "MacBook Pro",
      category: "Computers",
      qty: 19,
      qtyAlert: 15,
      icon: "icon/laptop",
    },
  ]);

  let lowStockDateRange = $state("01-Jan-2025 - 12-Dec-2025");
  let lowStockSearchQuery = $state("");
  let lowStockLocationFilter = $state("");
  let lowStockCategoryFilter = $state("");

  const lowStockCategoryOptions = [
    { value: "", label: "All" },
    { value: "computers", label: "Computers" },
    { value: "electronics", label: "Electronics" },
    { value: "shoe", label: "Shoe" },
    { value: "furniture", label: "Furniture" },
    { value: "bags", label: "Bags" },
    { value: "phone", label: "Phone" },
  ];
  let lowStockPage = $state(1);
  let lowStockRowsPerPage = $state(10);

  const lowStockLocationOptions = $derived([
    { value: "", label: "All" },
    ...[...new Set(lowStockData.map((r) => r.location))].map((loc) => ({ value: loc, label: loc })),
  ]);

  const filteredLowStockData = $derived(
    lowStockData.filter((row) => {
      const matchesLocation = !lowStockLocationFilter || row.location === lowStockLocationFilter;
      const matchesCategory = !lowStockCategoryFilter || row.category.toLowerCase() === lowStockCategoryFilter;
      const matchesSearch =
        !lowStockSearchQuery ||
        row.productName.toLowerCase().includes(lowStockSearchQuery.toLowerCase()) ||
        row.sku.toLowerCase().includes(lowStockSearchQuery.toLowerCase());
      return matchesLocation && matchesCategory && matchesSearch;
    }),
  );

  const lowStockTotalPages = $derived(
    Math.ceil(filteredLowStockData.length / lowStockRowsPerPage),
  );

  $effect(() => {
    lowStockLocationFilter;
    lowStockCategoryFilter;
    lowStockSearchQuery;
    lowStockPage = 1;
  });

  // Low Stock table columns
  const lowStockColumns = [
    {
      key: "sku",
      label: "SKU",
      sortable: true,
    },
    {
      key: "location",
      label: "Location",
    },
    {
      key: "productName",
      label: "Product Name",
      sortable: true,
      render: (row: (typeof lowStockData)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.productName}</span>
          </div>
        `;
      },
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "qty",
      label: "Qty",
      sortable: true,
    },
    {
      key: "qtyAlert",
      label: "Qty Alert",
      sortable: true,
    },
  ];

  const lowStockFilters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All" },
        { value: "branch-1", label: "Branch #1" },
        { value: "branch-2", label: "Branch #2" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
      ],
    },
    {
      key: "products",
      label: "Products",
      options: [
        { value: "", label: "All" },
        { value: "electronics", label: "Electronics" },
        { value: "computers", label: "Computers" },
        { value: "shoe", label: "Shoe" },
        { value: "furniture", label: "Furniture" },
        { value: "accessories", label: "Accessories" },
      ],
    },
  ];

  function handleLowStockPageChange(page: number) {
    lowStockPage = page;
  }

  function handleLowStockRowsPerPageChange(rows: number) {
    lowStockRowsPerPage = rows;
    lowStockPage = 1;
  }

  function handleEditLowStock(row: (typeof lowStockData)[0]) {
    console.log("Edit low stock item:", row);
    // TODO: Open edit modal
  }

  function handleDeleteLowStock(row: (typeof lowStockData)[0]) {
    console.log("Delete low stock item:", row);
    // TODO: Open delete confirmation modal
  }

  // Revenue Breakdown table data
  let revenueBreakdownData = $state([
    {
      id: 1,
      category: "Electronics",
      totalRevenue: "$3000",
      percentOfTotal: "12%",
      numberOfProducts: 100,
      highestSellingProduct: "Lenovo IdeaPad 3",
      icon: "icon/laptop",
    },
    {
      id: 2,
      category: "Clothing",
      totalRevenue: "$1600",
      percentOfTotal: "12%",
      numberOfProducts: 140,
      highestSellingProduct: "Nike Jordan",
      icon: "icon/shoe",
    },
    {
      id: 3,
      category: "Home Supplies",
      totalRevenue: "$880",
      percentOfTotal: "12%",
      numberOfProducts: 300,
      highestSellingProduct: "Sanford Chair Sofa",
      icon: "icon/chair",
    },
    {
      id: 4,
      category: "Beauty",
      totalRevenue: "$1200",
      percentOfTotal: "12%",
      numberOfProducts: 450,
      highestSellingProduct: "Red Premium Satchel",
      icon: "icon/briefcase",
    },
    {
      id: 5,
      category: "Furniture",
      totalRevenue: "$400",
      percentOfTotal: "12%",
      numberOfProducts: 320,
      highestSellingProduct: "Sanford Chair Sofa",
      icon: "icon/chair",
    },
    ...Array(5).fill({
      id: 6,
      category: "Electronics",
      totalRevenue: "$3000",
      percentOfTotal: "12%",
      numberOfProducts: 100,
      highestSellingProduct: "Lenovo IdeaPad 3",
      icon: "icon/laptop",
    }),
  ]);

  let revenueBreakdownPage = $state(1);
  let revenueBreakdownRowsPerPage = $state(10);
  const revenueBreakdownTotalPages = $derived(
    Math.ceil(revenueBreakdownData.length / revenueBreakdownRowsPerPage),
  );

  // Revenue Breakdown table columns
  const revenueBreakdownColumns = [
    {
      key: "category",
      label: "Category",
      sortable: true,
    },
    {
      key: "totalRevenue",
      label: "Total Revenue",
      sortable: true,
    },
    {
      key: "percentOfTotal",
      label: "% of Total",
      sortable: true,
    },
    {
      key: "numberOfProducts",
      label: "Number of Products",
      sortable: true,
    },
    {
      key: "highestSellingProduct",
      label: "Highest-Selling Product",
      sortable: true,
      render: (row: (typeof revenueBreakdownData)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.highestSellingProduct}</span>
          </div>
        `;
      },
    },
  ];

  function handleRevenueBreakdownPageChange(page: number) {
    revenueBreakdownPage = page;
  }

  function handleRevenueBreakdownRowsPerPageChange(rows: number) {
    revenueBreakdownRowsPerPage = rows;
    revenueBreakdownPage = 1;
  }

  // KPI Cards for Sales tab
  const salesKpiCards = [
    {
      label: "Total Sales",
      value: "$40,565,000",
      change: "25.5",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
    {
      label: "Total Orders",
      value: "8690",
      change: "12.2",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
    {
      label: "Total Transaction",
      value: "4558",
      change: "16.3",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
    {
      label: "Units Sold",
      value: "865",
      change: "12.2",
      changeType: "positive",
      changeLabel: "From Last Month",
    },
  ];

  // Mock sales report data
  let salesReportData = $state([
    {
      id: 1,
      productName: "Lenovo IdeaPad 3",
      category: "Computers",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$3000",
      soldQty: "05",
      instockQty: 100,
      icon: "icon/laptop",
    },
    {
      id: 2,
      productName: "Beats Pro",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$1600",
      soldQty: "10",
      instockQty: 140,
      icon: "icon/headphones",
    },
    {
      id: 3,
      productName: "Nike Jordan",
      category: "Shoe",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$880",
      soldQty: "08",
      instockQty: 300,
      icon: "icon/shoe",
    },
    {
      id: 4,
      productName: "Apple Series 5 Watch",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$2500",
      soldQty: "12",
      instockQty: 450,
      icon: "icon/watch",
    },
    {
      id: 5,
      productName: "Amazon Echo Dot",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$1200",
      soldQty: "15",
      instockQty: 320,
      icon: "icon/package",
    },
    {
      id: 6,
      productName: "Sanford Chair Sofa",
      category: "Furniture",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$3500",
      soldQty: "03",
      instockQty: 650,
      icon: "icon/chair",
    },
    {
      id: 7,
      productName: "Red Premium Satchel",
      category: "Accessories",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$450",
      soldQty: "20",
      instockQty: 700,
      icon: "icon/briefcase",
    },
    {
      id: 8,
      productName: "Iphone 14 Pro",
      category: "Electronics",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$4500",
      soldQty: "08",
      instockQty: 630,
      icon: "icon/package",
    },
    {
      id: 9,
      productName: "Gaming Chair",
      category: "Furniture",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$2800",
      soldQty: "05",
      instockQty: 410,
      icon: "icon/chair",
    },
    {
      id: 10,
      productName: "Borealis Backpack",
      category: "Accessories",
      assignedMerchant: "Richard Wilson",
      location: "Branch #2",
      salesValue: "$320",
      soldQty: "18",
      instockQty: 550,
      icon: "icon/briefcase",
    },
  ]);

  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(salesReportData.length / rowsPerPage));

  // Table columns
  const salesColumns = [
    {
      key: "productName",
      label: "Product Name",
      sortable: true,
      render: (row: (typeof salesReportData)[0]) => {
        return `
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <svg class="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <span class="text-sm font-medium text-foreground">${row.productName}</span>
          </div>
        `;
      },
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "assignedMerchant",
      label: "Assigned Merchant",
      sortable: true,
      render: (row: (typeof salesReportData)[0]) => {
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
      key: "location",
      label: "Location",
    },
    {
      key: "salesValue",
      label: "Sales Value",
      sortable: true,
    },
    {
      key: "soldQty",
      label: "Sold Qty",
      sortable: true,
    },
    {
      key: "instockQty",
      label: "Instock Qty",
      sortable: true,
    },
  ];

  const filters = [
    {
      key: "location",
      label: "Location",
      options: [
        { value: "", label: "All" },
        { value: "branch-1", label: "Branch #1" },
        { value: "branch-2", label: "Branch #2" },
        { value: "santa-clara", label: "Santa Clara Area #1" },
      ],
    },
    {
      key: "merchant",
      label: "Merchant",
      options: [
        { value: "", label: "All" },
        { value: "richard-wilson", label: "Richard Wilson" },
        { value: "other", label: "Other" },
      ],
    },
    {
      key: "category",
      label: "Category",
      options: [
        { value: "", label: "All" },
        { value: "electronics", label: "Electronics" },
        { value: "computers", label: "Computers" },
        { value: "shoe", label: "Shoe" },
        { value: "furniture", label: "Furniture" },
        { value: "accessories", label: "Accessories" },
      ],
    },
    {
      key: "products",
      label: "Products",
      options: [
        { value: "", label: "All" },
        { value: "lenovo", label: "Lenovo IdeaPad 3" },
        { value: "beats", label: "Beats Pro" },
        { value: "nike", label: "Nike Jordan" },
      ],
    },
  ];

  let dateRange = $state("Jan 2025 - Jun 2025");

  function handlePageChange(page: number) {
    currentPage = page;
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    currentPage = 1;
  }

  function handleExportPDF() {
    // TODO: Implement PDF export
    console.log("Exporting to PDF");
  }

  function handleExportXLS() {
    // TODO: Implement XLS export
    console.log("Exporting to XLS");
  }

  function handlePrint() {
    // TODO: Implement print
    window.print();
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Tabs -->
  <div class="border-b border-border">
    <div class="flex gap-6">
      {#each tabs as tab}
        <button
          onclick={() => switchTab(tab)}
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
    {#if activeTab === "Sales"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each salesKpiCards as kpi}
          <StatKpiCard label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} />
        {/each}
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="date-range"
        bind:dateRange
        filters={[
          { id: "location-filter", label: "Location", options: filters[0].options },
          { id: "merchant-filter", label: "Merchant", options: filters[1].options },
          { id: "category-filter", label: "Category", options: filters[2].options },
          { id: "products-filter", label: "Products", options: filters[3].options },
        ]}
      />

      <!-- Sales Report Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">Sales Report</h3>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to PDF"
              onclick={handleExportPDF}
            >
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to XLS"
              onclick={handleExportXLS}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-green-500"
              />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Print"
              onclick={handlePrint}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-muted-foreground"
              />
            </button>
          </div>
        </div>

        {#if true}
          {@const paginatedData = salesReportData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage,
          )}
          <DataTable
            columns={salesColumns}
            data={paginatedData}
            searchable={false}
            filters={[]}
            pagination={{
              currentPage,
              totalPages,
              rowsPerPage,
              onPageChange: handlePageChange,
              onRowsPerPageChange: handleRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
  {#if activeTab === "Revenue & Profit"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each revenueKpiCards as kpi}
          <StatKpiCard label={kpi.label} value={kpi.value} change={kpi.change} changeLabel={kpi.changeLabel} />
        {/each}
      </div>

      <!-- Chart and Revenue by Category Section -->
      <div class="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">
        <!-- Revenue vs Profit Over Time Chart -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">
              Revenue vs Profit Over Time
            </h3>
            <!-- Timeframe Selector -->
            <div class="flex gap-2">
              {#each timeframeOptions as timeframe}
                <button
                  type="button"
                  onclick={() => (chartTimeframe = timeframe)}
                  class="px-3 py-1.5 text-sm rounded transition-colors {chartTimeframe ===
                  timeframe
                    ? 'bg-info text-info-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'}"
                >
                  {timeframe}
                </button>
              {/each}
            </div>
          </div>

          <!-- Chart Legend -->
          <div class="flex items-center gap-4 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-blue-500"></div>
              <span class="text-sm text-foreground">Revenue</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="w-3 h-3 rounded-full bg-pink-500"></div>
              <span class="text-sm text-foreground">Profit</span>
            </div>
          </div>

          <!-- Revenue vs Profit SVG Chart -->
          <div class="flex gap-3">
            <!-- Y-axis labels -->
            <div class="flex flex-col justify-between text-[10px] text-muted-foreground pb-5 w-10 shrink-0 text-right">
              <span>$60k</span>
              <span>$50k</span>
              <span>$40k</span>
              <span>$30k</span>
              <span>$20k</span>
              <span>$10k</span>
            </div>
            <div class="flex-1 relative h-64">
              <svg viewBox="0 0 860 200" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revGradReport" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#3b82f6" stop-opacity="0.2" />
                    <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.01" />
                  </linearGradient>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stop-color="#ec4899" stop-opacity="0.2" />
                    <stop offset="100%" stop-color="#ec4899" stop-opacity="0.01" />
                  </linearGradient>
                </defs>
                <!-- Grid lines -->
                {#each [0, 40, 80, 120, 160, 200] as y}
                  <line x1="0" y1={y} x2="860" y2={y} stroke="currentColor" stroke-opacity="0.07" stroke-width="1" />
                {/each}
                <!-- Revenue area + line -->
                <path d="M0,160 C60,145 120,125 200,130 C280,135 340,100 430,65 C510,32 580,110 660,100 C730,92 800,108 860,112 L860,200 L0,200 Z" fill="url(#revGradReport)" />
                <path d="M0,160 C60,145 120,125 200,130 C280,135 340,100 430,65 C510,32 580,110 660,100 C730,92 800,108 860,112" fill="none" stroke="#3b82f6" stroke-width="2.5" />
                <!-- Profit area + line -->
                <path d="M0,180 C60,172 120,165 200,162 C280,158 340,148 430,138 C510,128 580,145 660,140 C730,136 800,142 860,144 L860,200 L0,200 Z" fill="url(#profitGrad)" />
                <path d="M0,180 C60,172 120,165 200,162 C280,158 340,148 430,138 C510,128 580,145 660,140 C730,136 800,142 860,144" fill="none" stroke="#ec4899" stroke-width="2.5" />
                <!-- Revenue dots -->
                {#each [[0,160],[200,130],[430,65],[660,100],[860,112]] as [cx,cy]}
                  <circle {cx} {cy} r="4" fill="#3b82f6" />
                {/each}
                <!-- Profit dots -->
                {#each [[0,180],[200,162],[430,138],[660,140],[860,144]] as [cx,cy]}
                  <circle {cx} {cy} r="4" fill="#ec4899" />
                {/each}
              </svg>
              <!-- X-axis labels -->
              <div class="absolute bottom-0 left-0 right-0 flex justify-between">
                {#each ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"] as m}
                  <span class="text-[10px] text-muted-foreground">{m}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Category -->
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold text-foreground">
              Revenue by Category
            </h3>
            <Dropdown
              options={[
                { value: "this-week", label: "This Week" },
                { value: "this-month", label: "This Month" },
                { value: "this-year", label: "This Year" },
              ]}
              value="this-week"
              class="min-w-30"
            />
          </div>

          <!-- Donut chart for category distribution -->
          <div class="flex justify-center mb-4">
            <svg viewBox="0 0 160 160" class="w-36 h-36">
              <defs>
                <linearGradient id="elecGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" /><stop offset="100%" stop-color="#6366f1" />
                </linearGradient>
              </defs>
              <!-- Electronics 35% -->
              <circle cx="80" cy="80" r="56" fill="none" stroke="url(#elecGrad)" stroke-width="26"
                stroke-dasharray="123.2 351.9" stroke-dashoffset="0" transform="rotate(-90 80 80)" />
              <!-- Clothing 25% -->
              <circle cx="80" cy="80" r="56" fill="none" stroke="#ec4899" stroke-width="26"
                stroke-dasharray="87.9 351.9" stroke-dashoffset="-123.2" transform="rotate(-90 80 80)" />
              <!-- Home Supplies 22% -->
              <circle cx="80" cy="80" r="56" fill="none" stroke="#f59e0b" stroke-width="26"
                stroke-dasharray="77.4 351.9" stroke-dashoffset="-211.1" transform="rotate(-90 80 80)" />
              <!-- Beauty 10% -->
              <circle cx="80" cy="80" r="56" fill="none" stroke="#22c55e" stroke-width="26"
                stroke-dasharray="35.2 351.9" stroke-dashoffset="-288.5" transform="rotate(-90 80 80)" />
              <!-- Groceries 8% -->
              <circle cx="80" cy="80" r="56" fill="none" stroke="#a855f7" stroke-width="26"
                stroke-dasharray="28.2 351.9" stroke-dashoffset="-323.7" transform="rotate(-90 80 80)" />
              <circle cx="80" cy="80" r="43" class="fill-card" />
              <text x="80" y="76" font-size="11" fill="currentColor" text-anchor="middle" font-weight="700">$40.6M</text>
              <text x="80" y="90" font-size="8" fill="#6b7280" text-anchor="middle">Total</text>
            </svg>
          </div>

          <!-- Legend + list -->
          <div class="space-y-3">
            {#each revenueByCategory as item, i}
              {@const colors = ["bg-blue-500","bg-pink-500","bg-amber-500","bg-green-500","bg-purple-500"]}
              <div class="flex items-center justify-between pb-3 border-b border-border last:border-0">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full {colors[i]} shrink-0"></span>
                  <div>
                    <p class="text-sm font-medium text-foreground">{item.category}</p>
                    <p class="text-xs text-muted-foreground">{item.items}</p>
                  </div>
                </div>
                <p class="text-sm font-semibold text-foreground">{item.revenue}</p>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="revenue-date-range"
        bind:dateRange={revenueDateRange}
        filters={[
          { id: "revenue-location-filter", label: "Location", options: paymentsFilters[0].options },
          { id: "revenue-products-filter", label: "Products", options: paymentsFilters[1].options },
        ]}
      />

      <!-- Revenue Breakdown Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">
            Revenue Breakdown
          </h3>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to PDF"
              onclick={handleExportPDF}
            >
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to XLS"
              onclick={handleExportXLS}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-green-500"
              />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Print"
              onclick={handlePrint}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-muted-foreground"
              />
            </button>
          </div>
        </div>

        {#if true}
          {@const paginatedRevenueData = revenueBreakdownData.slice(
            (revenueBreakdownPage - 1) * revenueBreakdownRowsPerPage,
            revenueBreakdownPage * revenueBreakdownRowsPerPage,
          )}
          <DataTable
            columns={revenueBreakdownColumns}
            data={paginatedRevenueData}
            searchable={false}
            filters={[]}
            pagination={{
              currentPage: revenueBreakdownPage,
              totalPages: revenueBreakdownTotalPages,
              rowsPerPage: revenueBreakdownRowsPerPage,
              onPageChange: handleRevenueBreakdownPageChange,
              onRowsPerPageChange: handleRevenueBreakdownRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
  {#if activeTab === "Payments"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {#each paymentsKpiCards as kpi}
          <IconKpiCard
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            iconBgClass={kpi.iconBgClass}
            iconColor={kpi.iconColor}
            borderColor={kpi.borderColor}
          />
        {/each}
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="payments-date-range"
        bind:dateRange={paymentsDateRange}
        filters={[
          { id: "payments-location-filter", label: "Location", options: paymentsFilters[0].options },
          { id: "payments-products-filter", label: "Products", options: paymentsFilters[1].options },
        ]}
      />

      <!-- Payment Report Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">Payment Report</h3>
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to PDF"
              onclick={handleExportPDF}
            >
              <Icon iconName="icon/file-text" size={20} class="text-red-500" />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Export to XLS"
              onclick={handleExportXLS}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-green-500"
              />
            </button>
            <button
              type="button"
              class="p-2 hover:bg-muted rounded transition-colors"
              aria-label="Print"
              onclick={handlePrint}
            >
              <Icon
                iconName="icon/file-text"
                size={20}
                class="text-muted-foreground"
              />
            </button>
          </div>
        </div>

        {#if true}
          {@const paginatedPaymentsData = paymentsReportData.slice(
            (paymentsPage - 1) * paymentsRowsPerPage,
            paymentsPage * paymentsRowsPerPage,
          )}
          <DataTable
            columns={paymentsColumns}
            data={paginatedPaymentsData}
            searchable={false}
            filters={[]}
            pagination={{
              currentPage: paymentsPage,
              totalPages: paymentsTotalPages,
              rowsPerPage: paymentsRowsPerPage,
              onPageChange: handlePaymentsPageChange,
              onRowsPerPageChange: handlePaymentsRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
  {#if activeTab === "Stock Movement"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each stockMovementKpiCards as kpi}
          <StatKpiCard
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            changeLabel={kpi.changeLabel}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            textColor={kpi.textColor}
          />
        {/each}
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="stock-movement-date-range"
        bind:dateRange={stockMovementDateRange}
        filters={[
          { id: "stock-movement-location-filter", label: "Location", options: stockMovementFilters[0].options },
          { id: "stock-movement-products-filter", label: "Products", options: stockMovementFilters[1].options },
        ]}
      />

      <!-- Stock Movement Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="relative mb-4">
          <Icon
            iconName="icon/search"
            size={16}
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            bind:value={stockMovementSearchQuery}
            placeholder="Search"
            class="w-full max-w-xs pl-9 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
          />
        </div>
        {#if true}
          {@const paginatedStockMovementData = stockMovementData.slice(
            (stockMovementPage - 1) * stockMovementRowsPerPage,
            stockMovementPage * stockMovementRowsPerPage,
          )}
          <DataTable
            columns={stockMovementColumns}
            data={paginatedStockMovementData}
            searchable={false}
            filters={[]}
            actions={[
              {
                icon: "icon/edit",
                label: "Edit",
                onClick: handleEditStockMovement,
              },
              {
                icon: "icon/trash",
                label: "Delete",
                onClick: handleDeleteStockMovement,
                variant: "destructive",
              },
            ]}
            pagination={{
              currentPage: stockMovementPage,
              totalPages: stockMovementTotalPages,
              rowsPerPage: stockMovementRowsPerPage,
              onPageChange: handleStockMovementPageChange,
              onRowsPerPageChange: handleStockMovementRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
  {#if activeTab === "Low Stock"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {#each lowStockKpiCards as kpi}
          <StatKpiCard
            label={kpi.label}
            value={kpi.value}
            change={kpi.change}
            changeLabel={kpi.changeLabel}
            icon={kpi.icon}
            iconColor={kpi.iconColor}
            textColor={kpi.textColor}
            valueColor={kpi.valueColor}
          />
        {/each}
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="low-stock-date-range"
        bind:dateRange={lowStockDateRange}
        filters={[
          { id: "low-stock-location-filter", label: "Location", options: lowStockLocationOptions, value: lowStockLocationFilter, onchange: (v) => (lowStockLocationFilter = v) },
          { id: "low-stock-products-filter", label: "Products", options: lowStockCategoryOptions, value: lowStockCategoryFilter, onchange: (v) => (lowStockCategoryFilter = v) },
        ]}
      />

      <!-- Low Stock Table -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <!-- Search -->
          <div class="relative">
            <Icon iconName="icon/search" size={16} class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              bind:value={lowStockSearchQuery}
              placeholder="Search"
              class="h-9 w-48 pl-9 pr-4 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
            />
          </div>
          <!-- Inline filters -->
          <div class="flex items-center gap-2">
            <Dropdown
              id="ls-table-location"
              options={lowStockFilters[0].options}
              bind:value={lowStockLocationFilter}
              placeholder="Location"
              class="w-36"
            />
            <Dropdown
              id="ls-table-category"
              options={lowStockCategoryOptions}
              bind:value={lowStockCategoryFilter}
              placeholder="Category"
              class="w-36"
            />
          </div>
        </div>
        {#if true}
          {@const paginatedLowStockData = filteredLowStockData.slice(
            (lowStockPage - 1) * lowStockRowsPerPage,
            lowStockPage * lowStockRowsPerPage,
          )}
          <DataTable
            columns={lowStockColumns}
            data={paginatedLowStockData}
            searchable={false}
            filters={[]}
            actions={[
              {
                icon: "icon/edit",
                label: "Edit",
                onClick: handleEditLowStock,
              },
              {
                icon: "icon/trash",
                label: "Delete",
                onClick: handleDeleteLowStock,
                variant: "destructive",
              },
            ]}
            pagination={{
              currentPage: lowStockPage,
              totalPages: lowStockTotalPages,
              rowsPerPage: lowStockRowsPerPage,
              onPageChange: handleLowStockPageChange,
              onRowsPerPageChange: handleLowStockRowsPerPageChange,
            }}
          />
        {/if}
      </div>
    </div>
  {/if}
</div>
