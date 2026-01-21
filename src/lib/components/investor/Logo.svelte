<script lang="ts">
  import { cn } from "$lib/utils.js";

  interface LogoProps {
    src?: string;
    alt?: string;
    class?: string;
  }

  let {
    src = "/bamanstock-logo.png",
    alt = "BAMANSTOCK",
    class: className = "",
  }: LogoProps = $props();
</script>

<div
  class="flex-none"
  style="display: flex; flex-direction: row; align-items: center; padding: 0px 12px 0px 0px; gap: 12px; position: absolute; width: 223px; height: 66.17px; left: 33px; top: 50%; transform: translateY(-50%);"
>
  <img
    {src}
    {alt}
    class={cn("object-contain flex-none", className)}
    style="width: 223px; height: 66.17px; flex: none; order: 0; flex-grow: 0;"
  />
</div>
