<script lang="ts">
  import "../../app.css";
  import Navbar from "$lib/components/ui/navbar/index.js";
  import { page } from "$app/stores";

  let { children } = $props();

  const showNavbar = $derived($page.url.pathname !== '/');
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

{#if showNavbar}
  <Navbar />
{/if}
{@render children()}
