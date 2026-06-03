<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import Logo from "./Logo.svelte";
  import { themeStore } from "$lib/stores/theme.svelte.js";

  interface HeaderProps {
    userAvatar?: string;
    userName?: string;
  }

  let {
    userAvatar = "/profileheader.png",
    userName = "User",
  }: HeaderProps = $props();

  function toggleTheme() {
    themeStore.set(themeStore.current === "Dark" ? "Light" : "Dark");
  }
</script>

<header class="w-full bg-background border-b border-border px-6 py-4 relative">
  <div class="flex items-center justify-between max-w-7xl mx-auto relative">
    <Logo />

    <div class="flex items-center gap-4 ml-auto">
      <button
        type="button"
        class="px-4 py-2 bg-info text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center min-w-[162px] h-10"
        onclick={() => goto("/dashboard")}
      >
        Go to Dashboard
      </button>

      <div class="h-10 w-px bg-border"></div>

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
</header>
