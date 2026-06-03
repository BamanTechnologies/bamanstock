<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import AssignStockModal from "$lib/components/investor/AssignStockModal.svelte";
  import EditLocationModal from "$lib/components/investor/EditLocationModal.svelte";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  // Get merchant ID from route params
  const merchantId = $derived($page.params.id);

  // Mock merchant data - replace with API call later
  const merchant = {
    id: merchantId,
    name: "Richard Wilson",
    location: "Branch 1",
    status: "Active",
    email: "contact@capitalflow.com",
    phone: "(555) 123-4567",
    joinedDate: "Capital Flow Partners",
    lastActivity: "Approved",
  };

  // KPI Cards data
  const kpiCards = [
    {
      label: "Total Revenue",
      value: "$48,988.78",
      change: "-19% vs Last Month",
      changeType: "negative",
      icon: "icon/bar-chart" as const,
      iconColor: "bg-green-100 dark:bg-green-900/40",
    },
    {
      label: "Total Transaction",
      value: "$8,458.798",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/trending-up" as const,
      iconColor: "bg-blue-100 dark:bg-blue-900/40",
    },
    {
      label: "Products Assigned",
      value: "84",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/package" as const,
      iconColor: "bg-orange-100 dark:bg-orange-900/40",
    },
    {
      label: "Current Stock Value",
      value: "$850K",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/trending-up" as const,
      iconColor: "bg-purple-100 dark:bg-purple-900/40",
    },
  ];

  let activeTab = $state("Overview");
  let isAssignStockModalOpen = $state(false);
  let isEditLocationModalOpen = $state(false);

  const tabs = ["Overview", "Assigned Stock", "Activity", "Permissions"];

  // Mock stock items data
  const stockItems = [
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
  ];

  let currentStockPage = $state(1);
  const rowsPerStockPage = 10;
  const totalStockPages = $derived(
    Math.ceil(stockItems.length / rowsPerStockPage)
  );

  // Activity log data
  const activityLog = [
    {
      id: 1,
      type: "stock-assigned",
      description:
        "1,200 units of stock were assigned to the merchant account.",
      timestamp: "Jul 12, 2024, 10:30 AM",
      icon: "icon/box",
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      id: 2,
      type: "stock-sold",
      description: "50 units sold to investor John Doe.",
      timestamp: "Jul 11, 2024, 02:45 PM",
      icon: "icon/tag",
      iconBg: "bg-green-100 dark:bg-green-900/40",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      id: 3,
      type: "payment-generated",
      description: "Payment of $1,500.00 generated. Status: Completed.",
      timestamp: "Jul 10, 2024, 09:00 AM",
      icon: "icon/dollar-sign",
      iconBg: "bg-purple-100 dark:bg-purple-900/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      id: 4,
      type: "profile-updated",
      description: "Contact information was updated by admin.",
      timestamp: "Jul 09, 2024, 05:15 PM",
      icon: "icon/edit",
      iconBg: "bg-orange-100 dark:bg-orange-900/40",
      iconColor: "text-orange-600 dark:text-orange-400",
    },
    {
      id: 5,
      type: "location-reassigned",
      description: "Merchant location was reassigned to 'Downtown Branch'.",
      timestamp: "Jul 08, 2024, 11:20 AM",
      icon: "icon/map-pin",
      iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  // Permissions state
  let createProducts = $state(true);
  let assignStock = $state(true);
  let updateStockLevels = $state(true);
  let salesAnalytics = $state("Read-only");
  let investorActivity = $state("No Access");

  const accessOptions = ["No Access", "Read-only", "Full Access"];

  function handleBack() {
    goto("/dashboard/merchants");
  }
</script>

<div class="flex-1 p-6 space-y-6">
  <!-- Back Navigation -->
  <button
    onclick={handleBack}
    class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
  >
    <Icon iconName="icon/arrow-left" size={20} />
    <span>Back to Merchants</span>
  </button>

  <!-- Merchant Profile Card -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-16 h-16 rounded-full bg-muted flex items-center justify-center"
        >
          <Icon iconName="icon/user" size={32} />
        </div>
        <div>
          <h2 class="text-2xl font-semibold text-foreground">
            {merchant.name}
          </h2>
          <div class="flex items-center gap-4 mt-1">
            <span class="text-sm text-muted-foreground"
              >{merchant.location}</span
            >
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {merchant.status}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button
          variant="outline"
          class="border-info text-info"
          onclick={() => (isEditLocationModalOpen = true)}
        >
          Edit Location
        </Button>
        <Button
          class="bg-info text-info-foreground hover:bg-info/90"
          onclick={() => (isAssignStockModalOpen = true)}
        >
          Assign Stock
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
                <Icon iconName={kpi.icon} size={20} class="text-foreground" />
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

      <!-- Charts and Info Section -->
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
                  class="px-3 py-1 text-xs rounded {period === '1Y'
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

        <!-- Merchant Information -->
        <div class="bg-card border border-border rounded-lg p-6">
          <h3 class="text-lg font-semibold text-foreground mb-6">
            Merchant Information
          </h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-muted-foreground mb-1">Contact Email</p>
              <p class="text-sm text-foreground">{merchant.email}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Contact Phone</p>
              <p class="text-sm text-foreground">{merchant.phone}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Joined Date</p>
              <p class="text-sm text-foreground">{merchant.joinedDate}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground mb-1">Last Activity</p>
              <p class="text-sm text-foreground">{merchant.lastActivity}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === "Assigned Stock"}
    <div class="space-y-6">
      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-muted-foreground">Total Stock Value</span>
            <div
              class="bg-purple-100 dark:bg-purple-900/40 w-10 h-10 rounded-lg flex items-center justify-center"
            >
              <Icon
                iconName="icon/line-chart"
                size={20}
                class="text-purple-600"
              />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground mb-1">$1.45M</p>
          <p class="text-sm text-red-600">-20% vs Last Month</p>
        </div>
        <div class="bg-card border border-border rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm text-muted-foreground">Unique Stock Items</span
            >
            <div
              class="bg-orange-100 dark:bg-orange-900/40 w-10 h-10 rounded-lg flex items-center justify-center"
            >
              <Icon iconName="icon/box" size={20} class="text-orange-600" />
            </div>
          </div>
          <p class="text-2xl font-bold text-foreground mb-1">147</p>
          <p class="text-sm text-green-600">+41% vs Last Month</p>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
          <div class="flex-1">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={20}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                type="text"
                placeholder="Search by stock name..."
                class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
              />
            </div>
          </div>
          <div class="flex gap-3">
            <Dropdown
              options={[
                { value: "", label: "All Categories" },
                { value: "electronics", label: "Electronics" },
                { value: "cloth", label: "Cloth" },
                { value: "furniture", label: "Furniture" },
                { value: "accessories", label: "Accessories" },
              ]}
              placeholder="All Categories"
            />
            <Dropdown
              options={[
                { value: "", label: "All Status" },
                { value: "adequate", label: "Adequate" },
                { value: "low", label: "Low" },
                { value: "out", label: "Out" },
              ]}
              placeholder="All Status"
            />
          </div>
        </div>

        <!-- Stock Items Table -->
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-3 text-left">
                  <input type="checkbox" class="rounded" />
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Stock Item
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Category
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Unit Price
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-foreground"
                >
                  Qty
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
              {#each stockItems as item}
                <tr class="hover:bg-muted/30">
                  <td class="px-4 py-4">
                    <input type="checkbox" class="rounded" />
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center"
                      >
                        <Icon
                          iconName={item.icon as
                            | "icon/laptop"
                            | "icon/headphones"
                            | "icon/watch"
                            | "icon/shoe"
                            | "icon/chair"
                            | "icon/briefcase"
                            | "icon/package"}
                          size={20}
                          class="text-muted-foreground"
                        />
                      </div>
                      <span class="text-sm font-medium text-foreground"
                        >{item.name}</span
                      >
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm text-muted-foreground"
                      >{item.category}</span
                    >
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm font-medium text-foreground"
                      >{item.unitPrice}</span
                    >
                  </td>
                  <td class="px-4 py-4">
                    <span class="text-sm text-foreground">{item.qty}</span>
                  </td>
                  <td class="px-4 py-4">
                    <span
                      class="inline-flex items-center gap-1.5 {item.statusColor}"
                    >
                      <span class="w-1.5 h-1.5 rounded-full {item.statusDot}"
                      ></span>
                      <span class="text-sm">{item.status}</span>
                    </span>
                  </td>
                  <td class="px-4 py-4">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        class="p-2 hover:bg-muted rounded transition-colors"
                        aria-label="Edit"
                      >
                        <Icon
                          iconName="icon/edit"
                          size={16}
                          class="text-muted-foreground"
                        />
                      </button>
                      <button
                        type="button"
                        class="p-2 hover:bg-muted rounded transition-colors"
                        aria-label="Refresh"
                      >
                        <Icon
                          iconName="icon/refresh-cw"
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
          </div>
          <div class="flex items-center gap-4">
            <span class="text-sm text-muted-foreground">Entries</span>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentStockPage === 1}
                onclick={() => currentStockPage > 1 && currentStockPage--}
              >
                <Icon iconName="icon/chevron-left" size={16} />
              </button>
              {#each Array(Math.min(5, totalStockPages)) as _, i}
                {@const pageNum = i + 1}
                <button
                  type="button"
                  class="px-3 py-1 text-sm rounded transition-colors {currentStockPage ===
                  pageNum
                    ? 'bg-info text-info-foreground'
                    : 'hover:bg-muted'}"
                  onclick={() => (currentStockPage = pageNum)}
                >
                  {pageNum}
                </button>
              {/each}
              {#if totalStockPages > 5}
                <span class="text-sm text-muted-foreground">...</span>
                <button
                  type="button"
                  class="px-3 py-1 text-sm rounded hover:bg-muted transition-colors"
                  onclick={() => (currentStockPage = totalStockPages)}
                >
                  {totalStockPages}
                </button>
              {/if}
              <button
                type="button"
                class="p-2 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentStockPage === totalStockPages}
                onclick={() =>
                  currentStockPage < totalStockPages && currentStockPage++}
              >
                <Icon iconName="icon/chevron-right" size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  {:else if activeTab === "Activity"}
    <div class="space-y-6">
      <!-- Date Filter -->
      <div class="bg-card border border-border rounded-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-foreground">Activity Log</h3>
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 px-4 py-2 border border-input rounded-md bg-background hover:bg-muted transition-colors"
            >
              <Icon
                iconName="icon/calendar"
                size={16}
                class="text-muted-foreground"
              />
              <span class="text-sm text-foreground">Date</span>
              <Icon
                iconName="icon/chevron-down"
                size={16}
                class="text-muted-foreground"
              />
            </button>
          </div>
        </div>

        <!-- Activity Entries -->
        <div class="space-y-6">
          {#each activityLog as activity}
            <div
              class="flex items-start gap-4 pb-6 border-b border-border last:border-b-0 last:pb-0"
            >
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 {activity.iconBg}"
              >
                <Icon
                  iconName={activity.icon as any}
                  size={20}
                  class={activity.iconColor}
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm text-foreground leading-relaxed">
                  {activity.description}
                </p>
              </div>
              <div class="shrink-0">
                <p class="text-sm text-muted-foreground whitespace-nowrap">
                  {activity.timestamp}
                </p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {:else if activeTab === "Permissions"}
    <div class="space-y-6">
      <!-- Stock Management Section -->
      <div class="bg-card border border-border rounded-lg p-6">
        <h3 class="text-lg font-semibold text-foreground mb-6">
          Stock Management
        </h3>
        <div class="space-y-6">
          <!-- Create Products -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-foreground mb-1">
                Create Products
              </h4>
              <p class="text-sm text-muted-foreground">
                Permission to add new stocks
              </p>
            </div>
            <div class="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={createProducts}
                aria-label="Create Products"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {createProducts
                  ? 'bg-info'
                  : 'bg-muted'}"
                onclick={() => (createProducts = !createProducts)}
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {createProducts
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </div>
          </div>

          <!-- Assign Stock -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-foreground mb-1">
                Assign Stock
              </h4>
              <p class="text-sm text-muted-foreground">
                Permission to assign new stocks
              </p>
            </div>
            <div class="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={assignStock}
                aria-label="Assign Stock"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {assignStock
                  ? 'bg-info'
                  : 'bg-muted'}"
                onclick={() => (assignStock = !assignStock)}
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {assignStock
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </div>
          </div>

          <!-- Update Stock Levels -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-foreground mb-1">
                Update Stock Levels
              </h4>
              <p class="text-sm text-muted-foreground">
                Ability to modify existing stock quantities
              </p>
            </div>
            <div class="shrink-0 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={updateStockLevels}
                aria-label="Update Stock Levels"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {updateStockLevels
                  ? 'bg-info'
                  : 'bg-muted'}"
                onclick={() => (updateStockLevels = !updateStockLevels)}
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {updateStockLevels
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Reports Access Section -->
      <div class="bg-card border border-border rounded-lg p-6">
        <h3 class="text-lg font-semibold text-foreground mb-6">
          Reports Access
        </h3>
        <div class="space-y-6">
          <!-- Sales Analytics -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-foreground mb-1">
                Sales Analytics
              </h4>
              <p class="text-sm text-muted-foreground">
                Access to view and export sales reports
              </p>
            </div>
            <div class="shrink-0">
              <Dropdown
                bind:value={salesAnalytics}
                options={accessOptions.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                class="min-w-[140px]"
              />
            </div>
          </div>

          <!-- Investor Activity -->
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <h4 class="text-sm font-medium text-foreground mb-1">
                Investor Activity
              </h4>
              <p class="text-sm text-muted-foreground">
                View logs of investor interactions and activities
              </p>
            </div>
            <div class="shrink-0">
              <Dropdown
                bind:value={investorActivity}
                options={accessOptions.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                class="min-w-[140px]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Assign Stock Modal -->
  <AssignStockModal
    bind:isOpen={isAssignStockModalOpen}
    merchantName={merchant.name}
    onAssign={(data) => {
      console.log("Assigning stock:", data);
      // TODO: Implement API call to assign stock
    }}
  />

  <!-- Edit Location Modal -->
  <EditLocationModal
    bind:isOpen={isEditLocationModalOpen}
    merchantName={merchant.name}
    currentLocation={merchant.location}
    onConfirm={(location) => {
      console.log("Changing location to:", location);
      // TODO: Implement API call to update location
      merchant.location = location;
    }}
  />
</div>
