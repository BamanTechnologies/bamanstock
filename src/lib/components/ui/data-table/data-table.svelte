<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (row: T) => any;
  }

  interface Props<T> {
    columns: Column<T>[];
    data: T[];
    searchable?: boolean;
    searchPlaceholder?: string;
    filters?: Array<{
      key: string;
      label: string;
      options: Array<{ value: string; label: string }>;
    }>;
    actions?: Array<{
      icon: any;
      label: string;
      onClick: (row: T) => void;
      variant?: "default" | "destructive";
    }>;
    pagination?: {
      currentPage: number;
      totalPages: number;
      rowsPerPage: number;
      onPageChange: (page: number) => void;
      onRowsPerPageChange: (rows: number) => void;
    };
    onSearch?: (query: string) => void;
    onFilterChange?: (filterKey: string, value: string) => void;
    onRowClick?: (row: T) => void;
  }

  let {
    columns,
    data,
    searchable = true,
    searchPlaceholder = "Search",
    filters = [],
    actions = [],
    pagination,
    onSearch,
    onFilterChange,
    onRowClick,
  }: Props<any> = $props();

  let searchQuery = $state("");
  let filterValues = $state<Record<string, string>>({});
  let sortKey = $state<string | null>(null);
  let sortDir = $state<"asc" | "desc">("asc");

  function handleSearch(value: string) {
    searchQuery = value;
    onSearch?.(value);
  }

  function handleFilterChange(key: string, value: string) {
    filterValues[key] = value;
    onFilterChange?.(key, value);
  }

  function toggleSort(key: string) {
    if (sortKey === key) {
      sortDir = sortDir === "asc" ? "desc" : "asc";
    } else {
      sortKey = key;
      sortDir = "asc";
    }
  }

  const sortedData = $derived.by(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey as string] ?? "";
      const bv = b[sortKey as string] ?? "";
      const cmp = String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  });

  function getVisiblePages(currentPage: number, totalPages: number) {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push("...");
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }
</script>

<div class="bg-card border border-border rounded-lg overflow-hidden">
  <!-- Search and Filters -->
  {#if searchable || filters.length > 0}
    <div class="px-4 py-3 border-b border-border flex items-center gap-3 flex-wrap">
      {#if searchable}
        <div class="flex-1 relative min-w-48">
          <Icon
            iconName="icon/search"
            size={16}
            class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="text"
            placeholder={searchPlaceholder}
            class="w-full pl-9 pr-4 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            value={searchQuery}
            oninput={(e) => handleSearch(e.currentTarget.value)}
          />
        </div>
      {/if}
      {#each filters as filter}
        <div class="min-w-32">
          <Dropdown
            options={filter.options}
            value={filterValues[filter.key] || ""}
            onchange={(v) => handleFilterChange(filter.key, v)}
          />
        </div>
      {/each}
    </div>
  {/if}

  <!-- Table -->
  <div class="overflow-x-auto">
    <table class="w-full text-sm">
      <thead class="bg-muted/30 border-b border-border">
        <tr class="text-left text-xs text-muted-foreground uppercase">
          <th class="px-4 py-3 w-10">
            <input type="checkbox" class="rounded" />
          </th>
          {#each columns as column}
            <th class="px-4 py-3 font-medium">
              {#if column.sortable}
                <button
                  type="button"
                  class="flex items-center gap-1 hover:text-foreground transition-colors"
                  onclick={() => toggleSort(column.key as string)}
                >
                  {column.label}
                  <span class="flex flex-col ml-0.5">
                    <Icon
                      iconName="icon/chevron-up"
                      size={10}
                      class="{sortKey === column.key && sortDir === 'asc' ? 'text-info' : 'text-muted-foreground/50'} -mb-0.5"
                    />
                    <Icon
                      iconName="icon/chevron-down"
                      size={10}
                      class="{sortKey === column.key && sortDir === 'desc' ? 'text-info' : 'text-muted-foreground/50'}"
                    />
                  </span>
                </button>
              {:else}
                {column.label}
              {/if}
            </th>
          {/each}
          {#if actions.length > 0}
            <th class="px-4 py-3 text-right font-medium">Actions</th>
          {/if}
        </tr>
      </thead>
      <tbody class="divide-y divide-border">
        {#each sortedData as row}
          <tr
            class="hover:bg-muted/20 transition-colors {onRowClick ? 'cursor-pointer' : ''}"
            onclick={() => onRowClick?.(row)}
          >
            <td class="px-4 py-4" onclick={(e) => e.stopPropagation()}>
              <input type="checkbox" class="rounded" />
            </td>
            {#each columns as column}
              <td class="px-4 py-4 text-foreground">
                {#if column.render}
                  {@const rendered = column.render(row)}
                  {#if typeof rendered === "string"}
                    {@html rendered}
                  {:else}
                    {rendered}
                  {/if}
                {:else}
                  {row[column.key]}
                {/if}
              </td>
            {/each}
            {#if actions.length > 0}
              <td class="px-4 py-4 text-right" onclick={(e) => e.stopPropagation()}>
                <div class="flex items-center justify-end gap-1">
                  {#each actions as action}
                    <button
                      onclick={() => action.onClick(row)}
                      class="p-1.5 rounded hover:bg-muted transition-colors"
                      aria-label={action.label}
                    >
                      <Icon
                        iconName={action.icon}
                        size={16}
                        class="text-muted-foreground {action.variant === 'destructive' ? 'hover:text-destructive' : 'hover:text-foreground'}"
                      />
                    </button>
                  {/each}
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Pagination -->
  {#if pagination}
    <div class="px-4 py-3 border-t border-border flex items-center justify-between">
      <div class="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Row Per Page</span>
        <select
          class="px-2 py-1 border border-border rounded-md bg-background text-foreground text-sm focus:outline-none"
          value={pagination.rowsPerPage}
          onchange={(e) => pagination.onRowsPerPageChange(Number(e.currentTarget.value))}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>Entries</span>
      </div>
      <div class="flex items-center gap-1">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={pagination.currentPage === 1}
          onclick={() => pagination.onPageChange(pagination.currentPage - 1)}
        >
          <Icon iconName="icon/chevron-left" size={16} class="text-foreground" />
        </button>
        {#each getVisiblePages(pagination.currentPage, pagination.totalPages) as page}
          {#if typeof page === "number"}
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition-colors {page === pagination.currentPage ? 'bg-info text-info-foreground' : 'text-foreground hover:bg-muted'}"
              onclick={() => pagination.onPageChange(page)}
            >
              {page}
            </button>
          {:else}
            <span class="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
          {/if}
        {/each}
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={pagination.currentPage === pagination.totalPages}
          onclick={() => pagination.onPageChange(pagination.currentPage + 1)}
        >
          <Icon iconName="icon/chevron-right" size={16} class="text-foreground" />
        </button>
      </div>
    </div>
  {/if}
</div>
