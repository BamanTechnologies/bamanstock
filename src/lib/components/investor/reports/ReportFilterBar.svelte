<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  interface FilterOption {
    value: string;
    label: string;
  }

  interface Filter {
    id: string;
    label: string;
    options: FilterOption[];
    value?: string;
    onchange?: (value: string) => void;
  }

  interface Props {
    id: string;
    dateRange: string;
    filters: Filter[];
  }

  let { id, dateRange = $bindable(), filters }: Props = $props();

  // Map filter count → responsive grid columns (date input + N filters)
  const colsClass: Record<number, string> = {
    1: "sm:grid-cols-2",
    2: "sm:grid-cols-3",
    3: "sm:grid-cols-2 lg:grid-cols-4",
    4: "sm:grid-cols-2 lg:grid-cols-5",
  };
  const gridCols = $derived(colsClass[filters.length] ?? "sm:grid-cols-3");
</script>

<div class="bg-card border border-border rounded-lg p-6">
  <div class="grid grid-cols-1 {gridCols} gap-4">
    <!-- Date Range -->
    <div>
      <label for={id} class="text-sm font-medium text-foreground mb-2 block">
        Choose Date
      </label>
      <div class="relative">
        <Icon
          iconName="icon/calendar"
          size={16}
          class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          {id}
          type="text"
          bind:value={dateRange}
          readonly
          class="w-full h-9 pl-10 pr-4 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-1 cursor-pointer"
        />
      </div>
    </div>

    <!-- Dynamic filter dropdowns -->
    {#each filters as filter}
      <div>
        <Dropdown
          id={filter.id}
          label={filter.label}
          options={filter.options}
          value={filter.value ?? ""}
          onchange={filter.onchange}
          placeholder="All"
        />
      </div>
    {/each}
  </div>
</div>
