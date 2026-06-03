<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface AssignStockModalProps {
    isOpen?: boolean;
    merchantName?: string;
    onClose?: () => void;
    onAssign?: (data: {
      stockItem: string;
      quantity: string;
      unitValue: string;
      category: string;
    }) => void;
  }

  let {
    isOpen = $bindable(false),
    merchantName = "",
    onClose,
    onAssign,
  }: AssignStockModalProps = $props();

  let stockItem = $state("");
  let quantity = $state("");
  let unitValue = $state("");
  let selectedCategory = $state("");
  let stockItemDropdownOpen = $state(false);
  let categoryDropdownOpen = $state(false);

  // Mock stock items - replace with real data later
  const stockItems = [
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

  const categories = [
    "Electronics",
    "Cloth",
    "Furniture",
    "Accessories",
    "Sports",
    "Home & Kitchen",
  ];

  function handleClose() {
    isOpen = false;
    onClose?.();
    // Reset form
    stockItem = "";
    quantity = "";
    unitValue = "";
    selectedCategory = "";
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
    if (!stockItem || !quantity || !unitValue || !selectedCategory) {
      // TODO: Add validation/error messages
      return;
    }

    onAssign?.({
      stockItem,
      quantity,
      unitValue,
      category: selectedCategory,
    });

    handleClose();
  }

  function toggleStockItemDropdown() {
    stockItemDropdownOpen = !stockItemDropdownOpen;
  }

  function selectStockItem(item: string) {
    stockItem = item;
    stockItemDropdownOpen = false;
  }

  function toggleCategoryDropdown() {
    categoryDropdownOpen = !categoryDropdownOpen;
  }

  function selectCategory(category: string) {
    selectedCategory = category;
    categoryDropdownOpen = false;
  }

  // Filter stock items based on search
  const filteredStockItems = $derived(
    stockItem
      ? stockItems.filter((item) =>
          item.toLowerCase().includes(stockItem.toLowerCase())
        )
      : stockItems
  );

  // Close dropdowns when clicking outside
  $effect(() => {
    if (stockItemDropdownOpen || categoryDropdownOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (
          !target.closest(".stock-item-dropdown") &&
          !target.closest(".category-dropdown")
        ) {
          stockItemDropdownOpen = false;
          categoryDropdownOpen = false;
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
          Assign Stock to Merchant
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
        <!-- Stock Item -->
        <div class="space-y-2">
          <label for="stock-item" class="text-sm font-medium text-foreground">
            Stock Item
          </label>
          <div class="relative stock-item-dropdown">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={16}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="stock-item"
                type="text"
                bind:value={stockItem}
                placeholder="Search for a stock by name"
                class="w-full pl-10 pr-10"
                onfocus={() => (stockItemDropdownOpen = true)}
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2"
                onclick={toggleStockItemDropdown}
                aria-label="Toggle dropdown"
              >
                <Icon
                  iconName="icon/chevron-down"
                  size={16}
                  class="text-muted-foreground"
                />
              </button>
            </div>
            {#if stockItemDropdownOpen && filteredStockItems.length > 0}
              <div
                class="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {#each filteredStockItems as item}
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {stockItem ===
                    item
                      ? 'bg-muted'
                      : ''}"
                    onclick={() => selectStockItem(item)}
                    role="option"
                    aria-selected={stockItem === item}
                  >
                    {item}
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

        <!-- Unit Value -->
        <div class="space-y-2">
          <label for="unit-value" class="text-sm font-medium text-foreground">
            Unit Value
          </label>
          <Input
            id="unit-value"
            type="text"
            bind:value={unitValue}
            placeholder="Enter unit price"
            class="w-full"
          />
        </div>

        <!-- Category -->
        <div class="space-y-2">
          <label
            for="category-select"
            class="text-sm font-medium text-foreground"
          >
            Category
          </label>
          <div class="relative category-dropdown">
            <button
              id="category-select"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
              onclick={toggleCategoryDropdown}
              aria-expanded={categoryDropdownOpen}
              aria-haspopup="listbox"
              aria-label="Select Category"
            >
              <span
                class={selectedCategory
                  ? "text-foreground"
                  : "text-muted-foreground"}
              >
                {selectedCategory || "Select Category"}
              </span>
              <Icon
                iconName="icon/chevron-down"
                size={16}
                class="text-muted-foreground"
              />
            </button>
            {#if categoryDropdownOpen}
              <div
                class="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {#each categories as category}
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {selectedCategory ===
                    category
                      ? 'bg-muted'
                      : ''}"
                    onclick={() => selectCategory(category)}
                    role="option"
                    aria-selected={selectedCategory === category}
                  >
                    {category}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
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
          Assign
        </Button>
      </div>
    </div>
  </div>
{/if}
