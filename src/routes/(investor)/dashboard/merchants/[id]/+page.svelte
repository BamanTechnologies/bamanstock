<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

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
      icon: "icon/bar-chart",
      iconColor: "bg-green-100",
    },
    {
      label: "Total Transaction",
      value: "$8,458.798",
      change: "+35% vs Last Month",
      changeType: "positive",
      icon: "icon/trending-up",
      iconColor: "bg-blue-100",
    },
    {
      label: "Products Assigned",
      value: "84",
      change: "+41% vs Last Month",
      changeType: "positive",
      icon: "icon/package",
      iconColor: "bg-orange-100",
    },
    {
      label: "Current Stock Value",
      value: "$850K",
      change: "-20% vs Last Month",
      changeType: "negative",
      icon: "icon/trending-up",
      iconColor: "bg-purple-100",
    },
  ];

  let activeTab = $state("Overview");

  const tabs = ["Overview", "Assigned Stock", "Activity", "Permissions"];

  function handleBack() {
    goto("/dashboard");
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
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-green-100 text-green-800 border-green-200"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {merchant.status}
            </span>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <Button variant="outline" class="border-info text-info">
          Edit Location
        </Button>
        <Button class="bg-info text-info-foreground hover:bg-info/90">
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
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-muted-foreground">Assigned Stock content will go here</p>
    </div>
  {:else if activeTab === "Activity"}
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-muted-foreground">Activity content will go here</p>
    </div>
  {:else if activeTab === "Permissions"}
    <div class="bg-card border border-border rounded-lg p-6">
      <p class="text-muted-foreground">Permissions content will go here</p>
    </div>
  {/if}
</div>
