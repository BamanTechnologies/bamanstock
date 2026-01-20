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
          <SidebarTrigger class="-ml-1" />
          <h1 class="text-2xl font-semibold text-foreground">{pageTitle}</h1>
          <div class="flex-1"></div>
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
            <!-- UK Flag - add to flags when available -->
            <div
              class="w-6 h-4 border border-border rounded cursor-pointer bg-blue-600"
            ></div>
            <div
              class="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer"
            >
              <Icon iconName="icon/user" size={16} />
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
