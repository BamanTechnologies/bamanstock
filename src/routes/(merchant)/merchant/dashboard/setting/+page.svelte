<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";

  let theme = $state<"Light" | "Dark" | "System">("Light");
  let language = $state("English");
  let notificationsEnabled = $state(true);
  let twoFactorEnabled = $state(true);

  function handleChangePassword() {
    console.log("Change password clicked");
  }

  function handleOpenHelpCenter() {
    console.log("Opening help center");
  }

  function handleContactSupport() {
    console.log("Opening support contact");
  }
</script>

<div class="flex-1 px-6 py-8 space-y-12 w-full">
  <header>
    <h1 class="text-2xl font-bold text-foreground">Setting</h1>
  </header>

  <section class="space-y-6">
    <div class="border-b border-border pb-2">
      <h2 class="text-lg font-semibold text-foreground">Investor</h2>
    </div>
    
    <div class="flex items-center justify-between p-4 bg-muted/20 rounded-xl border border-border">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
          <Icon iconName="icon/user" size={20} class="text-info" />
        </div>
        <span class="text-sm font-medium text-muted-foreground">Assigned Investor</span>
      </div>
      <div class="flex items-center gap-3">
        <img src="/path-to-investor-avatar.jpg" alt="Miles Jefferey" class="w-8 h-8 rounded-full object-cover" />
        <span class="text-sm font-semibold text-foreground">Miles Jefferey</span>
      </div>
    </div>
  </section>

  <section class="space-y-6">
    <div class="border-b border-border pb-2">
      <h2 class="text-lg font-semibold text-foreground">Application Preferences</h2>
    </div>

    <div class="space-y-8 px-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/sun" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Theme</span>
        </div>
        <div class="flex bg-muted/50 p-1 rounded-full border border-border">
          {#each ['Light', 'Dark', 'System'] as mode}
            <button
              class="px-5 py-1.5 text-xs font-medium rounded-full transition-all {theme === mode ? 'bg-white text-info shadow-sm' : 'text-muted-foreground hover:text-foreground'}"
              onclick={() => (theme = mode as "Light" | "Dark" | "System")}
            >
              {mode}
            </button>
          {/each}
        </div>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/languages" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Language</span>
        </div>
        <Dropdown
          bind:value={language}
          options={[
            { value: "English", label: "English" },
            { value: "Spanish", label: "Spanish" }
          ]}
          class="min-w-[140px]"
        />
      </div>

      <div class="flex items-center justify-between gap-8">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/bell" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Notifications</span>
        </div>
        <ToggleSwitch label="Notifications" bind:checked={notificationsEnabled} />
      </div>
    </div>
  </section>

  <section class="space-y-6">
    <div class="border-b border-border pb-2">
      <h2 class="text-lg font-semibold text-foreground">Security</h2>
    </div>

    <div class="space-y-8 px-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/lock" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Password</span>
        </div>
        <Button class="bg-info hover:bg-info/90 text-white rounded-lg px-8" onclick={handleChangePassword}>
          Change Password
        </Button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/shield-check" size={20} class="text-info" />
          </div>
          <div>
            <span class="text-sm font-medium block">Two-Factor Authentication</span>
            <span class="text-xs text-muted-foreground">Authenticator app required</span>
          </div>
        </div>
        <ToggleSwitch label="Two-Factor Authentication" bind:checked={twoFactorEnabled} />
      </div>
    </div>
  </section>

  <section class="space-y-6">
    <div class="border-b border-border pb-2">
      <h2 class="text-lg font-semibold text-foreground">Support</h2>
    </div>

    <div class="space-y-8 px-1">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/help-circle" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Help & Support</span>
        </div>
        <Button variant="outline" class="text-info border-info/20 bg-info/5 hover:bg-info/10 px-8" onclick={handleOpenHelpCenter}>
          Open help center
        </Button>
      </div>

      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/send" size={20} class="text-info" />
          </div>
          <span class="text-sm font-medium">Contact Support</span>
        </div>
        <Button variant="outline" class="text-info border-info/20 bg-info/5 hover:bg-info/10 px-8" onclick={handleContactSupport}>
          Send message
        </Button>
      </div>
    </div>
  </section>
</div>