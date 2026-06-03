<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { themeStore } from "$lib/stores/theme.svelte.js";

  const theme = $derived(themeStore.current);
  let language = $state("English");
  let notificationsEnabled = $state(true);
  let twoFactorEnabled = $state(true);

  function handleChangePassword() {
    // TODO: Open change password modal
    console.log("Change password");
  }

  function handleExportData() {
    // TODO: Implement data export
    console.log("Export data");
  }

  function handleDeleteAccount() {
    // TODO: Open delete account confirmation modal
    console.log("Delete account");
  }

  function handleOpenHelpCenter() {
    // TODO: Open help center
    console.log("Open help center");
  }

  function handleContactSupport() {
    // TODO: Open contact support modal
    console.log("Contact support");
  }
</script>

<div class="flex-1 px-12 py-15 space-y-8">
  <!-- Application Preferences Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">
        Application Preferences
      </h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Theme -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/sun" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground">Theme</span>
        </div>
        <div
          class="flex items-center gap-1 border border-border rounded-lg p-1 bg-[#4DA0E6]/10"
        >
          <button
            type="button"
            onclick={() => themeStore.set("Light")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme ===
            'Light'
              ? 'bg-info text-info-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            Light
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("Dark")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme ===
            'Dark'
              ? 'bg-info text-info-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            Dark
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("System")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme ===
            'System'
              ? 'bg-info text-info-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            System
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/languages"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground">Language</span>
        </div>
        <Dropdown
          bind:value={language}
          options={[
            { value: "English", label: "English" },
            { value: "Spanish", label: "Spanish" },
            { value: "French", label: "French" },
            { value: "German", label: "German" },
          ]}
          class="min-w-[150px]"
        />
      </div>

      <!-- Notifications -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/bell"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground">Notifications</span>
        </div>
        <ToggleSwitch bind:checked={notificationsEnabled} label="" />
      </div>
    </div>
  </div>

  <!-- Security Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">Security</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/lock"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground">Password</span>
        </div>
        <Button
          class="bg-info text-info-foreground hover:bg-info/90"
          onclick={handleChangePassword}
        >
          Change Password
        </Button>
      </div>

      <!-- Two-Factor Authentication -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/shield-check"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <div>
            <span class="text-sm font-medium text-foreground block">
              Two-Factor Authentication
            </span>
            <span class="text-xs text-muted-foreground">
              Authenticator app required
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
      <h2 class="text-lg font-semibold text-foreground mb-1">Data & Privacy</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Export Data -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/download"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground">Export Data</span>
        </div>
        <Button
          variant="outline"
          class="bg-info/20 text-info hover:bg-info/30"
          onclick={handleExportData}
        >
          Download My Data
        </Button>
      </div>

      <!-- Account Deletion -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/trash"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground"
            >Account Deletion</span
          >
        </div>
        <Button
          class="bg-red-600/10 text-red-600 hover:bg-red-700"
          onclick={handleDeleteAccount}
        >
          Delete Account
        </Button>
      </div>
    </div>
  </div>

  <!-- Support Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">Support</h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Help & Support -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/help-circle"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground">Help & Support</span
          >
        </div>
        <Button
          variant="outline"
          class="bg-info/20 text-info hover:bg-info/30"
          onclick={handleOpenHelpCenter}
        >
          Open help center
        </Button>
      </div>

      <!-- Contact Support -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon
              iconName="icon/send"
              size={20}
              class="text-[#4DA0E6]"
            />
          </div>
          <span class="text-sm font-medium text-foreground"
            >Contact Support</span
          >
        </div>
        <Button
          variant="outline"
          class="bg-info/20 text-info hover:bg-info/30"
          onclick={handleContactSupport}
        >
          Send message
        </Button>
      </div>
    </div>
  </div>
</div>
