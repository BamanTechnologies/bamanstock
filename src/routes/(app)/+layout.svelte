<script lang="ts">
  import "../../app.css";
  import Header from "$lib/components/Header.svelte";

  let { children } = $props();
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
  <link
    href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Raleway:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<Header />
{@render children()}
