<script lang="ts">
  import "../../app.css";
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from "$lib/components/ui/sidebar/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import SharedHeader from "$lib/components/Header.svelte";

  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { themeStore } from "$lib/stores/theme.svelte.js";
  import { _, locale } from "svelte-i18n";
  import { setLocale, localeAbbr } from "$lib/i18n/index.js";
  import { authStore } from "$lib/stores/auth.svelte.js";

  let { children } = $props();

  let showProfileDropdown = $state(false);
  let showNotifications = $state(false);
  let showLanguageDropdown = $state(false);

  const langOptions = [
    { value: "en", label: "English",      abbr: "ENG" },
    { value: "am", label: "አማርኛ",         abbr: "AMH" },
    { value: "om", label: "Afaan Oromoo",  abbr: "ORO" },
  ];

  $effect(() => { themeStore.init(); });

  function toggleTheme() {
    themeStore.set(themeStore.current === 'Dark' ? 'Light' : 'Dark');
  }

  const pageTitle = $derived.by(() => {
    const path = $page.url.pathname;
    if (path.includes("/dashboard/merchants/")) return $_('pageMerchantDetails');
    if (path.startsWith("/dashboard/merchants")) return $_('pageMerchants');
    if (path.includes("/location")) return $_('pageLocations');
    if (path.includes("/stock")) return $_('pageStock');
    if (path.includes("/report")) return $_('pageReports');
    if (path.includes("/setting")) return $_('pageSettings');
    return $_('pageDashboard');
  });

  const isInvestorPage = $derived($page.url.pathname.startsWith("/investor"));

  const navigation = $derived([
    { title: $_('navDashboard'), icon: "icon/layout-grid", href: "/dashboard" },
    { title: $_('navMerchants'), icon: "icon/users",        href: "/dashboard/merchants" },
    { title: $_('navLocation'),  icon: "icon/map-pin",      href: "/dashboard/location" },
    { title: $_('navStock'),     icon: "icon/box",           href: "/dashboard/stock" },
    { title: $_('navReport'),    icon: "icon/bar-chart",     href: "/dashboard/reports" },
    { title: $_('navSettings'),  icon: "icon/settings",      href: "/dashboard/setting" },
  ]);
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link
    href="https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Raleway:wght@400;500;600;700&display=swap"
    rel="stylesheet"
  />
</svelte:head>

{#if isInvestorPage}
  <SharedHeader />
{/if}

<SidebarProvider>
  <div class="flex min-h-screen w-full">
    {#if !isInvestorPage}
      <Sidebar>
        <SidebarHeader>
          <a href="/" class="flex items-center px-2 py-1 hover:opacity-90 transition-opacity">
            <img src="/bamanstock logo 1.png" alt="BAMANSTOCK" class="w-auto object-contain" style="height: 90px;" />
          </a>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu class="gap-2">
                {#each navigation as item}
                  <SidebarMenuItem>
                    <a href={item.href} class="block">
                      <SidebarMenuButton
                        isActive={$page.url.pathname === item.href ||
                          ($page.url.pathname.startsWith("/dashboard/merchants") &&
                            item.href === "/dashboard/merchants")}
                      >
                        <Icon iconName={item.icon as any} size={20} />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </a>
                  </SidebarMenuItem>
                {/each}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
                <SidebarMenuItem>
                  <button
                    type="button"
                    class="w-full block"
                    onclick={() => { authStore.logout(); goto("/"); }}
                  >
                    <SidebarMenuButton class="text-red-500 hover:text-red-600 hover:cursor-pointer">
                      <Icon iconName="icon/log-out" size={20} class="text-red-500" />
                      <span>{$_('logout')}</span>
                    </SidebarMenuButton>
                  </button>
                </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    {/if}

    <SidebarInset class={isInvestorPage ? "w-full" : "bg-gray-50 dark:bg-background"}>
      {#if !isInvestorPage}
        <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
          <SidebarTrigger class="-ml-1" />
          <h1 class="text-xl font-semibold text-foreground">{pageTitle}</h1>

          <div class="flex-1"></div>

          <div class="flex items-center gap-4">
            <!-- Notifications -->
            <div class="relative">
              <button
                type="button"
                onclick={() => (showNotifications = !showNotifications)}
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <Icon iconName="icon/bell" size={20} />
              </button>
              {#if showNotifications}
                <div class="absolute right-0 top-full mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div class="px-4 py-3 border-b border-border">
                    <p class="text-sm font-semibold text-foreground">{$_('notificationsTitle')}</p>
                  </div>
                  <div class="px-4 py-8 flex flex-col items-center gap-2 text-center">
                    <Icon iconName="icon/bell" size={32} class="text-muted-foreground/40" />
                    <p class="text-sm text-muted-foreground">{$_('noNotificationsMsg')}</p>
                  </div>
                </div>
              {/if}
            </div>
            <button
              type="button"
              onclick={toggleTheme}
              aria-label="Toggle theme"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              {#if themeStore.current === 'Dark'}
                <Icon iconName="icon/sun" size={18} />
              {:else}
                <Icon iconName="icon/moon" size={18} />
              {/if}
            </button>

            <div class="relative">
              <button
                type="button"
                onclick={() => { showLanguageDropdown = !showLanguageDropdown; showProfileDropdown = false; showNotifications = false; }}
                class="w-7 h-7 rounded-full border border-border flex items-center justify-center text-[10px] font-semibold cursor-pointer bg-background hover:bg-muted transition-colors text-foreground"
              >
                {localeAbbr($locale)}
              </button>
              {#if showLanguageDropdown}
                <div class="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {#each langOptions as opt}
                    <button
                      type="button"
                      class="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-muted {$locale === opt.value ? 'text-[#4DA0E6] font-medium' : 'text-foreground'}"
                      onclick={() => { setLocale(opt.value); showLanguageDropdown = false; }}
                    >
                      <span class="text-xs font-mono text-muted-foreground mr-2">{opt.abbr}</span>{opt.label}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>

            <div class="relative">
              <button
                type="button"
                onclick={() => (showProfileDropdown = !showProfileDropdown)}
                class="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-border focus:outline-none"
              >
                {#if authStore.user?.avatar}
                  <img src={authStore.user.avatar} alt={authStore.user.name} class="w-full h-full object-cover" />
                {:else}
                  <span class="w-full h-full bg-info flex items-center justify-center text-xs font-bold text-info-foreground">
                    {authStore.user?.name?.charAt(0).toUpperCase()}
                  </span>
                {/if}
              </button>
              {#if showProfileDropdown}
                <div class="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
                    {#if authStore.user?.avatar}
                      <img src={authStore.user.avatar} alt={authStore.user.name} class="w-9 h-9 rounded-full object-cover shrink-0" />
                    {:else}
                      <span class="w-9 h-9 rounded-full bg-info flex items-center justify-center text-xs font-bold text-info-foreground shrink-0">
                        {authStore.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    {/if}
                    <div>
                      <p class="text-xs font-semibold text-foreground">{authStore.user?.name}</p>
                      <a href="/dashboard/profile" class="text-xs text-info hover:underline" onclick={() => (showProfileDropdown = false)}>
                        {$_('viewProfile')}
                      </a>
                    </div>
                  </div>
                  <a href="/dashboard/setting" class="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors" onclick={() => (showProfileDropdown = false)}>
                    <span class="flex items-center gap-2">
                      <Icon iconName="icon/settings" size={16} class="text-muted-foreground" />
                      {$_('changeTheme')}
                    </span>
                    <Icon iconName="icon/chevron-right" size={14} class="text-muted-foreground" />
                  </a>
                  <button
                    type="button"
                    class="w-full flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors"
                    onclick={() => { authStore.logout(); goto("/"); }}
                  >
                    <Icon iconName="icon/log-out" size={16} />
                    {$_('logout')}
                  </button>
                </div>
              {/if}
            </div>
          </div>
        </header>
      {/if}

      <main class="flex flex-1 flex-col {isInvestorPage ? 'w-full h-screen overflow-auto p-0' : 'overflow-auto'}">
        {@render children()}
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
