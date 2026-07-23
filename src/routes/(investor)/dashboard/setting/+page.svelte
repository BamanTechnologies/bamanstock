<script lang="ts">
  import { getAuthClient } from '$lib/graphql/client';
  import { toast } from 'svelte-sonner';
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { _ } from "svelte-i18n";
  import { locale, setLocale } from "$lib/i18n/index.js";
  import CHANGE_PASSWORD_MUTATION from '$graphql/mutation/auth/auth.gql';

  const theme = $derived(themeStore.current);
  let notificationsEnabled = $state(true);
  let twoFactorEnabled = $state(true);

  const langOptions = [
    { value: "en", label: "English" },
    { value: "am", label: "አማርኛ" },
    { value: "om", label: "Afaan Oromoo" },
  ];

  // Change Password Modal
  let showPasswordModal = $state(false);
  let oldPassword = $state('');
  let newPassword = $state('');
  let changingPassword = $state(false);
  let passwordError = $state('');

  function extractRole(): string {
    return 'user';
  }

  function openPasswordModal() {
    oldPassword = '';
    newPassword = '';
    passwordError = '';
    showPasswordModal = true;
  }

  function closePasswordModal() {
    if (!changingPassword) {
      showPasswordModal = false;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !changingPassword) {
      closePasswordModal();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && !changingPassword) {
      closePasswordModal();
    }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      passwordError = $_('bothFieldsRequired');
      return;
    }

    passwordError = '';
    changingPassword = true;

    try {
      const role = extractRole();
      const client = getAuthClient(role);

      const result = await client.mutate<{ change_password: { message: string; status_code: number } }>({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: { oldPassword, newPassword },
      });

      const response = result.data?.change_password;

      if (response && response.status_code !== 200) {
        passwordError = response.message || $_('failedToChangePassword');
      } else {
        showPasswordModal = false;
        toast.success($_('passwordChangedSuccessfully'));
      }
    } catch (err: any) {
      passwordError = err?.message ?? 'An unexpected error occurred';
    } finally {
      changingPassword = false;
    }
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
        <Button class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]" onclick={openPasswordModal}>
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

<!-- Change Password Modal -->
{#if showPasswordModal}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    onclick={handleBackdropClick}
    onkeydown={handleKeydown}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    <div
      class="bg-card border border-border rounded-lg shadow-xl w-full max-w-md mx-4"
      onclick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center justify-between p-6 pb-0">
        <h3 class="text-lg font-semibold text-foreground">{$_('changePassword')}</h3>
        <button
          type="button"
          class="text-muted-foreground hover:text-foreground transition-colors"
          onclick={closePasswordModal}
          disabled={changingPassword}
        >
          <Icon iconName="icon/x" size={20} />
        </button>
      </div>

      {#if passwordError}
        <div class="mx-6 mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
          <p class="text-sm text-destructive font-medium">{passwordError}</p>
        </div>
      {/if}

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <label for="old-password" class="text-sm font-medium text-foreground">
            {$_('oldPassword')}
          </label>
          <Input
            id="old-password"
            type="password"
            bind:value={oldPassword}
            class="w-full"
            placeholder={$_('oldPasswordPlaceholder')}
            disabled={changingPassword}
          />
        </div>
        <div class="space-y-2">
          <label for="new-password" class="text-sm font-medium text-foreground">
            {$_('newPassword')}
          </label>
          <Input
            id="new-password"
            type="password"
            bind:value={newPassword}
            class="w-full"
            placeholder={$_('newPasswordPlaceholder')}
            disabled={changingPassword}
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 p-6 pt-0">
        <Button
          variant="outline"
          onclick={closePasswordModal}
          disabled={changingPassword}
        >
          {$_('cancel')}
        </Button>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={handleChangePassword}
          disabled={changingPassword}
        >
          {#if changingPassword}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          {/if}
          Change Password
        </Button>
      </div>
    </div>
  </div>
{/if}
