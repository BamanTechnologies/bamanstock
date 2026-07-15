<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import Logo from "./Logo.svelte";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { _, locale } from "svelte-i18n";
  import { setLocale, localeAbbr } from "$lib/i18n/index.js";

  interface HeaderProps {
    userAvatar?: string;
    userName?: string;
  }

  let {
    userAvatar = "/profileheader.png",
    userName = "User",
  }: HeaderProps = $props();

  let showLangDropdown = $state(false);

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
      <Logo />

      <div class="flex items-center gap-4">
        <a
          href="/onboarding/signin"
          class="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          {$_('signIn')}
        </a>

        <button
          type="button"
          class="px-4 py-2 text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center min-w-40 h-10 hover:opacity-90 bg-(--primary-blue)"
          onclick={() => goto("/dashboard")}
        >
          {$_('goToDashboard')}
        </button>

        <div class="h-10 w-px bg-border"></div>

        <!-- Language switcher -->
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

        <button
          type="button"
          class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Icon iconName="icon/bell" size={20} class="text-muted-foreground" />
        </button>

        <button
          type="button"
          class="flex-none rounded-full overflow-hidden w-8 h-8"
          aria-label="User menu"
        >
          {#if userAvatar}
            <img src={userAvatar} alt={userName} class="w-full h-full object-cover rounded-full" />
          {:else}
            <span class="text-sm font-semibold text-foreground">
              {userName.charAt(0).toUpperCase()}
            </span>
          {/if}
        </button>
      </div>
    </div>
  </div>
</header>
