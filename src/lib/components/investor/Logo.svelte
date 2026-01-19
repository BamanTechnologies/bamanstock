<script lang="ts">
  interface LogoProps {
    src?: string;
    alt?: string;
  }

  let {
    src = "/bamanstock logo 1.png",
    alt = "BAMANSTOCK",
  }: LogoProps = $props();
</script>

<div
  class="flex-none"
  style="display: flex; flex-direction: row; align-items: center; padding: 0px 12px 0px 0px; gap: 12px; position: absolute; width: 223px; height: 66.17px; left: 33px; top: 50%; transform: translateY(-50%);"
>
  <img
    {src}
    {alt}
    class="object-contain flex-none"
    style="width: 188px; height: 98px; flex: none; order: 0; flex-grow: 0;"
  />
</div>
