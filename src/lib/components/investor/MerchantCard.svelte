<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";

  interface MerchantCardProps {
    name: string;
    avatar?: string;
    status: "active" | "inactive" | "pending";
    productsSold: number;
    category: string;
    onHire?: () => void;
  }

  let {
    name,
    avatar,
    status,
    productsSold,
    category,
    onHire,
  }: MerchantCardProps = $props();

  const statusConfig = {
    active: { label: "Active", class: "bg-success text-success-foreground" },
    inactive: {
      label: "Inactive",
      class: "bg-muted text-muted-foreground",
    },
    pending: {
      label: "Pending",
      class: "bg-warning text-warning-foreground",
    },
  } as const;
</script>

<div
  class="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
>
  <div class="flex items-center gap-3 mb-3">
    <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
      {#if avatar}
        <img src={avatar} alt={name} class="w-full h-full object-cover" />
      {:else}
        <span class="text-lg font-semibold text-foreground">
          {name.charAt(0).toUpperCase()}
        </span>
      {/if}
    </div>

    <div class="flex-1 flex items-center justify-between gap-2 min-w-0">
      <h3 class="text-lg font-semibold text-foreground truncate">{name}</h3>
      <span
        class="px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 {statusConfig[status].class}"
      >
        {statusConfig[status].label}
      </span>
    </div>
  </div>

  <!-- Products Sold -->
  <div class="flex items-center gap-2 text-sm text-muted-foreground mb-3">
    <Icon iconName="icon/trending-up" size={16} />
    <span>{productsSold}+ Product Sold</span>
  </div>
  <div class="border-t border-border mb-3"></div>

  <div class="flex items-center gap-2 text-sm text-muted-foreground mb-4">
    <Icon iconName="icon/shopping-bag" size={16} />
    <span>{category}</span>
  </div>

  <Button
    variant="default"
    class="w-full bg-info text-info-foreground hover:bg-info/90 rounded-md"
    onclick={onHire}
  >
    Hire
  </Button>
</div>
