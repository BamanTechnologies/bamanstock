<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import TagInput from "./TagInput.svelte";

  interface AddProductModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onCreate?: (data: {
      productName: string;
      category: string;
      quantity: string;
      unitPrice: string;
      locations: string[];
      description: string;
      image?: File;
    }) => void;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    onCreate,
  }: AddProductModalProps = $props();

  let productName = $state("");
  let category = $state("");
  let quantity = $state("");
  let unitPrice = $state("");
  let locations = $state<string[]>([]);
  let description = $state("");
  let selectedImage = $state<File | undefined>(undefined);
  let imagePreview = $state<string | undefined>(undefined);
  let locationSearchQuery = $state("");
  let locationDropdownOpen = $state(false);

  // Mock location options - replace with real data later
  const locationOptions = [
    "Warehouse #1",
    "Warehouse #2",
    "Santa Clara Area #1",
    "Branch #1",
    "Branch #2",
    "Branch #3",
    "Downtown Branch",
  ];

  const filteredLocations = $derived(
    locationOptions.filter(
      (loc) =>
        loc.toLowerCase().includes(locationSearchQuery.toLowerCase()) &&
        !locations.includes(loc)
    )
  );

  function handleClose() {
    isOpen = false;
    onClose?.();
    // Reset form
    productName = "";
    category = "";
    quantity = "";
    unitPrice = "";
    locations = [];
    description = "";
    selectedImage = undefined;
    imagePreview = undefined;
    locationSearchQuery = "";
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

  function handleImageUpload(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.type.startsWith("image/")) {
      selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
  }

  function handleCreate() {
    if (
      !productName ||
      !category ||
      !quantity ||
      !unitPrice ||
      locations.length === 0
    ) {
      // TODO: Add validation/error messages
      alert("Please fill in all required fields.");
      return;
    }

    onCreate?.({
      productName,
      category,
      quantity,
      unitPrice,
      locations,
      description,
      image: selectedImage,
    });

    handleClose();
  }

  function addLocation(location: string) {
    if (!locations.includes(location)) {
      locations = [...locations, location];
      locationSearchQuery = "";
      locationDropdownOpen = false;
    }
  }

  function removeLocation(location: string) {
    locations = locations.filter((loc) => loc !== location);
  }

  // Close dropdown when clicking outside
  $effect(() => {
    if (locationDropdownOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest(".location-dropdown")) {
          locationDropdownOpen = false;
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
      class="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          Add New Product
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
        <!-- Two Column Layout for Form Fields -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Product Name -->
          <div class="space-y-2">
            <label
              for="product-name"
              class="text-sm font-medium text-foreground"
            >
              Product Name
            </label>
            <Input
              id="product-name"
              type="text"
              bind:value={productName}
              placeholder="Search for a stock by name"
              class="w-full"
            />
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label for="category" class="text-sm font-medium text-foreground">
              Category
            </label>
            <Input
              id="category"
              type="text"
              bind:value={category}
              placeholder="Enter Category"
              class="w-full"
            />
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

          <!-- Unit Price -->
          <div class="space-y-2">
            <label for="unit-price" class="text-sm font-medium text-foreground">
              Unit Price
            </label>
            <Input
              id="unit-price"
              type="text"
              bind:value={unitPrice}
              placeholder="$150"
              class="w-full"
            />
          </div>
        </div>

        <!-- Location (Full Width) -->
        <div class="space-y-2">
          <label for="location" class="text-sm font-medium text-foreground">
            Location
          </label>
          <div class="relative location-dropdown">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={16}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="location"
                type="text"
                bind:value={locationSearchQuery}
                placeholder="Search Location"
                class="w-full pl-10 pr-10"
                onfocus={() => (locationDropdownOpen = true)}
              />
              <Icon
                iconName="icon/chevron-down"
                size={16}
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
            </div>
            {#if locationDropdownOpen && filteredLocations.length > 0}
              <div
                class="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-60 overflow-auto"
                role="listbox"
              >
                {#each filteredLocations as loc}
                  <button
                    type="button"
                    class="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted"
                    onmousedown={() => addLocation(loc)}
                    role="option"
                  >
                    {loc}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
          <!-- Selected Locations as Tags -->
          {#if locations.length > 0}
            <div class="flex flex-wrap gap-2 mt-2">
              {#each locations as location}
                <span
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-info/10 text-info text-sm font-medium"
                >
                  {location}
                  <button
                    type="button"
                    onclick={() => removeLocation(location)}
                    class="hover:bg-info/20 rounded-full p-0.5"
                    aria-label="Remove {location}"
                  >
                    <Icon iconName="icon/x" size={14} class="text-info" />
                  </button>
                </span>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Description (Full Width) -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Enter product description"
            rows={4}
            class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 resize-none"
          ></textarea>
        </div>

        <!-- Upload Image Section -->
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground">Upload Image</label
          >
          <div
            class="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-info transition-colors {imagePreview
              ? 'bg-muted/30'
              : 'bg-muted/10'}"
            ondrop={handleDrop}
            ondragover={handleDragOver}
            onclick={() => document.getElementById("image-upload")?.click()}
            role="button"
            tabindex="0"
            onkeydown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                document.getElementById("image-upload")?.click();
              }
            }}
          >
            <input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              class="hidden"
              onchange={handleImageUpload}
            />
            {#if imagePreview}
              <img
                src={imagePreview}
                alt="Product preview"
                class="max-w-full max-h-64 mx-auto rounded-lg mb-4"
              />
            {:else}
              <div class="flex flex-col items-center gap-3">
                <Icon
                  iconName="icon/upload"
                  size={48}
                  class="text-muted-foreground"
                />
                <div class="text-sm text-foreground">
                  <p class="font-medium">Click to upload or drag and drop</p>
                  <p class="text-muted-foreground mt-1">
                    JPG, PNG, or GIF (MAX 800x400 px)
                  </p>
                </div>
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
          onclick={handleCreate}
          class="bg-info text-info-foreground hover:bg-info/90"
        >
          Create Product
        </Button>
      </div>
    </div>
  </div>
{/if}
