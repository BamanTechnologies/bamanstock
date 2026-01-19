<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  interface FilterDropdownProps {
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
    placeholder?: string;
  }

  let {
    label,
    options,
    value = $bindable(""),
    placeholder = "Select...",
  }: FilterDropdownProps = $props();

  let isOpen = $state(false);
  let dropdownRef: HTMLDivElement;

  function toggleDropdown() {
    isOpen = !isOpen;
  }

  function selectOption(optionValue: string) {
    value = optionValue;
    isOpen = false;
  }

  function handleClickOutside(event: MouseEvent) {
    if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
      isOpen = false;
    }
  }

  $effect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }
  });
</script>

<div bind:this={dropdownRef} class="relative">
  <button
    type="button"
    class="flex items-center justify-between gap-2 px-4 py-2 h-9 bg-background border border-input rounded-md hover:bg-muted transition-colors min-w-[140px] text-sm"
    onclick={toggleDropdown}
  >
    <span class="text-sm text-foreground truncate">
      {value
        ? options.find((opt) => opt.value === value)?.label || label
        : label}
    </span>
    <Icon
      iconName="icon/chevron-down"
      size={16}
      class="text-muted-foreground transition-transform flex-shrink-0 {isOpen ? 'rotate-180' : ''}"
    />
  </button>

  {#if isOpen}
    <div
      class="absolute top-full left-0 mt-1 w-full bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
    >
      {#each options as option}
        <button
          type="button"
          class="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors {value ===
          option.value
            ? 'bg-muted font-medium'
            : ''}"
          onclick={() => selectOption(option.value)}
        >
          {option.label}
        </button>
      {/each}
    </div>
  {/if}
</div>
