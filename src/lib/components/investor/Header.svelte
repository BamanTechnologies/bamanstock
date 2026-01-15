<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import Logo from "./Logo.svelte";

  interface HeaderProps {
    userAvatar?: string;
    userName?: string;
  }

  let {
    userAvatar = "/profileheader.png",
    userName = "User",
  }: HeaderProps = $props();
</script>

<header class="w-full bg-white px-6 py-4 relative">
  <div class="flex items-center justify-between max-w-7xl mx-auto relative">
    <Logo />

    <div class="flex items-center gap-6 ml-auto" style="margin-left: auto; z-index: 10;">
      <button
        type="button"
        class="px-4 py-2 bg-info  text-white font-bold text-sm rounded-md transition-colors flex items-center justify-center min-w-[162px] h-10"
        onclick={() => goto("/dashboard")}
      >
        Go to Dashboard
      </button>

      <div class="h-10 w-px bg-gray-300"></div>

      <div
        class="flex-none"
        style="display: flex; flex-direction: row; align-items: center; padding: 0px; gap: 24px; width: 95.98px; height: 39.99px; flex: none; order: 2; flex-grow: 0;"
      >
        <button
          type="button"
          class="flex-none"
          style="display: flex; flex-direction: row; justify-content: center; align-items: center; padding: 0px; width: 39.99px; height: 39.99px; border-radius: 4px; flex: none; order: 0; flex-grow: 0;"
          aria-label="Notifications"
        >
          <Icon iconName="icon/bell" size={20} class="text-gray-700" />
        </button>

        <button
          type="button"
          class="flex-none rounded-full"
          style="display: flex; flex-direction: column; align-items: flex-start; padding: 0px; width: 31.99px; height: 31.99px; flex: none; order: 1; flex-grow: 0; overflow: hidden; border-radius: 50%;"
          aria-label="User menu"
        >
          {#if userAvatar}
            <img src={userAvatar} alt={userName} class="w-full h-full object-cover rounded-full" style="border-radius: 50%;" />
          {:else}
            <span class="text-sm font-semibold text-gray-700">
              {userName.charAt(0).toUpperCase()}
            </span>
          {/if}
        </button>
      </div>
    </div>
  </div>
</header>