<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface LocationData {
    name: string;
    address: string;
    description: string;
    status: boolean; // true for Active, false for Inactive
  }

  interface AddLocationModalProps {
    isOpen?: boolean;
    location?: LocationData | null; // If provided, it's edit mode
    onClose?: () => void;
    onSubmit?: (data: LocationData) => void;
  }

  let {
    isOpen = $bindable(false),
    location = null,
    onClose,
    onSubmit,
  }: AddLocationModalProps = $props();

  const isEditMode = $derived(location !== null);

  let locationName = $state(location?.name || "");
  let address = $state(location?.address || "");
  let description = $state(location?.description || "");
  let isActive = $state(location?.status ?? true);

  // Reset form when modal opens/closes or location changes
  $effect(() => {
    if (isOpen) {
      if (location) {
        locationName = location.name;
        address = location.address;
        description = location.description;
        isActive = location.status;
      } else {
        locationName = "";
        address = "";
        description = "";
        isActive = true;
      }
    }
  });

  function handleClose() {
    isOpen = false;
    onClose?.();
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
    if (!locationName || !address) {
      // TODO: Add validation/error messages
      return;
    }

    onSubmit?.({
      name: locationName,
      address,
      description,
      status: isActive,
    });

    handleClose();
  }
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
      class="bg-white rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          {isEditMode ? "Edit Location" : "Create New Location"}
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
        <!-- Location Name -->
        <div class="space-y-2">
          <label
            for="location-name"
            class="text-sm font-medium text-foreground"
          >
            Location Name
          </label>
          <Input
            id="location-name"
            type="text"
            bind:value={locationName}
            placeholder="e.g. Downtown Warehouse"
            class="w-full"
          />
        </div>

        <!-- Address -->
        <div class="space-y-2">
          <label for="address" class="text-sm font-medium text-foreground">
            Address
          </label>
          <textarea
            id="address"
            bind:value={address}
            placeholder="Enter full address"
            rows="3"
            class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 resize-none"
          ></textarea>
        </div>

        <!-- Description -->
        <div class="space-y-2">
          <label for="description" class="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            id="description"
            bind:value={description}
            placeholder="Add any extra detail"
            rows="4"
            class="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 resize-none"
          ></textarea>
        </div>

        <!-- Status Toggle -->
        <div class="flex items-center justify-between">
          <div>
            <label
              for="status-toggle"
              class="text-sm font-medium text-foreground"
            >
              Status
            </label>
            <p class="text-xs text-muted-foreground mt-1">Set as Active</p>
          </div>
          <button
            id="status-toggle"
            type="button"
            role="switch"
            aria-checked={isActive}
            aria-label="Set as Active"
            class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {isActive
              ? 'bg-info'
              : 'bg-muted'}"
            onclick={() => (isActive = !isActive)}
          >
            <span
              class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isActive
                ? 'translate-x-6'
                : 'translate-x-1'}"
            ></span>
          </button>
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
          {isEditMode ? "Update Location" : "Create Location"}
        </Button>
      </div>
    </div>
  </div>
{/if}
