<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { _ } from "svelte-i18n";
  import { locale, setLocale } from "$lib/i18n/index.js";

  const theme = $derived(themeStore.current);
  let notificationsEnabled = $state(true);
  let twoFactorEnabled = $state(true);

  const langOptions = [
    { value: "en", label: "English" },
    { value: "am", label: "አማርኛ" },
    { value: "om", label: "Afaan Oromoo" },
  ];

  function handleChangePassword() {
    console.log("Change password");
  }

  function handleExportData() {
    console.log("Export data");
  }

  function handleDeleteAccount() {
    console.log("Delete account");
  }

  function handleOpenHelpCenter() {
    console.log("Open help center");
  }

  function handleContactSupport() {
    console.log("Contact support");
  }
</script>

<div class="flex-1 px-12 py-15 space-y-8">
  <!-- Application Preferences Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">
        {$_('appPreferences')}
      </h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Theme -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/sun" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('theme')}</span>
        </div>
        <div class="flex items-center gap-1 border border-border rounded-lg p-1 bg-[#4DA0E6]/10">
          <button
            type="button"
            onclick={() => themeStore.set("Light")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme === 'Light' ? 'bg-info text-info-foreground' : 'text-muted-foreground hover:text-foreground'}"
          >
            {$_('light')}
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("Dark")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme === 'Dark' ? 'bg-info text-info-foreground' : 'text-muted-foreground hover:text-foreground'}"
          >
            {$_('dark')}
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("System")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme === 'System' ? 'bg-info text-info-foreground' : 'text-muted-foreground hover:text-foreground'}"
          >
            {$_('system')}
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/languages" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('settingsLanguage')}</span>
        </div>
        <Dropdown
          value={$locale ?? "en"}
          onchange={(v) => setLocale(v)}
          options={langOptions}
          class="min-w-37.5"
        />
      </div>

      <!-- Notifications -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/bell" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('notificationsLabel')}</span>
        </div>
        <ToggleSwitch bind:checked={notificationsEnabled} label="" />
      </div>
    </div>
  </div>

  <!-- Security Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">{$_('security')}</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/lock" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('password')}</span>
        </div>
        <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={handleChangePassword}>
          {$_('changePassword')}
        </Button>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/shield-check" size={20} class="text-[#4DA0E6]" />
          </div>
          <div>
            <span class="text-sm font-medium text-foreground block">
              {$_('twoFactorAuth')}
            </span>
            <span class="text-xs text-muted-foreground">
              {$_('authenticatorRequired')}
            </span>
          </div>
        </div>
        <ToggleSwitch bind:checked={twoFactorEnabled} label="" />
      </div>
    </div>
  </div>

  <!-- Data & Privacy Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">{$_('dataPrivacy')}</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Export Data -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/download" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('exportData')}</span>
        </div>
        <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={handleExportData}>
          {$_('downloadMyData')}
        </Button>
      </div>

      <!-- Account Deletion -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/trash" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('accountDeletion')}</span>
        </div>
        <Button
          class="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800"
          onclick={handleDeleteAccount}
        >
          {$_('deleteAccount')}
        </Button>
      </div>
    </div>
  </div>

  <!-- Support Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">{$_('support')}</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Help & Support -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/help-circle" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('helpSupport')}</span>
        </div>
        <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={handleOpenHelpCenter}>
          {$_('openHelpCenter')}
        </Button>
      </div>

      <!-- Contact Support -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center">
            <Icon iconName="icon/send" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">{$_('contactSupport')}</span>
        </div>
        <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={handleContactSupport}>
          {$_('sendMessage')}
        </Button>
      </div>
    </div>
  </div>
</div>
