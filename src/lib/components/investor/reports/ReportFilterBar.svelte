<script lang="ts">
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
    dateRange?: string;
    filters: Filter[];
  }

  let { id, dateRange = $bindable(""), filters }: Props = $props();

  const today = new Date();
  const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 6, 1);

  function toInputDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  let startDate = $state(toInputDate(sixMonthsAgo));
  let endDate = $state(toInputDate(today));

  const colsClass: Record<number, string> = {
    1: "sm:grid-cols-[auto_1fr_1fr_1fr]",
    2: "sm:grid-cols-[auto_1fr_1fr_1fr_1fr]",
    3: "sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr]",
    4: "sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr]",
  };
  const gridCols = $derived(colsClass[filters.length] ?? "sm:grid-cols-3");
</script>

<div class="bg-card border border-border rounded-lg p-4">
  <div class="flex flex-wrap items-end gap-4">
    <!-- Date From -->
    <div class="min-w-36">
      <label class="text-xs font-medium text-muted-foreground mb-1 block">From</label>
      <input
        type="date"
        bind:value={startDate}
        class="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:border-info"
      />
    </div>

    <!-- Date To -->
    <div class="min-w-36">
      <label class="text-xs font-medium text-muted-foreground mb-1 block">To</label>
      <input
        type="date"
        bind:value={endDate}
        min={startDate}
        class="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:border-info"
      />
    </div>

    <!-- Dynamic filter dropdowns -->
    {#each filters as filter}
      <div class="min-w-32">
        <label class="text-xs font-medium text-muted-foreground mb-1 block">{filter.label}</label>
        <Dropdown
          id={filter.id}
          options={filter.options}
          value={filter.value ?? ""}
          onchange={filter.onchange}
          placeholder="All"
        />
      </div>
    {/each}
  </div>
</div>
