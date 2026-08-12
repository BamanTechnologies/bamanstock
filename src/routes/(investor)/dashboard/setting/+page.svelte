<script lang="ts">
  import { getAuthClient } from "$lib/graphql/client";
  import { toast } from "svelte-sonner";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import ToggleSwitch from "$lib/components/investor/ToggleSwitch.svelte";
  import { Dropdown } from "$lib/components/ui/dropdown/index.js";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { _ } from "svelte-i18n";
  import { locale, setLocale } from "$lib/i18n/index.js";
  import CHANGE_PASSWORD_MUTATION from "$graphql/mutation/auth/auth.gql";
  import {
    useProfile,
    extractRoleFromToken,
  } from "$lib/stores/profile.svelte.js";
  import ConfirmModal from "$lib/components/ui/ConfirmModal.svelte";
  import INITIALIZE_CONNECT_MUTATION from "$graphql/queries/auth/initialize_connect.gql";
  import UPDATE_ACCOUNT_USER_MUTATION from "$graphql/mutation/auth/update_account_user.gql";

  const profile = useProfile();

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
  let oldPassword = $state("");
  let newPassword = $state("");
  let changingPassword = $state(false);
  let passwordError = $state("");

  function extractRole(): string {
    return "user";
  }

  function openPasswordModal() {
    oldPassword = "";
    newPassword = "";
    passwordError = "";
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
    if (e.key === "Escape" && !changingPassword) {
      closePasswordModal();
    }
  }

  async function handleChangePassword() {
    if (!oldPassword || !newPassword) {
      passwordError = $_("bothFieldsRequired");
      return;
    }

    passwordError = "";
    changingPassword = true;

    try {
      const role = extractRole();
      const client = getAuthClient(role);

      const result = await client.mutate<{
        change_password: { message: string; status_code: number };
      }>({
        mutation: CHANGE_PASSWORD_MUTATION,
        variables: { oldPassword, newPassword },
      });

      const response = result.data?.change_password;

      if (response && response.status_code !== 200) {
        passwordError = response.message || $_("failedToChangePassword");
      } else {
        showPasswordModal = false;
        toast.success($_("passwordChangedSuccessfully"));
      }
    } catch (err: any) {
      passwordError = err?.message ?? "An unexpected error occurred";
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

  // Telegram connection modal state
  let isTelegramModalOpen = $state(false);
  let telegramModalTitle = $state("");
  let telegramModalMessage = $state("");
  let telegramModalError = $state<string | null>(null);
  let telegramModalLoading = $state(false);
  let telegramModalConfirmText = $state("");
  let telegramModalCancelText = $state("");
  let telegramConnectLink = $state<string | null>(null);
  let telegramConnectSuccess = $state(false);

  function openTelegramConfirmModal() {
    telegramModalTitle = $_("telegramConnectConfirmTitle");
    telegramModalMessage = $_("telegramConnectConfirmMessage");
    telegramModalConfirmText = $_("connect");
    telegramModalCancelText = $_("cancel");
    telegramModalError = null;
    telegramModalLoading = false;
    telegramConnectLink = null;
    telegramConnectSuccess = false;
    isTelegramModalOpen = true;
  }

  async function handleTelegramConfirm() {
    if (telegramConnectSuccess && telegramConnectLink) {
      window.open(telegramConnectLink, "_blank", "noopener,noreferrer");
      isTelegramModalOpen = false;
      await profile.refetch();
      return;
    }

    telegramModalLoading = true;
    telegramModalError = null;

    try {
      const role = extractRoleFromToken();
      const client = getAuthClient("user");

      const result = await client.mutate<{
        connect_initialization: {
          connect_link: string | null;
          message: string | null;
          status_code: number;
        };
      }>({
        mutation: INITIALIZE_CONNECT_MUTATION,
      });

      const response = result.data?.connect_initialization;

      if (response && response.status_code === 200 && response.connect_link) {
        telegramConnectLink = response.connect_link;
        telegramConnectSuccess = true;
        telegramModalMessage = response.message || $_("telegramConnectSuccess");
        telegramModalConfirmText = $_("goToTelegram");
        telegramModalCancelText = $_("cancel");
      } else {
        telegramModalError = response?.message || $_("somethingWentWrong");
      }
    } catch (err: any) {
      telegramModalError = err?.message ?? "An unexpected error occurred";
    } finally {
      telegramModalLoading = false;
    }
  }

  function handleTelegramModalClose() {
    isTelegramModalOpen = false;
  }

  // Telegram disconnect state & handlers
  let isDisconnectModalOpen = $state(false);
  let disconnectModalLoading = $state(false);
  let disconnectModalError = $state<string | null>(null);

  function openDisconnectConfirmModal() {
    disconnectModalError = null;
    disconnectModalLoading = false;
    isDisconnectModalOpen = true;
  }

  async function handleDisconnectConfirm() {
    disconnectModalLoading = true;
    disconnectModalError = null;

    try {
      const userId = profile.data?.id;
      if (!userId) {
        throw new Error("User ID not found");
      }

      const role = extractRoleFromToken();
      const client = getAuthClient("user");

      await client.mutate({
        mutation: UPDATE_ACCOUNT_USER_MUTATION,
        variables: {
          id: userId,
          object: {
            telegram_chat_id: null,
            telegram_user_name: null,
          },
        },
      });

      toast.success($_("telegramDisconnectSuccess"));
      isDisconnectModalOpen = false;
      await profile.refetch();
    } catch (err: any) {
      disconnectModalError = err?.message ?? "An unexpected error occurred";
    } finally {
      disconnectModalLoading = false;
    }
  }

  function handleDisconnectModalClose() {
    isDisconnectModalOpen = false;
  }

  const handleReloadProfile = async () => {
    try {
      await profile.refetch();
      toast.success($_("profileReloaded"));
    } catch (err: any) {
      toast.error(err?.message ?? "An unexpected error occurred");
    }
  };
</script>

<div class="flex-1 px-5 sm:px-12 py-8 sm:py-15 space-y-8">
  <!-- Application Preferences Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">
        {$_("appPreferences")}
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
          <span class="text-sm font-medium text-foreground">{$_("theme")}</span>
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
            {$_("light")}
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("Dark")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme ===
            'Dark'
              ? 'bg-info text-info-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            {$_("dark")}
          </button>
          <button
            type="button"
            onclick={() => themeStore.set("System")}
            class="px-4 py-2 text-sm rounded-md transition-colors {theme ===
            'System'
              ? 'bg-info text-info-foreground'
              : 'text-muted-foreground hover:text-foreground'}"
          >
            {$_("system")}
          </button>
        </div>
      </div>

      <!-- Language -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/languages" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("settingsLanguage")}</span
          >
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
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/bell" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("notificationsLabel")}</span
          >
        </div>
        <ToggleSwitch bind:checked={notificationsEnabled} label="" />
      </div>

      <!-- Telegram Notification -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/send" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("telegramNotification")}</span
          >
        </div>
        <div class="flex items-center gap-3">
          {#if profile.telegramChatId}
            <div class="flex items-center gap-3">
              <div
                class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium"
              >
                <Icon
                  iconName="icon/check-circle"
                  size={18}
                  class="text-green-600 dark:text-green-400"
                />
                <span>{$_("telegramConnected")}</span>
                {#if profile.telegramUserName}
                  <span class="text-xs text-muted-foreground"
                    >(@{profile.telegramUserName})</span
                  >
                {/if}
              </div>
              <Button
                variant="outline"
                size="sm"
                class="text-destructive border-destructive hover:bg-destructive/10"
                onclick={openDisconnectConfirmModal}
              >
                {$_("disconnect")}
              </Button>
            </div>
          {:else if profile.connectTelegramUrl}

            <a
              href={profile.connectTelegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors bg-[#4DA0E6] text-white hover:bg-[#3d8fd4] h-10 px-4 py-2"
            >
              {$_("goToTelegram")}
            </a>
            <Button
              class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4] cursor-pointer"
              onclick={openTelegramConfirmModal}
            >
              {$_("reconnect")}
            </Button>
          <Button
              class=" border border-border bg-transparent text-[#4DA0E6] hover:bg-[#4DA0E6]/10 cursor-pointer"
              onclick={handleReloadProfile}
            >
              <Icon iconName="icon/refresh-cw" size={16} />
              {$_("reload")}
            </Button>
          {:else}
            <Button
              class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4] cursor-pointer"
              onclick={openTelegramConfirmModal}
            >
              {$_("connect")}
            </Button>
          {/if}
        </div>
      </div>
    </div>
  </div>

  <!-- Security Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">
        {$_("security")}
      </h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Password -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/lock" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("password")}</span
          >
        </div>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={openPasswordModal}
        >
          {$_("changePassword")}
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
              {$_("twoFactorAuth")}
            </span>
            <span class="text-xs text-muted-foreground">
              {$_("authenticatorRequired")}
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
      <h2 class="text-lg font-semibold text-foreground mb-1">
        {$_("dataPrivacy")}
      </h2>
      <div class="h-px bg-border mt-2"></div>
    </div>

    <div class="space-y-6">
      <!-- Export Data -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/download" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("exportData")}</span
          >
        </div>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={handleExportData}
        >
          {$_("downloadMyData")}
        </Button>
      </div>

      <!-- Account Deletion -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/trash" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("accountDeletion")}</span
          >
        </div>
        <Button
          class="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:border-red-800"
          onclick={handleDeleteAccount}
        >
          {$_("deleteAccount")}
        </Button>
      </div>
    </div>
  </div>

  <!-- Support Section -->
  <div class="space-y-6">
    <div>
      <h2 class="text-lg font-semibold text-foreground mb-1">
        {$_("support")}
      </h2>
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
          <span class="text-sm font-medium text-foreground"
            >{$_("helpSupport")}</span
          >
        </div>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={handleOpenHelpCenter}
        >
          {$_("openHelpCenter")}
        </Button>
      </div>

      <!-- Contact Support -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-[#4DA0E6]/15 flex items-center justify-center"
          >
            <Icon iconName="icon/send" size={20} class="text-[#4DA0E6]" />
          </div>
          <span class="text-sm font-medium text-foreground"
            >{$_("contactSupport")}</span
          >
        </div>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={handleContactSupport}
        >
          {$_("sendMessage")}
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
        <h3 class="text-lg font-semibold text-foreground">
          {$_("changePassword")}
        </h3>
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
        <div
          class="mx-6 mt-4 p-3 rounded-md bg-destructive/10 border border-destructive/20"
        >
          <p class="text-sm text-destructive font-medium">{passwordError}</p>
        </div>
      {/if}

      <div class="p-6 space-y-4">
        <div class="space-y-2">
          <label for="old-password" class="text-sm font-medium text-foreground">
            {$_("oldPassword")}
          </label>
          <Input
            id="old-password"
            type="password"
            bind:value={oldPassword}
            class="w-full"
            placeholder={$_("oldPasswordPlaceholder")}
            disabled={changingPassword}
          />
        </div>
        <div class="space-y-2">
          <label for="new-password" class="text-sm font-medium text-foreground">
            {$_("newPassword")}
          </label>
          <Input
            id="new-password"
            type="password"
            bind:value={newPassword}
            class="w-full"
            placeholder={$_("newPasswordPlaceholder")}
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
          {$_("cancel")}
        </Button>
        <Button
          class="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
          onclick={handleChangePassword}
          disabled={changingPassword}
        >
          {#if changingPassword}
            <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
                fill="none"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          {/if}
          Change Password
        </Button>
      </div>
    </div>
  </div>
{/if}

<ConfirmModal
  bind:isOpen={isTelegramModalOpen}
  title={telegramModalTitle}
  message={telegramModalMessage}
  error={telegramModalError}
  confirmText={telegramModalConfirmText}
  cancelText={telegramModalCancelText}
  loading={telegramModalLoading}
  onConfirm={handleTelegramConfirm}
  onClose={handleTelegramModalClose}
  propsClass="bg-[#4DA0E6] text-white hover:bg-[#3d8fd4]"
  propsIconClass="text-[#4DA0E6] bg-[#4DA0E6]/10 hover:bg-[#4DA0E6]/20"
  icon="icon/send"
/>

<ConfirmModal
  bind:isOpen={isDisconnectModalOpen}
  title={$_("telegramDisconnectConfirmTitle")}
  message={$_("telegramDisconnectConfirmMessage")}
  error={disconnectModalError}
  confirmText={$_("disconnect")}
  cancelText={$_("cancel")}
  loading={disconnectModalLoading}
  onConfirm={handleDisconnectConfirm}
  onClose={handleDisconnectModalClose}
  icon=""
/>
