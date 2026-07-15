<script lang="ts">
  import { Toaster, toast } from "svelte-sonner";
  import { page } from "$app/stores";
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

{@render children()}
<Toaster richColors closeButton />
