<script lang="ts">
  import { Toaster, toast } from "svelte-sonner";
  import { page, navigating } from "$app/stores";
  import { goto } from "$app/navigation";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import { _ } from "svelte-i18n";

  let { children } = $props();

  const publicPaths = ["/", "/onboarding"];
  const isPublicRoute = $derived(
    publicPaths.some((p) => $page.url.pathname === p || $page.url.pathname.startsWith(p + "/"))
  );

  authStore.init();

  $effect(() => {
    if (isPublicRoute) return;

    if (authStore.isTokenExpired()) {
      authStore.logout();
      toast.warning($_('sessionExpired'));
      goto("/onboarding/signin");
      return;
    }

    if (!authStore.isAuthenticated) {
      goto("/onboarding/signin");
    }
  });
</script>

{#if $navigating}
  <div class="fixed top-0 left-0 right-0 h-0.5 z-[9999] bg-muted/30 overflow-hidden">
    <div class="h-full w-full bg-[#4DA0E6] nav-loading-slide"></div>
  </div>
{/if}

{@render children()}
<Toaster richColors closeButton />

<style>
  :global(.nav-loading-slide) {
    animation: nav-loading 1.5s infinite linear;
  }
  @keyframes nav-loading {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
</style>
