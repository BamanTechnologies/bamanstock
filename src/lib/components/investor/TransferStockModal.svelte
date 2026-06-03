<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface TransferStockModalProps {
    isOpen?: boolean;
    sourceLocation?: string;
    onClose?: () => void;
    onTransfer?: (data: {
      product: string;
      sourceLocation: string;
      targetLocation: string;
      quantity: string;
    }) => void;
  }

  let {
    isOpen = $bindable(false),
    sourceLocation = "",
    onClose,
    onTransfer,
  }: TransferStockModalProps = $props();

  let selectedProduct = $state("");
  let selectedTargetLocation = $state("");
  let quantity = $state("");
  let productDropdownOpen = $state(false);
  let targetLocationDropdownOpen = $state(false);

  // Mock products - replace with real data later
  const products = [
    "Lenovo IdeaPad 3",
    "Beats Pro",
    "Nike Jordan",
    "Apple Series 5 Watch",
    "Amazon Echo Dot",
    "Sanford Chair Sofa",
    "Red Premium Satchel",
    "Iphone 14 Pro",
    "Gaming Chair",
    "Borealis Backpack",
  ];

  // Mock location options - replace with real data later
  const locationOptions = [
    "Santa Clara Area #1",
    "Branch #1",
    "Branch #2",
    "Branch #3",
    "Downtown Branch",
    "Addis Ababa",
    "Dire Dawa",
    "Hawassa",
    "Bahir Dar",
    "Mekelle",
  ];

  function handleClose() {
    isOpen = false;
    onClose?.();
    // Reset form
    selectedProduct = "";
    selectedTargetLocation = "";
    quantity = "";
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

  function handleSubmit() {
    if (
      !selectedProduct ||
      !sourceLocation ||
      !selectedTargetLocation ||
      !quantity
    ) {
      // TODO: Add validation/error messages
      return;
    }

    onTransfer?.({
      product: selectedProduct,
      sourceLocation,
      targetLocation: selectedTargetLocation,
      quantity,
    });

    handleClose();
  }

  function toggleProductDropdown() {
    productDropdownOpen = !productDropdownOpen;
  }

  function selectProduct(product: string) {
    selectedProduct = product;
    productDropdownOpen = false;
  }

  function toggleTargetLocationDropdown() {
    targetLocationDropdownOpen = !targetLocationDropdownOpen;
  }

  function selectTargetLocation(location: string) {
    selectedTargetLocation = location;
    targetLocationDropdownOpen = false;
  }

  // Filter products based on search
  const filteredProducts = $derived(
    selectedProduct
      ? products.filter((product) =>
          product.toLowerCase().includes(selectedProduct.toLowerCase())
        )
      : products
  );

  // Filter target locations (exclude source location)
  const availableTargetLocations = $derived(
    locationOptions.filter((loc) => loc !== sourceLocation)
  );

  // Close dropdowns when clicking outside
  $effect(() => {
    if (productDropdownOpen || targetLocationDropdownOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest(".product-dropdown") &&
          !target.closest(".target-location-dropdown")
        ) {
          productDropdownOpen = false;
          targetLocationDropdownOpen = false;
        }
      };
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  });
</script>

{#if isOpen}
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleEscape}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          Transfer Stock
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

      <!-- Form Content -->
      <div class="p-6 space-y-6">
        <!-- Select Product -->
        <div class="space-y-2">
          <label
            for="product-select"
            class="text-sm font-medium text-foreground"
          >
            Select Product
          </label>
          <div class="relative product-dropdown">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={16}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="product-select"
                type="text"
                bind:value={selectedProduct}
                placeholder="Search for a stock by name"
                class="w-full pl-10 pr-10"
                onfocus={() => (productDropdownOpen = true)}
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2"
                onclick={toggleProductDropdown}
                aria-label="Toggle dropdown"
              >
                <Icon
                  iconName="icon/chevron-down"
                  size={16}
                  class="text-muted-foreground"
                />
              </button>
            </div>
            {#if productDropdownOpen && filteredProducts.length > 0}
              <div
                class="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {#each filteredProducts as product}
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {selectedProduct ===
                    product
                      ? 'bg-muted'
                      : ''}"
                    onclick={() => selectProduct(product)}
                    role="option"
                    aria-selected={selectedProduct === product}
                  >
                    {product}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Source Location -->
        <div class="space-y-2">
          <label
            for="source-location-select"
            class="text-sm font-medium text-foreground"
          >
            Source Location
          </label>
          <div class="relative source-location-dropdown">
            <Input
              id="source-location-select"
              type="text"
              value={sourceLocation}
              readonly
              class="w-full pr-10 bg-background cursor-default"
            />
            <Icon
              iconName="icon/chevron-down"
              size={16}
              class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
          </div>
        </div>

        <!-- Target Location -->
        <div class="space-y-2">
          <label
            for="target-location-select"
            class="text-sm font-medium text-foreground"
          >
            Target Location
          </label>
          <div class="relative target-location-dropdown">
            <button
              id="target-location-select"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
              onclick={toggleTargetLocationDropdown}
              aria-expanded={targetLocationDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Select Destination"
            >
              <span
                class={selectedTargetLocation
                  ? "text-foreground"
                  : "text-muted-foreground"}
              >
                {selectedTargetLocation || "Select Destination"}
              </span>
              <Icon
                iconName="icon/chevron-down"
                size={16}
                class="text-muted-foreground"
              />
            </button>
            {#if targetLocationDropdownOpen}
              <div
                class="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {#each availableTargetLocations as location}
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {selectedTargetLocation ===
                    location
                      ? 'bg-muted'
                      : ''}"
                    onclick={() => selectTargetLocation(location)}
                    role="option"
                    aria-selected={selectedTargetLocation === location}
                  >
                    {location}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Quantity -->
        <div class="space-y-2">
          <label for="quantity" class="text-sm font-medium text-foreground">
            Quantity
          </label>
          <Input
            id="quantity"
            type="number"
            bind:value={quantity}
            placeholder="e.g., 100"
            class="w-full"
          />
        </div>
      </div>

      <!-- Footer with Action Buttons -->
      <div
        class="flex items-center justify-end gap-3 p-6 border-t border-border"
      >
        <Button
          variant="outline"
          onclick={handleClose}
          class="border-border text-foreground hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          onclick={handleSubmit}
          class="bg-info text-info-foreground hover:bg-info/90"
        >
          Transfer Stock
        </Button>
      </div>
    </div>
  </div>
{/if}
