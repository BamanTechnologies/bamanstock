<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import Logo from "$lib/components/investor/Logo.svelte";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import { _, locale } from "svelte-i18n";
  import { setLocale, localeAbbr } from "$lib/i18n/index.js";

  let showLangDropdown = $state(false);
  let showUserDropdown = $state(false);

  const langOptions = [
    { value: "en", label: "English",      abbr: "ENG" },
    { value: "am", label: "አማርኛ",         abbr: "AMH" },
    { value: "om", label: "Afaan Oromoo",  abbr: "ORO" },
  ];

  function toggleTheme() {
    themeStore.set(themeStore.current === "Dark" ? "Light" : "Dark");
  }
</script>

<header class="w-full bg-background border-b border-border">
  <div class="container mx-auto px-5 sm:px-6 lg:px-8">
    <div class="h-16 flex items-center justify-between">
      <a href="/" class="hover:opacity-90 transition-opacity">
        <Logo />
      </a>

      <div class="flex items-center gap-2">
       <button
          type="button"
          onclick={toggleTheme}
          aria-label="Toggle theme"
          class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          {#if themeStore.current === "Dark"}
            <Icon iconName="icon/sun" size={18} />
          {:else}
            <Icon iconName="icon/moon" size={18} />
          {/if}
        </button>
       <div class="relative">
          <button
            type="button"
            onclick={() => (showLangDropdown = !showLangDropdown)}
            class="w-9 h-9 rounded-full border border-border flex items-center justify-center text-[10px] font-semibold bg-background hover:bg-muted transition-colors text-foreground"
          >
            {localeAbbr($locale)}
          </button>
          {#if showLangDropdown}
            <div class="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
              {#each langOptions as opt}
                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted {$locale === opt.value ? 'text-[#4DA0E6] font-medium' : 'text-foreground'}"
                  onclick={() => { setLocale(opt.value); showLangDropdown = false; }}
                >
                  <span class="text-xs font-mono text-muted-foreground mr-2">{opt.abbr}</span>{opt.label}
                </button>
              {/each}
            </div>
          {/if}
        </div>
        {#if authStore.isAuthenticated}
          <button
            type="button"
            class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
            aria-label="Notifications"
          >
            <Icon iconName="icon/bell" size={20} class="text-muted-foreground" />
          </button>

          <div class="relative">
            <button
              type="button"
              onclick={() => (showUserDropdown = !showUserDropdown)}
              onblur={() => setTimeout(() => (showUserDropdown = false), 150)}
              class="flex flex-none items-center gap-2 rounded-full hover:bg-muted bg-gray-50 cursor-pointer dark:bg-gray-900 transition-colors px-2.5 py-1"
              aria-label="User menu"
            >
              <span class="text-sm font-medium text-foreground max-w-[120px] truncate">{authStore.user?.name}</span>
              {#if authStore.user?.avatar}
                <img src={authStore.user.avatar} alt={authStore.user.name} class="w-8 h-8 rounded-full object-cover" />
              {:else}
                <span class="w-8 h-8 rounded-full bg-info flex items-center justify-center text-xs font-bold text-info-foreground">
                  {authStore.user?.name?.charAt(0).toUpperCase()}
                </span>
              {/if}
            </button>
            {#if showUserDropdown}
              <div class="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden" onblur={() => (showUserDropdown = false)}>
                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors cursor-pointer"
                  onclick={() => { showUserDropdown = false; goto("/dashboard"); }}
                >
                  {$_('goToDashboard')}
                </button>
                <hr class="border-border">
                <button
                  type="button"
                  class="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-muted transition-colors cursor-pointer"
                  onclick={() => { showUserDropdown = false; authStore.logout(); goto("/"); }}
                >
                  {$_('logout')}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <a
            href="/onboarding/signin"
            class="text-info hover:opacity-80 transition-opacity text-sm font-medium"
          >
            {$_('signIn')}
          </a>
        {/if}
      </div>
    </div>
  </div>
</header>
