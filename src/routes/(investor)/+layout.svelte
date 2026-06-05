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
  import { page } from "$app/stores";
  import { themeStore } from "$lib/stores/theme.svelte.js";

  let { children } = $props();

  let showProfileDropdown = $state(false);
  let showNotifications = $state(false);

  $effect(() => { themeStore.init(); });

  function toggleTheme() {
    themeStore.set(themeStore.current === 'Dark' ? 'Light' : 'Dark');
  }

  const pageTitle = $derived.by(() => {
    const path = $page.url.pathname;
    if (path.includes("/dashboard/merchants/")) return "Merchant Details";
    if (path.startsWith("/dashboard/merchants")) return "Merchants";
    if (path.includes("/location")) return "Locations";
    if (path.includes("/stock")) return "Stock";
    if (path.includes("/report")) return "Reports";
    if (path.includes("/setting")) return "Settings";
    if (path === "/dashboard") return "Dashboard";
    return "Dashboard";
  });

  const isInvestorPage = $derived($page.url.pathname.startsWith("/investor"));

  const navigation = [
    { title: "Dashboard", icon: "icon/layout-grid", href: "/dashboard" },
    { title: "Merchants", icon: "icon/users",        href: "/dashboard/merchants" },
    { title: "Location",  icon: "icon/map-pin",      href: "/dashboard/location" },
    { title: "Stock",     icon: "icon/box",           href: "/dashboard/stock" },
    { title: "Report",    icon: "icon/bar-chart",     href: "/dashboard/reports" },
    { title: "Settings",  icon: "icon/settings",      href: "/dashboard/setting" },
  ];
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

<SidebarProvider>
  <div class="flex min-h-screen w-full">
    {#if !isInvestorPage}
      <Sidebar>
        <SidebarHeader>
          <a href="/" class="flex items-center gap-2 px-4 py-2 hover:opacity-90 transition-opacity">
            <div class="w-10 h-10 rounded-xl bg-info flex items-center justify-center shrink-0">
              <Icon iconName="icon/trending-up" size={20} class="text-info-foreground" />
            </div>
            <span class="text-xl font-bold text-info">BAMANSTOCK</span>
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
              <a href="/" class="block">
                <SidebarMenuButton class="text-red-500 hover:text-red-600 hover:cursor-pointer">
                  <Icon iconName="icon/log-out" size={20} class="text-red-500" />
                  <span>Logout</span>
                </SidebarMenuButton>
              </a>
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
                    <p class="text-sm font-semibold text-foreground">Notifications</p>
                  </div>
                  <div class="px-4 py-8 flex flex-col items-center gap-2 text-center">
                    <Icon iconName="icon/bell" size={32} class="text-muted-foreground/40" />
                    <p class="text-sm text-muted-foreground">You don't have any notifications</p>
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

            <div class="w-7 h-7 rounded-full border border-border flex items-center justify-center text-base cursor-pointer overflow-hidden">
              🇬🇧
            </div>

            <div class="relative">
              <img
                src="/Yohannes Abayneh.png"
                alt="Profile"
                class="w-8 h-8 rounded-full object-cover cursor-pointer border border-border"
                onclick={() => (showProfileDropdown = !showProfileDropdown)}
              />
              {#if showProfileDropdown}
                <div class="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <img src="/Yohannes Abayneh.png" alt="Profile" class="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-foreground">Yohannes Abayneh</p>
                      <a href="/dashboard/profile" class="text-xs text-info hover:underline" onclick={() => (showProfileDropdown = false)}>
                        View Profile →
                      </a>
                    </div>
                  </div>
                  <a href="/dashboard/setting" class="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors" onclick={() => (showProfileDropdown = false)}>
                    <span class="flex items-center gap-2">
                      <Icon iconName="icon/settings" size={16} class="text-muted-foreground" />
                      Change theme
                    </span>
                    <Icon iconName="icon/chevron-right" size={14} class="text-muted-foreground" />
                  </a>
                  <a href="/" class="flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors">
                    <Icon iconName="icon/log-out" size={16} />
                    Log out
                  </a>
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
