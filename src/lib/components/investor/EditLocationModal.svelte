<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface EditLocationModalProps {
    isOpen?: boolean;
    merchantName?: string;
    currentLocation?: string;
    onClose?: () => void;
    onConfirm?: (location: string) => void;
  }

  let {
    isOpen = $bindable(false),
    merchantName = "",
    currentLocation = "",
    onClose,
    onConfirm,
  }: EditLocationModalProps = $props();

  let selectedLocation = $state("");
  let locationDropdownOpen = $state(false);

  // Mock location options - replace with real data later
  const locationOptions = [
    "Branch #1",
    "Branch #2",
    "Branch #3",
    "Downtown Branch",
    "Santa Clara Area #1",
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
    selectedLocation = "";
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

  function handleConfirm() {
    if (!selectedLocation) {
      // TODO: Add validation/error messages
      return;
    }

    onConfirm?.(selectedLocation);
    handleClose();
  }

  function toggleLocationDropdown() {
    locationDropdownOpen = !locationDropdownOpen;
  }

  function selectLocation(location: string) {
    selectedLocation = location;
    locationDropdownOpen = false;
  }

  // Filter locations based on search
  const filteredLocations = $derived(
    selectedLocation
      ? locationOptions.filter((loc) =>
          loc.toLowerCase().includes(selectedLocation.toLowerCase())
        )
      : locationOptions
  );

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
      class="bg-white rounded-lg shadow-xl w-full max-w-md"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          Change Merchant Location
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
        <!-- Select New Location -->
        <div class="space-y-2">
          <label
            for="location-select"
            class="text-sm font-medium text-foreground"
          >
            Select New Location
          </label>
          <div class="relative location-dropdown">
            <div class="relative">
              <Icon
                iconName="icon/search"
                size={16}
                class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                id="location-select"
                type="text"
                bind:value={selectedLocation}
                placeholder="Choose a location"
                class="w-full pl-10 pr-10"
                onfocus={() => (locationDropdownOpen = true)}
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2"
                onclick={toggleLocationDropdown}
                aria-label="Toggle dropdown"
              >
                <Icon
                  iconName="icon/chevron-down"
                  size={16}
                  class="text-muted-foreground"
                />
              </button>
            </div>
            {#if locationDropdownOpen && filteredLocations.length > 0}
              <div
                class="absolute z-10 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                role="listbox"
              >
                {#each filteredLocations as location}
                  <button
                    type="button"
                    class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {selectedLocation ===
                    location
                      ? 'bg-muted'
                      : ''}"
                    onclick={() => selectLocation(location)}
                    role="option"
                    aria-selected={selectedLocation === location}
                  >
                    {location}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        </div>

        <!-- Warning Section -->
        <div
          class="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-md"
        >
          <Icon
            iconName="icon/alert-circle"
            size={20}
            class="text-orange-600 shrink-0 mt-0.5"
          />
          <p class="text-sm text-orange-800 leading-relaxed">
            Reassigning this merchant will update their assigned stock and
            reporting data.
          </p>
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
          onclick={handleConfirm}
          class="bg-info text-info-foreground hover:bg-info/90"
        >
          Confirm Change
        </Button>
      </div>
    </div>
  </div>
{/if}
