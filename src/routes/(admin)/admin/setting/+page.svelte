<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  let theme = $state<"light" | "dark" | "system">("system");
  let language = $state("English");
  let notifications = $state(true);
  let twoFactor = $state(false);
</script>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold text-slate-800">Settings</h1>
    <p class="text-sm text-slate-500 mt-1">Manage your admin preferences and security.</p>
  </div>

  <!-- Application Preferences -->
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100">
      <h2 class="font-semibold text-slate-800">Application Preferences</h2>
    </div>
    <div class="divide-y divide-slate-50">

      <!-- Theme -->
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/monitor" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Theme</p>
            <p class="text-xs text-slate-400">Choose your display theme</p>
          </div>
        </div>
        <div class="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          {#each ["light", "dark", "system"] as t}
            <button
              type="button"
              onclick={() => (theme = t as typeof theme)}
              class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {theme === t
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'}"
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          {/each}
        </div>
      </div>

      <!-- Language -->
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/languages" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Language</p>
            <p class="text-xs text-slate-400">Select your preferred language</p>
          </div>
        </div>
        <select
          bind:value={language}
          class="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-info/20"
        >
          <option>English</option>
          <option>Amharic</option>
          <option>French</option>
        </select>
      </div>

      <!-- Notifications -->
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/bell" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Notifications</p>
            <p class="text-xs text-slate-400">Receive system alerts and updates</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => (notifications = !notifications)}
          class="relative w-11 h-6 rounded-full transition-colors {notifications ? 'bg-info' : 'bg-slate-200'}"
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform {notifications ? 'translate-x-5' : 'translate-x-0'}"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Security -->
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100">
      <h2 class="font-semibold text-slate-800">Security</h2>
    </div>
    <div class="divide-y divide-slate-50">

      <!-- Change Password -->
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/lock" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Change Password</p>
            <p class="text-xs text-slate-400">Update your admin password</p>
          </div>
        </div>
        <button class="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
          Change
        </button>
      </div>

      <!-- 2FA -->
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/shield-check" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Two-Factor Authentication</p>
            <p class="text-xs text-slate-400">Add an extra layer of security</p>
          </div>
        </div>
        <button
          type="button"
          onclick={() => (twoFactor = !twoFactor)}
          class="relative w-11 h-6 rounded-full transition-colors {twoFactor ? 'bg-info' : 'bg-slate-200'}"
        >
          <span class="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform {twoFactor ? 'translate-x-5' : 'translate-x-0'}"></span>
        </button>
      </div>
    </div>
  </div>

  <!-- Support -->
  <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
    <div class="px-6 py-4 border-b border-slate-100">
      <h2 class="font-semibold text-slate-800">Support</h2>
    </div>
    <div class="divide-y divide-slate-50">
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/help-circle" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Help & Documentation</p>
            <p class="text-xs text-slate-400">View guides and FAQs</p>
          </div>
        </div>
        <button class="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
          Open
        </button>
      </div>
      <div class="px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-lg bg-info/10 flex items-center justify-center">
            <Icon iconName="icon/send" size={18} class="text-info" />
          </div>
          <div>
            <p class="text-sm font-medium text-slate-800">Contact Support</p>
            <p class="text-xs text-slate-400">Get help from the BamanStock team</p>
          </div>
        </div>
        <button class="px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
          Contact
        </button>
      </div>
    </div>
  </div>
</div>
