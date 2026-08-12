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

<div
  class="flex flex-col justify-center items-start w-full flex-none"
  style="max-width: 484px; flex-grow: 0;"
>
  <div
    class="flex flex-row items-center flex-none w-full min-w-0"
    style="padding: 0px; gap: 17px; height: 42px; border: 1px solid #E0E0E0; border-radius: 12px; flex-grow: 0; box-sizing: border-box;"
  >
    <div
      class="flex flex-none items-center justify-center shrink-0 self-stretch"
      style="padding: 0px 0px 0px 16px; width: 32px;"
    >
      <Icon iconName="icon/search" size={16} style="color: #757575;" />
    </div>

    <div
      class="flex flex-col justify-center items-start flex-1 min-w-0"
      style="padding: 0px 16px 0px 0px;"
    >
      <input
        type="text"
        bind:value
        {placeholder}
        class="w-full min-w-0 border-0 outline-none bg-transparent focus:outline-none"
        style="font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 400; font-size: 15px; line-height: 20px; color: #757575;"
      />
    </div>
  </div>
</div>
