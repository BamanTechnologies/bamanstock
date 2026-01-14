<script lang="ts">
  import { Input } from "$lib/components/ui/input/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";

  interface SearchBarProps {
    placeholder?: string;
    value?: string;
  }

  let {
    placeholder = "Search merchants by name, location, or business type",
    value = $bindable(""),
  }: SearchBarProps = $props();
</script>

<div class="relative">
  <div class="absolute left-3 top-1/2 -translate-y-1/2 z-10">
    <Icon iconName="icon/search" size={20} class="text-muted-foreground" />
  </div>
  <Input
    type="text"
    bind:value
    {placeholder}
    class="pl-10 w-full h-9"
  />
</div>
