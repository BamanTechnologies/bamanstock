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
    status: "active" | "declined" | "invited";
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

  // Color constants from Figma
  const PRIMARY_BLUE = "var(--primary-blue)";

  let selectedLocation = $state("");
  let categories = $state<string[]>([]);
  let products = $state<string[]>([]);
  let canCreateProduct = $state(false);
  let canAssignStock = $state(true);
  let locationDropdownOpen = $state(false);
  let locationDropdownRef: HTMLDivElement | undefined;

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
    declined: {
      label: "Declined",
      class: "bg-destructive text-destructive-foreground",
    },
    invited: {
      label: "Invited",
      class: "bg-info text-info-foreground",
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

  function toggleLocationDropdown() {
    locationDropdownOpen = !locationDropdownOpen;
  }

  function selectLocation(locationValue: string) {
    selectedLocation = locationValue;
    locationDropdownOpen = false;
  }

  function handleLocationClickOutside(event: MouseEvent) {
    if (locationDropdownRef && !locationDropdownRef.contains(event.target as Node)) {
      locationDropdownOpen = false;
    }
  }

  $effect(() => {
    if (locationDropdownOpen) {
      document.addEventListener("click", handleLocationClickOutside);
      return () => {
        document.removeEventListener("click", handleLocationClickOutside);
      };
    }
  });

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
              <div class="flex items-center gap-2 text-sm" style="color: {PRIMARY_BLUE};">
                <Icon iconName="icon/trending-up" size={16} style="color: {PRIMARY_BLUE};" />
                <span>{merchant.productsSold}+ Product Sold</span>
              </div>
            </div>
          </div>

          <div class="space-y-2 w-full">
            <label class="text-sm font-medium text-foreground">
              Assign Location
            </label>
            <div bind:this={locationDropdownRef} class="relative" style="width: 624px;">
              <button
                type="button"
                class="w-full flex items-center justify-between"
                style="box-sizing: border-box; display: flex; flex-direction: row; align-items: center; padding: 14px 12px; isolation: isolate; width: 624px; height: 46px; background: #FFFFFF; border: 1px solid #D1D5DB; border-radius: 6px; flex: none; order: 1; align-self: stretch; flex-grow: 0;"
                onclick={toggleLocationDropdown}
              >
                <span class="text-sm text-foreground truncate text-left">
                  {selectedLocation
                    ? locationOptions.find((opt) => opt.value === selectedLocation)?.label || "Select Location"
                    : "Select Location"}
                </span>
                <Icon
                  iconName="icon/chevron-down"
                  size={16}
                  class="text-muted-foreground transition-transform flex-shrink-0 {locationDropdownOpen ? 'rotate-180' : ''}"
                />
              </button>

              {#if locationDropdownOpen}
                <div
                  class="absolute top-full left-0 mt-1 w-full bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
                >
                  {#each locationOptions as option}
                    <button
                      type="button"
                      class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors {selectedLocation ===
                      option.value
                        ? 'bg-muted font-medium'
                        : ''}"
                      onclick={() => selectLocation(option.value)}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
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
