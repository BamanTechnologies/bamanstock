<script lang="ts">
  interface FilterDropdownProps {
    label: string;
    options: Array<{ value: string; label: string }>;
    value?: string;
  }

  let {
    label,
    options,
    value = $bindable(""),
  }: FilterDropdownProps = $props();
</script>

<select
  bind:value
  class="text-sm border border-border rounded-lg px-3 py-2 bg-transparent text-foreground focus:outline-none cursor-pointer min-w-30"
>
  <option value="">{label}</option>
  {#each options.filter(o => o.value !== "") as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
