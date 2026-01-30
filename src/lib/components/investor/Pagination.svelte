<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  interface PaginationProps {
    currentPage?: number;
    totalPages?: number;
    rowsPerPage?: number;
    totalEntries?: number;
    onPageChange?: (page: number) => void;
    onRowsPerPageChange?: (rows: number) => void;
  }

  let {
    currentPage = $bindable(1),
    totalPages = 15,
    rowsPerPage = $bindable(12),
    totalEntries = 180,
    onPageChange,
    onRowsPerPageChange,
  }: PaginationProps = $props();

  const rowsPerPageOptions = [12, 24, 36, 48];

  const rowsPerPageString = $derived(String(rowsPerPage));

  function handlePageChange(page: number) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      onPageChange?.(page);
    }
  }

  function handleRowsPerPageChange(rows: number) {
    rowsPerPage = rows;
    onRowsPerPageChange?.(rows);
    currentPage = 1;
  }

  function getVisiblePages() {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  }
</script>

<div
  class="flex flex-row items-center justify-between flex-none"
  style="padding: 15px 0px; gap: 4px; width: 100%; max-width: 1356px; height: 58px; border-radius: 0px 0px 5px 5px; flex-grow: 0;"
>
  <div class="flex items-center" style="gap: 8px;">
    <span class="text-sm text-muted-foreground">Row Per Page</span>
    <Dropdown
      value={rowsPerPageString}
      options={rowsPerPageOptions.map((opt) => ({
        value: String(opt),
        label: String(opt),
      }))}
      onchange={(value) => handleRowsPerPageChange(Number(value))}
      class="min-w-[80px]"
    />
    <span class="text-sm text-muted-foreground">Entries</span>
  </div>

  <div class="flex items-center" style="gap: 8px;">
    <button
      type="button"
      class="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={() => handlePageChange(currentPage - 1)}
      disabled={currentPage === 1}
      aria-label="Previous page"
    >
      <Icon iconName="icon/chevron-left" size={16} class="text-foreground" />
    </button>

    {#each getVisiblePages() as page}
      {#if typeof page === "number"}
        <button
          type="button"
          class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors {currentPage ===
          page
            ? 'bg-info text-info-foreground'
            : 'text-foreground border border-border hover:bg-muted'}"
          onclick={() => handlePageChange(page)}
        >
          {page}
        </button>
      {:else}
        <span class="px-2 text-muted-foreground">...</span>
      {/if}
    {/each}

    <button
      type="button"
      class="p-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={() => handlePageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      aria-label="Next page"
    >
      <Icon iconName="icon/chevron-right" size={16} class="text-foreground" />
    </button>
  </div>
</div>
