<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import FilterDropdown from "./FilterDropdown.svelte";
  import TagInput from "./TagInput.svelte";
  import ToggleSwitch from "./ToggleSwitch.svelte";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { onMount } from "svelte";

  interface Merchant {
    id: number;
    name: string;
    avatar?: string;
    status: "active" | "inactive" | "pending";
    productsSold: number;
    category: string;
  }

  interface HireMerchantModalProps {
    merchant?: Merchant;
    isOpen?: boolean;
    onClose?: () => void;
    onSendInvitation?: (data: {
      location: string;
      categories: string[];
      products: string[];
      canCreateProduct: boolean;
      canAssignStock: boolean;
    }) => void;
  }

  let {
    merchant,
    isOpen = $bindable(false),
    onClose,
    onSendInvitation,
  }: HireMerchantModalProps = $props();

  let selectedLocation = $state("");
  let categories = $state<string[]>([]);
  let products = $state<string[]>([]);
  let canCreateProduct = $state(false);
  let canAssignStock = $state(true);

  const locationOptions = [
    { value: "", label: "Select Location" },
    { value: "addis-ababa", label: "Addis Ababa" },
    { value: "dire-dawa", label: "Dire Dawa" },
    { value: "hawassa", label: "Hawassa" },
    { value: "bahir-dar", label: "Bahir Dar" },
    { value: "mekelle", label: "Mekelle" },
  ];

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

  function handleClose() {
    isOpen = false;
    onClose?.();
  }

  function handleSendInvitation() {
    if (!merchant) return;

    onSendInvitation?.({
      location: selectedLocation,
      categories,
      products,
      canCreateProduct,
      canAssignStock,
    });

    // Reset form
    selectedLocation = "";
    categories = [];
    products = [];
    canCreateProduct = false;
    canAssignStock = true;

    handleClose();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleEscape(e: KeyboardEvent) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  onMount(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleEscape);
        document.body.style.overflow = "";
      };
    }
  });

  $effect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <div
      class="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          Hire Merchant
        </h2>
        <button
          type="button"
          class="p-1 rounded-md hover:bg-muted transition-colors"
          onclick={handleClose}
          aria-label="Close modal"
        >
          <Icon iconName="icon/x" size={20} class="text-foreground" />
        </button>
      </div>

      <div class="p-6 space-y-6">
        {#if merchant}
          <div class="flex items-center gap-3 pb-4 border-b border-border">
            <div
              class="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden flex-shrink-0"
            >
              {#if merchant.avatar}
                <img
                  src={merchant.avatar}
                  alt={merchant.name}
                  class="w-full h-full object-cover"
                />
              {:else}
                <span class="text-lg font-semibold text-foreground">
                  {merchant.name.charAt(0).toUpperCase()}
                </span>
              {/if}
            </div>

            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <h3 class="text-lg font-semibold text-foreground">
                  {merchant.name}
                </h3>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-medium {statusConfig[merchant.status].class}"
                >
                  {statusConfig[merchant.status].label}
                </span>
              </div>
              <div class="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon iconName="icon/trending-up" size={16} />
                <span>{merchant.productsSold}+ Product Sold</span>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">
              Assign Location
            </label>
            <FilterDropdown
              label="Select Location"
              options={locationOptions}
              bind:value={selectedLocation}
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">
              Assign Stock Categories
            </label>
            <TagInput
              bind:tags={categories}
              placeholder="Add Category"
            />
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">
              Assign Stock Product
            </label>
            <TagInput bind:tags={products} placeholder="Search products" />
          </div>

          <div class="space-y-3">
            <label class="text-sm font-medium text-foreground">Permission</label>
            <div class="space-y-2">
              <ToggleSwitch
                label="Create Product"
                bind:checked={canCreateProduct}
              />
              <ToggleSwitch
                label="Assign Stock"
                bind:checked={canAssignStock}
              />
            </div>
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        <Button variant="outline" onclick={handleClose}> Cancel </Button>
        <Button
          variant="default"
          class="bg-info text-info-foreground hover:bg-info/90"
          onclick={handleSendInvitation}
        >
          Send Invitation
        </Button>
      </div>
    </div>
  </div>
{/if}
