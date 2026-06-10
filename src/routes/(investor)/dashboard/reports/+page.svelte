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

  const revenueChartData: Record<string, { labels: string[]; revenue: number[]; profit: number[]; yLabels: string[] }> = {
    "1D": { labels: ["6am","9am","12pm","3pm","6pm","9pm"], revenue: [10,28,48,38,55,25], profit: [4,11,20,15,22,10], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1W": { labels: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"], revenue: [32,45,38,58,50,62,40], profit: [12,18,15,24,20,25,16], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1M": { labels: ["Wk1","Wk2","Wk3","Wk4"], revenue: [42,58,48,70], profit: [16,23,19,28], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "3M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], revenue: [38,52,44,65,72,58], profit: [14,20,17,26,29,23], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "6M": { labels: ["Jan","Feb","Mar","Apr","May","Jun"], revenue: [28,42,55,72,85,62], profit: [10,16,22,29,34,25], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
    "1Y": { labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"], revenue: [18,25,38,65,45,28,38,32,28,35,42,48], profit: [6,9,14,24,17,10,14,12,10,13,16,18], yLabels: ["$60k","$50k","$40k","$30k","$20k","$10k"] },
  };

  function toReportPath(values: number[], w = 860, h = 200, topPad = 18, botPad = 8) {
    const n = values.length;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const pts = values.map((v, i) => ({
      x: Math.round((i / Math.max(n - 1, 1)) * w),
      y: Math.round(topPad + ((max - v) / range) * (h - topPad - botPad)),
    }));
    let line = `M${pts[0].x},${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const p = pts[i - 1], c = pts[i];
      const cpx = (p.x + c.x) / 2;
      line += ` C${cpx},${p.y} ${cpx},${c.y} ${c.x},${c.y}`;
    }
    return { line, fill: `${line} L${pts[pts.length - 1].x},${h} L0,${h} Z`, pts };
  }

  const activeRevenueChart = $derived(revenueChartData[chartTimeframe] ?? revenueChartData["1Y"]);
  const svgRevenue = $derived(toReportPath(activeRevenueChart.revenue));
  const svgProfit  = $derived(toReportPath(activeRevenueChart.profit));

  const CAT_CIRC = 351.9;
  const catColors = ["#3b82f6", "#ec4899", "#f59e0b", "#22c55e", "#a855f7"];
  const catBgColors = ["bg-blue-500", "bg-pink-500", "bg-amber-500", "bg-green-500", "bg-purple-500"];

  const revenueByCategoryByPeriod: Record<string, { total: string; categories: Array<{ category: string; items: string; revenue: string; pct: number }> }> = {
    "this-week": {
      total: "$40.6M",
      categories: [
        { category: "Electronics",   items: "500+ items",   revenue: "$48,901.35 Revenue",    pct: 35 },
        { category: "Clothing",      items: "500+ items",   revenue: "$109,820.50 Revenue",   pct: 25 },
        { category: "Home Supplies", items: "190+ items",   revenue: "$548,900.12 Revenue",   pct: 22 },
        { category: "Beauty",        items: "350+ items",   revenue: "$36,700.50 Revenue",    pct: 10 },
        { category: "Groceries",     items: "1200+ items",  revenue: "$8,965 Revenue",        pct: 8  },
      ],
    },
    "this-month": {
      total: "$162M",
      categories: [
        { category: "Electronics",   items: "2000+ items",  revenue: "$195,605.40 Revenue",   pct: 30 },
        { category: "Clothing",      items: "1800+ items",  revenue: "$439,282.00 Revenue",   pct: 28 },
        { category: "Home Supplies", items: "750+ items",   revenue: "$2,195,600.48 Revenue", pct: 20 },
        { category: "Beauty",        items: "1400+ items",  revenue: "$146,802.00 Revenue",   pct: 14 },
        { category: "Groceries",     items: "4800+ items",  revenue: "$35,860.00 Revenue",    pct: 8  },
      ],
    },
    "this-year": {
      total: "$1.95B",
      categories: [
        { category: "Electronics",   items: "24000+ items", revenue: "$2,347,265 Revenue",    pct: 32 },
        { category: "Clothing",      items: "21600+ items", revenue: "$5,271,384 Revenue",    pct: 26 },
        { category: "Home Supplies", items: "9000+ items",  revenue: "$26,347,206 Revenue",   pct: 24 },
        { category: "Beauty",        items: "16800+ items", revenue: "$1,761,624 Revenue",    pct: 12 },
        { category: "Groceries",     items: "57600+ items", revenue: "$430,521 Revenue",      pct: 6  },
      ],
    },
  };

  const activeRevenueByCat = $derived(revenueByCategoryByPeriod[revenueByCategoryPeriod] ?? revenueByCategoryByPeriod["this-week"]);

  const revenueCatSegments = $derived.by(() => {
    let offset = 0;
    return activeRevenueByCat.categories.map((cat, i) => {
      const dash = (cat.pct / 100) * CAT_CIRC;
      const seg = { dash, offset: -offset, color: catColors[i] };
      offset += dash;
      return seg;
    });
  });

  let revenueDateRange = $state("01-Jan-2025 - 12-Dec-2025");

  // Payments tab data
  const paymentsKpiCards = [
    { label: "Total Amount", value: "$4,56,000", icon: "icon/bar-chart"      as any, iconBgClass: "bg-green-50  dark:bg-green-900/40",  iconColor: "#16a34a" },
    { label: "Total Paid",   value: "$2,56,42",  icon: "icon/credit-card"    as any, iconBgClass: "bg-blue-50   dark:bg-blue-900/40",   iconColor: "#3b82f6" },
    { label: "Total Unpaid", value: "$1,52,45",  icon: "icon/dollar-sign"    as any, iconBgClass: "bg-orange-50 dark:bg-orange-900/40", iconColor: "#f97316" },
    { label: "Overdue",      value: "$2,56,12",  icon: "icon/alert-triangle" as any, iconBgClass: "bg-red-50    dark:bg-red-900/40",    iconColor: "#ef4444" },
  ];

  // Mock payments report data
  let paymentsReportData = $state([
    { id: "INV001", merchant: "Carl Evans",       dueDate: "24 Dec 2024", amount: "$500",  paid: "$500",  amountDue: "$500",  status: "Paid",   branch: "Branch #1" },
    { id: "INV002", merchant: "Minerva Rameriz",  dueDate: "10 Dec 2024", amount: "$1500", paid: "$1500", amountDue: "$1500", status: "Paid",   branch: "Branch #2" },
    { id: "INV003", merchant: "Robert Lamon",     dueDate: "27 Nov 2024", amount: "$600",  paid: "$600",  amountDue: "$600",  status: "Paid",   branch: "Branch #3" },
    { id: "INV004", merchant: "Patricia Lewis",   dueDate: "18 Nov 2024", amount: "$1000", paid: "$1000", amountDue: "$1000", status: "Paid",   branch: "Branch #1" },
    { id: "INV005", merchant: "Mark Joslyn",      dueDate: "06 Nov 2024", amount: "$1200", paid: "$1200", amountDue: "$1200", status: "Paid",   branch: "Branch #4" },
    { id: "INV006", merchant: "Marsha Betts",     dueDate: "25 Oct 2024", amount: "$800",  paid: "$800",  amountDue: "$800",  status: "Paid",   branch: "Branch #2" },
    { id: "INV007", merchant: "Daniel Jude",      dueDate: "14 Oct 2024", amount: "$2000", paid: "$2000", amountDue: "$2000", status: "Paid",   branch: "Branch #5" },
    { id: "INV008", merchant: "Emma Bates",       dueDate: "03 Oct 2024", amount: "$100",  paid: "$100",  amountDue: "$100",  status: "Paid",   branch: "Branch #3" },
    { id: "INV009", merchant: "Richard Fralick",  dueDate: "20 Sep 2024", amount: "$300",  paid: "$300",  amountDue: "$300",  status: "Paid",   branch: "Branch #1" },
    { id: "INV010", merchant: "Michelle Robison", dueDate: "10 Sep 2024", amount: "$5000", paid: "$0",    amountDue: "$5000", status: "Unpaid", branch: "Branch #2" },
    { id: "INV011", merchant: "John Smith",    dueDate: "05 Jan 2025", amount: "$750",  paid: "$750", amountDue: "$750",  status: "Paid",   branch: "Branch #4" },
    { id: "INV012", merchant: "Sarah Johnson",    dueDate: "15 Jan 2025", amount: "$1200", paid: "$0",    amountDue: "$1200", status: "Unpaid", branch: "Branch #3" },
    { id: "INV013", merchant: "Daniel Park",      dueDate: "20 Jan 2025", amount: "$890",  paid: "$890",  amountDue: "$890",  status: "Paid",   branch: "Branch #4" },
    { id: "INV014", merchant: "Fatima Hassan",    dueDate: "25 Jan 2025", amount: "$2300", paid: "$0",    amountDue: "$2300", status: "Unpaid", branch: "Branch #5" },
    { id: "INV015", merchant: "Lucas Ferreira",   dueDate: "30 Jan 2025", amount: "$650",  paid: "$650",  amountDue: "$650",  status: "Paid",   branch: "Branch #1" },
    { id: "INV016", merchant: "Nina Patel",        dueDate: "05 Feb 2025", amount: "$4200", paid: "$4200", amountDue: "$4200", status: "Paid",   branch: "Branch #2" },
    { id: "INV017", merchant: "Kwame Asante",     dueDate: "10 Feb 2025", amount: "$780",  paid: "$0",    amountDue: "$780",  status: "Unpaid", branch: "Branch #3" },
    { id: "INV018", merchant: "Priya Sharma",     dueDate: "14 Feb 2025", amount: "$1100", paid: "$1100", amountDue: "$1100", status: "Paid",   branch: "Branch #4" },
    { id: "INV019", merchant: "Thomas Green",     dueDate: "18 Feb 2025", amount: "$3400", paid: "$0",    amountDue: "$3400", status: "Unpaid", branch: "Branch #5" },
    { id: "INV020", merchant: "Amara Obi",        dueDate: "22 Feb 2025", amount: "$560",  paid: "$560",  amountDue: "$560",  status: "Paid",   branch: "Branch #1" },
    { id: "INV021", merchant: "Lena Müller",      dueDate: "28 Feb 2025", amount: "$920",  paid: "$920",  amountDue: "$920",  status: "Paid",   branch: "Branch #2" },
    { id: "INV022", merchant: "Ravi Kumar",        dueDate: "05 Mar 2025", amount: "$1650", paid: "$0",    amountDue: "$1650", status: "Unpaid", branch: "Branch #3" },
    { id: "INV023", merchant: "Marcus Davis",     dueDate: "10 Mar 2025", amount: "$430",  paid: "$430",  amountDue: "$430",  status: "Paid",   branch: "Branch #4" },
    { id: "INV024", merchant: "Emma Collins",     dueDate: "15 Mar 2025", amount: "$2800", paid: "$2800", amountDue: "$2800", status: "Paid",   branch: "Branch #5" },
    { id: "INV025", merchant: "James Morgan",     dueDate: "20 Mar 2025", amount: "$710",  paid: "$0",    amountDue: "$710",  status: "Unpaid", branch: "Branch #1" },
    { id: "INV026", merchant: "Olivia Chen",      dueDate: "25 Mar 2025", amount: "$1980", paid: "$1980", amountDue: "$1980", status: "Paid",   branch: "Branch #2" },
    { id: "INV027", merchant: "Beth Noah",        dueDate: "01 Apr 2025", amount: "$340",  paid: "$0",    amountDue: "$340",  status: "Unpaid", branch: "Branch #3" },
    { id: "INV028", merchant: "Yohannes Abayneh", dueDate: "08 Apr 2025", amount: "$6100", paid: "$6100", amountDue: "$6100", status: "Paid",   branch: "Branch #4" },
    { id: "INV029", merchant: "Carlos Curran",    dueDate: "15 Apr 2025", amount: "$870",  paid: "$0",    amountDue: "$870",  status: "Unpaid", branch: "Branch #5" },
    { id: "INV030", merchant: "Stan Gaunter",     dueDate: "22 Apr 2025", amount: "$1450", paid: "$1450", amountDue: "$1450", status: "Paid",   branch: "Branch #1" },
  ]);

  let paymentsDateRange = $state("01-Jan-2025 - 12-Dec-2025");
  let paymentsPage = $state(1);
  let paymentsRowsPerPage = $state(10);

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

  let paymentsStatusFilter = $state("");
  let paymentsMerchantFilter = $state("");
  let paymentsBranchFilter = $state("");

  const filteredPaymentsData = $derived(
    paymentsReportData.filter((row) => {
      const matchesStatus = !paymentsStatusFilter || row.status.toLowerCase() === paymentsStatusFilter;
      const matchesMerchant = !paymentsMerchantFilter || row.merchant.toLowerCase().includes(paymentsMerchantFilter);
      const matchesBranch = !paymentsBranchFilter || (row as any).branch === paymentsBranchFilter;
      return matchesStatus && matchesMerchant && matchesBranch;
    })
  );

  const paymentsTotalPages = $derived(Math.ceil(filteredPaymentsData.length / paymentsRowsPerPage));

  $effect(() => { paymentsStatusFilter; paymentsMerchantFilter; paymentsBranchFilter; paymentsPage = 1; });

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
    { id: 12, fromWarehouse: "Main Depot",           toWarehouse: "Satellite Storage",    numberOfProducts: "27", quantityTransferred: "20", referenceNumber: "#152345", date: "15 Sep 2024" },
    { id: 13, fromWarehouse: "Northern Hub",          toWarehouse: "Southside Depot",      numberOfProducts: "38", quantityTransferred: "30", referenceNumber: "#163490", date: "05 Aug 2024" },
    { id: 14, fromWarehouse: "City Warehouse",        toWarehouse: "Suburb Storage",       numberOfProducts: "22", quantityTransferred: "18", referenceNumber: "#174832", date: "18 Aug 2024" },
    { id: 15, fromWarehouse: "Eastgate Facility",     toWarehouse: "Westgate Hub",         numberOfProducts: "50", quantityTransferred: "42", referenceNumber: "#185674", date: "30 Aug 2024" },
    { id: 16, fromWarehouse: "Alpha Warehouse",       toWarehouse: "Beta Distribution",    numberOfProducts: "31", quantityTransferred: "25", referenceNumber: "#196521", date: "12 Jul 2024" },
    { id: 17, fromWarehouse: "Central Storage",       toWarehouse: "Peripheral Depot",     numberOfProducts: "44", quantityTransferred: "38", referenceNumber: "#207364", date: "24 Jul 2024" },
    { id: 18, fromWarehouse: "Metro Fulfillment",     toWarehouse: "Rural Distribution",   numberOfProducts: "19", quantityTransferred: "14", referenceNumber: "#218203", date: "08 Jun 2024" },
    { id: 19, fromWarehouse: "Tech Storage Unit",     toWarehouse: "Retail Supply Hub",    numberOfProducts: "36", quantityTransferred: "29", referenceNumber: "#229045", date: "20 Jun 2024" },
    { id: 20, fromWarehouse: "Bulk Goods Facility",   toWarehouse: "Express Depot",        numberOfProducts: "60", quantityTransferred: "55", referenceNumber: "#239887", date: "02 May 2024" },
    { id: 21, fromWarehouse: "Import Center",         toWarehouse: "Local Distribution",   numberOfProducts: "25", quantityTransferred: "21", referenceNumber: "#250729", date: "14 May 2024" },
    { id: 22, fromWarehouse: "Freight Terminal",      toWarehouse: "Inland Warehouse",     numberOfProducts: "42", quantityTransferred: "36", referenceNumber: "#261572", date: "28 May 2024" },
    { id: 23, fromWarehouse: "Supply Chain Base",     toWarehouse: "Outlet Storage",       numberOfProducts: "17", quantityTransferred: "13", referenceNumber: "#272414", date: "10 Apr 2024" },
    { id: 24, fromWarehouse: "Primary Distribution",  toWarehouse: "Secondary Hub",        numberOfProducts: "53", quantityTransferred: "47", referenceNumber: "#283256", date: "22 Apr 2024" },
    { id: 25, fromWarehouse: "Grand Warehouse",       toWarehouse: "Micro Depot",          numberOfProducts: "29", quantityTransferred: "23", referenceNumber: "#294099", date: "05 Mar 2024" },
  ]);

  let stockMovementDateRange = $state("01-Jan-2025 - 12-Dec-2025");
  let stockMovementSearchQuery = $state("");
  let stockMovementPage = $state(1);
  let stockMovementRowsPerPage = $state(10);

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

  let stockMovementLocationFilter = $state("");

  const filteredStockMovementData = $derived(
    stockMovementData.filter((row) => {
      const matchesLocation = !stockMovementLocationFilter ||
        row.fromWarehouse.toLowerCase().includes(stockMovementLocationFilter.toLowerCase()) ||
        row.toWarehouse.toLowerCase().includes(stockMovementLocationFilter.toLowerCase());
      const matchesSearch = !stockMovementSearchQuery ||
        row.fromWarehouse.toLowerCase().includes(stockMovementSearchQuery.toLowerCase()) ||
        row.toWarehouse.toLowerCase().includes(stockMovementSearchQuery.toLowerCase()) ||
        row.referenceNumber.toLowerCase().includes(stockMovementSearchQuery.toLowerCase());
      return matchesLocation && matchesSearch;
    })
  );

  const stockMovementTotalPages = $derived(Math.ceil(filteredStockMovementData.length / stockMovementRowsPerPage));

  $effect(() => { stockMovementLocationFilter; stockMovementSearchQuery; stockMovementPage = 1; });

  const stockMovementWarehouseOptions = $derived([
    { value: "", label: "All" },
    ...[...new Set(stockMovementData.flatMap((r) => [r.fromWarehouse, r.toWarehouse]))].map((w) => ({ value: w.toLowerCase(), label: w })),
  ]);

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
  let revenueCategoryFilter = $state("");
  let revenueByCategoryPeriod = $state("this-week");

  const filteredRevenueBreakdownData = $derived(
    revenueBreakdownData.filter((row) =>
      !revenueCategoryFilter || row.category.toLowerCase() === revenueCategoryFilter
    )
  );

  const revenueBreakdownTotalPages = $derived(
    Math.ceil(filteredRevenueBreakdownData.length / revenueBreakdownRowsPerPage),
  );

  $effect(() => { revenueCategoryFilter; revenueBreakdownPage = 1; });

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

  let salesLocationFilter = $state("");
  let salesMerchantFilter = $state("");
  let salesCategoryFilter = $state("");
  let salesProductFilter = $state("");
  const filteredSalesData = $derived(
    salesReportData.filter((row) => {
      if (salesLocationFilter && row.location.toLowerCase().replace(/\s+/g, "-") !== salesLocationFilter) return false;
      if (salesMerchantFilter && row.assignedMerchant.toLowerCase().replace(/\s+/g, "-") !== salesMerchantFilter) return false;
      if (salesCategoryFilter && row.category.toLowerCase() !== salesCategoryFilter) return false;
      if (salesProductFilter && !row.productName.toLowerCase().includes(salesProductFilter)) return false;
      return true;
    })
  );
  let currentPage = $state(1);
  let rowsPerPage = $state(10);
  const totalPages = $derived(Math.ceil(filteredSalesData.length / rowsPerPage));

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
          { id: "location-filter", label: "Location", options: filters[0].options, value: salesLocationFilter, onchange: (v) => { salesLocationFilter = v; currentPage = 1; } },
          { id: "merchant-filter", label: "Merchant", options: filters[1].options, value: salesMerchantFilter, onchange: (v) => { salesMerchantFilter = v; currentPage = 1; } },
          { id: "category-filter", label: "Category", options: filters[2].options, value: salesCategoryFilter, onchange: (v) => { salesCategoryFilter = v; currentPage = 1; } },
          { id: "products-filter", label: "Products", options: filters[3].options, value: salesProductFilter, onchange: (v) => { salesProductFilter = v; currentPage = 1; } },
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
          {@const paginatedData = filteredSalesData.slice(
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
              {#each activeRevenueChart.yLabels as lbl}
                <span>{lbl}</span>
              {/each}
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
                {#each [0, 40, 80, 120, 160, 200] as y}
                  <line x1="0" y1={y} x2="860" y2={y} stroke="currentColor" stroke-opacity="0.07" stroke-width="1" />
                {/each}
                <path d={svgRevenue.fill} fill="url(#revGradReport)" />
                <path d={svgRevenue.line} fill="none" stroke="#3b82f6" stroke-width="2.5" />
                <path d={svgProfit.fill}  fill="url(#profitGrad)" />
                <path d={svgProfit.line}  fill="none" stroke="#ec4899" stroke-width="2.5" />
                {#each svgRevenue.pts as pt}
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#3b82f6" />
                {/each}
                {#each svgProfit.pts as pt}
                  <circle cx={pt.x} cy={pt.y} r="4" fill="#ec4899" />
                {/each}
              </svg>
              <div class="absolute bottom-0 left-0 right-0 flex justify-between">
                {#each activeRevenueChart.labels as m}
                  <span class="text-[10px] text-muted-foreground">{m}</span>
                {/each}
              </div>
            </div>
          </div>
        </div>

        <!-- Revenue by Category -->
        <div class="bg-card border border-border rounded-lg px-8 py-6">
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
              bind:value={revenueByCategoryPeriod}
              class="min-w-30"
            />
          </div>

          <!-- Donut chart for category distribution -->
          <div class="flex justify-center mb-4">
            <svg viewBox="0 0 160 160" class="w-36 h-36">
              {#each revenueCatSegments as seg}
                <circle cx="80" cy="80" r="56" fill="none" stroke={seg.color} stroke-width="26"
                  stroke-dasharray="{seg.dash.toFixed(1)} {CAT_CIRC}" stroke-dashoffset={seg.offset.toFixed(1)} transform="rotate(-90 80 80)" />
              {/each}
              <circle cx="80" cy="80" r="43" class="fill-card" />
              <text x="80" y="76" font-size="11" fill="currentColor" text-anchor="middle" font-weight="700">{activeRevenueByCat.total}</text>
              <text x="80" y="90" font-size="8" fill="#6b7280" text-anchor="middle">Total</text>
            </svg>
          </div>

          <!-- Legend + list -->
          <div class="space-y-3">
            {#each activeRevenueByCat.categories as item, i}
              <div class="flex items-center justify-between pb-3 border-b border-border last:border-0">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full {catBgColors[i]} shrink-0"></span>
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
          { id: "revenue-category-filter", label: "Category", options: [
              { value: "", label: "All" },
              { value: "electronics", label: "Electronics" },
              { value: "clothing", label: "Clothing" },
              { value: "home supplies", label: "Home Supplies" },
              { value: "beauty", label: "Beauty" },
              { value: "furniture", label: "Furniture" },
            ], value: revenueCategoryFilter, onchange: (v) => { revenueCategoryFilter = v; } },
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
          {@const paginatedRevenueData = filteredRevenueBreakdownData.slice(
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
          />
        {/each}
      </div>

      <!-- Filters Section -->
      <ReportFilterBar
        id="payments-date-range"
        bind:dateRange={paymentsDateRange}
        filters={[
          { id: "payments-status-filter", label: "Status", options: [
              { value: "", label: "All" },
              { value: "paid", label: "Paid" },
              { value: "unpaid", label: "Unpaid" },
            ], value: paymentsStatusFilter, onchange: (v) => { paymentsStatusFilter = v; } },
          { id: "payments-merchant-filter", label: "Merchant", options: [
              { value: "", label: "All" },
              { value: "carl", label: "Carl Evans" },
              { value: "minerva", label: "Minerva Rameriz" },
              { value: "robert", label: "Robert Lamon" },
              { value: "john", label: "John Smith" },
              { value: "sarah", label: "Sarah Johnson" },
            ], value: paymentsMerchantFilter, onchange: (v) => { paymentsMerchantFilter = v; } },
          { id: "payments-branch-filter", label: "Branch", options: [
              { value: "", label: "All Branches" },
              { value: "Branch #1", label: "Branch #1" },
              { value: "Branch #2", label: "Branch #2" },
              { value: "Branch #3", label: "Branch #3" },
              { value: "Branch #4", label: "Branch #4" },
              { value: "Branch #5", label: "Branch #5" },
            ], value: paymentsBranchFilter, onchange: (v) => { paymentsBranchFilter = v; } },
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
          {@const paginatedPaymentsData = filteredPaymentsData.slice(
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
          { id: "stock-movement-location-filter", label: "Warehouse", options: stockMovementWarehouseOptions, value: stockMovementLocationFilter, onchange: (v) => { stockMovementLocationFilter = v; } },
        ]}
      />

      <!-- Stock Movement Table -->
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        {#if true}
          {@const paginatedStockMovementData = filteredStockMovementData.slice(
            (stockMovementPage - 1) * stockMovementRowsPerPage,
            stockMovementPage * stockMovementRowsPerPage,
          )}
          <DataTable
            columns={stockMovementColumns}
            data={paginatedStockMovementData}
            searchable={true}
            searchPlaceholder="Search"
            onSearch={(q) => { stockMovementSearchQuery = q; }}
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
      <div class="bg-card border border-border rounded-lg overflow-hidden">
        {#if true}
          {@const paginatedLowStockData = filteredLowStockData.slice(
            (lowStockPage - 1) * lowStockRowsPerPage,
            lowStockPage * lowStockRowsPerPage,
          )}
          <DataTable
            columns={lowStockColumns}
            data={paginatedLowStockData}
            searchable={true}
            searchPlaceholder="Search"
            onSearch={(q) => { lowStockSearchQuery = q; }}
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
