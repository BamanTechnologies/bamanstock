<script lang="ts">
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { _ } from "svelte-i18n";

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

  const periodOptions = $derived([
    { value: "today",  label: $_('today') },
    { value: "7d",     label: $_('last7Days') },
    { value: "30d",    label: $_('last30Days') },
    { value: "1m",     label: $_('thisMonth') },
    { value: "3m",     label: $_('last3Months') },
    { value: "6m",     label: $_('last6Months') },
    { value: "1y",     label: $_('thisYear') },
    { value: "custom", label: $_('custom') },
  ]);

  let selectedPeriod = $state("6m");
  let startDate = $state(toInputDate(new Date(now.getFullYear(), now.getMonth() - 6, 1)));
  let endDate = $state(toInputDate(now));

  function applyPeriod(period: string) {
    if (period === "custom") return;
    const end = new Date();
    let start = new Date();
    switch (period) {
      case "today": start = new Date(end); break;
      case "7d":    start.setDate(end.getDate() - 7); break;
      case "30d":   start.setDate(end.getDate() - 30); break;
      case "1m":    start = new Date(end.getFullYear(), end.getMonth(), 1); break;
      case "3m":    start = new Date(end.getFullYear(), end.getMonth() - 3, 1); break;
      case "6m":    start = new Date(end.getFullYear(), end.getMonth() - 6, 1); break;
      case "1y":    start = new Date(end.getFullYear(), 0, 1); break;
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

  const isCustom = $derived(selectedPeriod === "custom");
</script>

<div class="bg-card border border-border rounded-lg px-4 py-3">
  <div class="flex items-end gap-3">

    <!-- Period quick-select -->
    <div class="flex-1 min-w-0">
      <label for="{id}-period" class="text-xs font-medium text-muted-foreground mb-1 block">{$_('period')}</label>
      <Dropdown
        id="{id}-period"
        options={periodOptions}
        value={selectedPeriod}
        onchange={handlePeriodChange}
        placeholder={$_('selectPeriod')}
        class="h-7 text-xs px-2"
      />
    </div>

    <!-- From / To — only shown when Custom is selected -->
    {#if isCustom}
      <div class="flex-1 min-w-0">
        <label for="{id}-from" class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterFrom')}</label>
        <input
          id="{id}-from"
          type="date"
          bind:value={startDate}
          oninput={handleDateChange}
          class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
        />
      </div>

      <div class="flex-1 min-w-0">
        <label for="{id}-to" class="text-xs font-medium text-muted-foreground mb-1 block">{$_('filterTo')}</label>
        <input
          id="{id}-to"
          type="date"
          bind:value={endDate}
          min={startDate}
          oninput={handleDateChange}
          class="w-full h-7 px-2 border border-border rounded-md bg-background text-xs text-foreground focus:outline-none focus:ring-0 focus:border-border"
        />
      </div>
    {/if}

    <!-- Dynamic filter dropdowns -->
    {#each filters as filter}
      <div class="flex-1 min-w-0">
        <label for={filter.id} class="text-xs font-medium text-muted-foreground mb-1 block">{filter.label}</label>
        <Dropdown
          id={filter.id}
          options={filter.options}
          value={filter.value ?? ""}
          onchange={filter.onchange}
          placeholder={$_('filterAll')}
          class="h-7 text-xs px-2"
        />
      </div>
    {/each}

  </div>
</div>
