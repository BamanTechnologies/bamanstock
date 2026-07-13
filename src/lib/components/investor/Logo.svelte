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

<div class="flex items-center flex-none">
  <img
    {src}
    {alt}
    class="object-contain flex-none max-h-full"
    style="height: 90px; width: auto;"
  />
</div>
