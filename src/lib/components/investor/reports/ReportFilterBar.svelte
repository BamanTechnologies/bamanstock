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

  function toInputDate(d: Date) {
    return d.toISOString().slice(0, 10);
  }

  const now = new Date();

  const periodOptions = [
    { value: "today",   label: "Today" },
    { value: "7d",      label: "Last 7 Days" },
    { value: "30d",     label: "Last 30 Days" },
    { value: "1m",      label: "This Month" },
    { value: "3m",      label: "Last 3 Months" },
    { value: "6m",      label: "Last 6 Months" },
    { value: "1y",      label: "This Year" },
    { value: "custom",  label: "Custom" },
  ];

  let selectedPeriod = $state("6m");
  let startDate = $state(toInputDate(new Date(now.getFullYear(), now.getMonth() - 6, 1)));
  let endDate = $state(toInputDate(now));

  function applyPeriod(period: string) {
    const end = new Date();
    let start = new Date();

    switch (period) {
      case "today":
        start = new Date(end);
        break;
      case "7d":
        start.setDate(end.getDate() - 7);
        break;
      case "30d":
        start.setDate(end.getDate() - 30);
        break;
      case "1m":
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case "3m":
        start = new Date(end.getFullYear(), end.getMonth() - 3, 1);
        break;
      case "6m":
        start = new Date(end.getFullYear(), end.getMonth() - 6, 1);
        break;
      case "1y":
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case "custom":
        return; // keep existing from/to values
    }

    startDate = toInputDate(start);
    endDate = toInputDate(end);
  }

  function handlePeriodChange(value: string) {
    selectedPeriod = value;
    applyPeriod(value);
  }

  function handleDateChange() {
    selectedPeriod = "custom";
  }
</script>

<div class="bg-card border border-border rounded-lg p-4">
  <div class="flex flex-wrap items-end gap-4">

    <!-- Period quick-select -->
    <div class="min-w-36">
      <label for="{id}-period" class="text-xs font-medium text-muted-foreground mb-1 block">Period</label>
      <Dropdown
        id="{id}-period"
        options={periodOptions}
        value={selectedPeriod}
        onchange={handlePeriodChange}
        placeholder="Select period"
      />
    </div>

    <!-- Date From -->
    <div class="min-w-36">
      <label for="{id}-from" class="text-xs font-medium text-muted-foreground mb-1 block">From</label>
      <input
        id="{id}-from"
        type="date"
        bind:value={startDate}
        oninput={handleDateChange}
        class="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:border-info"
      />
    </div>

    <!-- Date To -->
    <div class="min-w-36">
      <label for="{id}-to" class="text-xs font-medium text-muted-foreground mb-1 block">To</label>
      <input
        id="{id}-to"
        type="date"
        bind:value={endDate}
        min={startDate}
        oninput={handleDateChange}
        class="w-full h-9 px-3 border border-border rounded-md bg-background text-sm text-foreground focus:outline-none focus:border-info"
      />
    </div>

    <!-- Dynamic filter dropdowns -->
    {#each filters as filter}
      <div class="min-w-32">
        <label for={filter.id} class="text-xs font-medium text-muted-foreground mb-1 block">{filter.label}</label>
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
