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
  class="flex flex-col justify-center items-start flex-none"
  style="width: 484px; max-width: 100%; height: 42px; padding: 0px; flex-grow: 0;"
>
  <div
    class="flex flex-row items-center flex-none w-full"
    style="padding: 0px; gap: 17px; height: 42px; border: 1px solid #E0E0E0; border-radius: 12px; flex-grow: 0;"
  >
    <div
      class="flex flex-row justify-center items-center flex-none"
      style="padding: 0px 0px 0px 16px; width: 32px; height: 42px; border-radius: 12px 0px 0px 12px; flex: none; order: 0; align-self: stretch; flex-grow: 0;"
    >
      <div
        class="flex-none flex items-center justify-center"
        style="width: 16px; height: 16px; flex: none; order: 0; flex-grow: 0;"
      >
        <Icon iconName="icon/search" size={16} style="color: #757575;" />
      </div>
    </div>

    <div
      class="flex flex-col justify-center items-start flex-none"
      style="padding: 0px; width: 402px; max-width: 100%; height: 42px; flex: none; order: 1; flex-grow: 0;"
    >
      <input
        type="text"
        bind:value
        {placeholder}
        class="w-full border-0 outline-0 bg-transparent"
        style="width: 373px; max-width: 100%; height: 20px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 400; font-size: 15px; line-height: 20px; color: #757575; display: flex; align-items: center; flex: none; order: 0; flex-grow: 0;"
      />
    </div>
  </div>
</div>
