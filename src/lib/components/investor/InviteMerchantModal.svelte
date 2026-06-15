<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface InviteMerchantModalProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSendInvitation?: (data: {
      name: string;
      email: string;
      phone: string;
      location: string;
      canCreateProduct: boolean;
      canAssignStock: boolean;
    }) => void;
  }

  let {
    isOpen = $bindable(false),
    onClose,
    onSendInvitation,
  }: InviteMerchantModalProps = $props();

  let merchantName = $state("");
  let email = $state("");
  let phone = $state("");
  let selectedLocation = $state("");
  let canCreateProduct = $state(false);
  let canAssignStock = $state(true);
  let locationDropdownOpen = $state(false);

  const locationOptions = [
    { value: "", label: "Select Location" },
    { value: "branch-1", label: "Branch #1" },
    { value: "branch-2", label: "Branch #2" },
    { value: "branch-3", label: "Branch #3" },
    { value: "downtown", label: "Downtown Branch" },
  ];

  function handleClose() {
    isOpen = false;
    onClose?.();
    // Reset form
    merchantName = "";
    email = "";
    phone = "";
    selectedLocation = "";
    canCreateProduct = false;
    canAssignStock = true;
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
    if (!merchantName || !email || !phone || !selectedLocation) {
      // TODO: Add validation/error messages
      return;
    }

    onSendInvitation?.({
      name: merchantName,
      email,
      phone,
      location: selectedLocation,
      canCreateProduct,
      canAssignStock,
    });

    handleClose();
  }

  function toggleLocationDropdown() {
    locationDropdownOpen = !locationDropdownOpen;
  }

  function selectLocation(location: { value: string; label: string }) {
    selectedLocation = location.value;
    locationDropdownOpen = false;
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
      class="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="document"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 id="modal-title" class="text-xl font-bold text-foreground">
          Invite New Merchant
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
        <!-- Form Fields - Two Columns -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Merchant Name -->
          <div class="space-y-2">
            <label
              for="merchant-name"
              class="text-sm font-medium text-foreground"
            >
              Merchant Name
            </label>
            <Input
              id="merchant-name"
              type="text"
              bind:value={merchantName}
              placeholder="Enter full name"
              class="w-full"
            />
          </div>

          <!-- Email -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              bind:value={email}
              placeholder="Enter email address"
              class="w-full"
            />
          </div>

          <!-- Phone Number -->
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium text-foreground">
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              bind:value={phone}
              placeholder="Enter phone number"
              class="w-full"
            />
          </div>

          <!-- Assign Location -->
          <div class="space-y-2">
            <label
              for="location-select"
              class="text-sm font-medium text-foreground"
            >
              Assign Location
            </label>
            <div class="relative location-dropdown">
              <button
                id="location-select"
                type="button"
                class="w-full flex items-center justify-between px-3 py-2 border border-input rounded-md bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1"
                onclick={toggleLocationDropdown}
                aria-expanded={locationDropdownOpen}
                aria-haspopup="listbox"
                aria-label="Select Location"
              >
                <span
                  class={selectedLocation
                    ? "text-foreground"
                    : "text-muted-foreground"}
                >
                  {selectedLocation
                    ? locationOptions.find(
                        (opt) => opt.value === selectedLocation
                      )?.label
                    : "Select Location"}
                </span>
                <Icon
                  iconName="icon/chevron-down"
                  size={16}
                  class="text-muted-foreground"
                />
              </button>
              {#if locationDropdownOpen}
                <div
                  class="absolute z-10 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-60 overflow-auto"
                  role="listbox"
                >
                  {#each locationOptions.filter((opt) => opt.value !== "") as option}
                    <button
                      type="button"
                      class="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors {selectedLocation ===
                      option.value
                        ? 'bg-muted'
                        : ''}"
                      onclick={() => selectLocation(option)}
                      role="option"
                      aria-selected={selectedLocation === option.value}
                    >
                      {option.label}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <!-- Permissions Section -->
        <div class="space-y-4 pt-4 border-t border-border">
          <h3 class="text-sm font-medium text-foreground">Permission</h3>
          <div class="space-y-4">
            <!-- Create Product Toggle -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-foreground">Create Product</span>
              <button
                type="button"
                role="switch"
                aria-checked={canCreateProduct}
                aria-label="Create Product"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {canCreateProduct
                  ? 'bg-info'
                  : 'bg-muted'}"
                onclick={() => (canCreateProduct = !canCreateProduct)}
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {canCreateProduct
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </div>

            <!-- Assign Stock Toggle -->
            <div class="flex items-center justify-between">
              <span class="text-sm text-foreground">Assign Stock</span>
              <button
                type="button"
                role="switch"
                aria-checked={canAssignStock}
                aria-label="Assign Stock"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {canAssignStock
                  ? 'bg-info'
                  : 'bg-muted'}"
                onclick={() => (canAssignStock = !canAssignStock)}
              >
                <span
                  class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {canAssignStock
                    ? 'translate-x-6'
                    : 'translate-x-1'}"
                ></span>
              </button>
            </div>
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
          class="bg-[var(--primary-blue)] text-white hover:opacity-90"
        >
          Send Invitation
        </Button>
      </div>
    </div>
  </div>
{/if}
