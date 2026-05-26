<script lang="ts">
  import "../../app.css";
  import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
  } from "$lib/components/ui/sidebar/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { page } from "$app/stores";

  let { children } = $props();

  let showProfileDropdown = $state(false);

  // Get page title based on current route
  const pageTitle = $derived.by(() => {
    const path = $page.url.pathname;
    if (path.includes("/dashboard/merchants/")) return "Merchant Details";
    if (path.startsWith("/dashboard/merchants")) return "Merchants";
    if (path.includes("/location")) return "Location";
    if (path.includes("/stock")) return "Stock";
    if (path.includes("/reports")) return "Reports";
    if (path.includes("/setting")) return "Setting";
    if (path === "/dashboard") return "Dashboard";
    return "Dashboard";
  });

  // Check if we're on the investor page (should hide sidebar and header)
  const isInvestorPage = $derived($page.url.pathname.startsWith("/investor"));

  const navigation = [
    { title: "Dashboard", icon: "icon/layout-grid", href: "/dashboard" },
    { title: "Merchants", icon: "icon/users", href: "/dashboard/merchants" },
    { title: "Location", icon: "icon/map-pin", href: "/dashboard/location" },
    { title: "Stock", icon: "icon/box", href: "/dashboard/stock" },
    { title: "Reports", icon: "icon/bar-chart", href: "/dashboard/reports" },
    { title: "Setting", icon: "icon/settings", href: "/dashboard/setting" },
  ];
</script>

<svelte:head>
  <link rel="icon" href="/favicon.svg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    rel="preconnect"
    href="https://fonts.gstatic.com"
    crossorigin="anonymous"
  />
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
          <div class="flex items-center gap-2 px-4 py-2">
            <div
              class="w-10 h-10 rounded-xl bg-info flex items-center justify-center"
            >
              <Icon
                iconName="icon/trending-up"
                size={20}
                class="text-info-foreground"
              />
            </div>
            <span class="text-xl font-bold text-info">BAMANSTOCK</span>
          </div>
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
                          ($page.url.pathname.startsWith(
                            "/dashboard/merchants"
                          ) &&
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
              <a href="/logout" class="block">
                <SidebarMenuButton>
                  <Icon iconName="icon/log-out" size={20} />
                  <span>Logout</span>
                </SidebarMenuButton>
              </a>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    {/if}
    <SidebarInset class={isInvestorPage ? "w-full" : ""}>
      {#if !isInvestorPage}
        <header
          class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6"
        >
          <!-- Search bar (left) -->
          <div class="relative w-72">
            <input
              type="text"
              placeholder="Search"
              class="w-full rounded-full border border-border pl-10 pr-4 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-border"
            />
            <Icon
              iconName="icon/search"
              size={16}
              class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div class="flex-1"></div>

          <!-- Right icons -->
          <div class="flex items-center gap-4">
            <Icon
              iconName="icon/bell"
              size={20}
              class="text-muted-foreground cursor-pointer hover:text-foreground"
            />
            <Icon
              iconName="icon/settings"
              size={20}
              class="text-muted-foreground cursor-pointer hover:text-foreground"
            />
            <!-- UK flag emoji in circle -->
            <div class="w-7 h-7 rounded-full border border-border flex items-center justify-center text-base cursor-pointer overflow-hidden">
              🇬🇧
            </div>
            <!-- Profile avatar + dropdown -->
            <div class="relative">
              <img
                src="/Yohannes Abayneh.png"
                alt="Profile"
                class="w-8 h-8 rounded-full object-cover cursor-pointer border border-border"
                onclick={() => (showProfileDropdown = !showProfileDropdown)}
              />
              {#if showProfileDropdown}
                <div class="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <!-- User info -->
                  <div class="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <img src="/Yohannes Abayneh.png" alt="Profile" class="w-9 h-9 rounded-full object-cover shrink-0" />
                    <div>
                      <p class="text-sm font-semibold text-foreground">Yohannes Abayneh</p>
                      <a href="/dashboard/profile" class="text-xs text-info hover:underline" onclick={() => (showProfileDropdown = false)}>
                        View Profile →
                      </a>
                    </div>
                  </div>
                  <!-- Actions -->
                  <a href="/dashboard/setting" class="flex items-center justify-between px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors" onclick={() => (showProfileDropdown = false)}>
                    <span class="flex items-center gap-2">
                      <Icon iconName="icon/settings" size={16} class="text-muted-foreground" />
                      Change theme
                    </span>
                    <Icon iconName="icon/chevron-right" size={14} class="text-muted-foreground" />
                  </a>
                  <a href="/logout" class="flex items-center gap-2 px-4 py-3 text-sm text-destructive hover:bg-muted transition-colors">
                    <Icon iconName="icon/log-out" size={16} />
                    Log out
                  </a>
                </div>
              {/if}
            </div>
          </div>
        </header>
      {/if}
      <main
        class="flex flex-1 flex-col {isInvestorPage
          ? 'w-full h-screen overflow-auto p-0'
          : 'gap-4 overflow-auto'}"
      >
        {@render children()}
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>
