<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";

  interface HeaderProps {
    userAvatar?: string;
    userName?: string;
  }

  let {
    userAvatar = "/profileheader.png",
    userName = "User",
  }: HeaderProps = $props();
</script>

<header class="w-full bg-white border-b border-border px-6 py-4">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div
        class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm border border-border"
      >
        <Icon iconName="icon/trending-up" size={24} class="text-info" />
      </div>
      <span class="text-xl font-bold tracking-wide text-foreground"
        >BAMANSTOCK</span
      >
    </div>

    <div class="flex items-center gap-4">
      <Button
        variant="default"
        class="bg-info text-info-foreground hover:bg-info/90"
        onclick={() => goto("/dashboard")}
      >
        Go to Dashboard
      </Button>

      <button
        type="button"
        class="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Icon iconName="icon/bell" size={20} class="text-foreground" />
        <span
          class="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"
        ></span>
      </button>

      <button
        type="button"
        class="relative w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-info transition-all"
        aria-label="User menu"
      >
        {#if userAvatar}
          <img src={userAvatar} alt={userName} class="w-full h-full object-cover" />
        {:else}
          <span class="text-sm font-semibold text-foreground">
            {userName.charAt(0).toUpperCase()}
          </span>
        {/if}
      </button>
    </div>
  </div>
</header>
