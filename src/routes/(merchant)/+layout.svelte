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
  import { goto } from "$app/navigation";

  let { children } = $props();

  let profileDropdownOpen = $state(false);
  let profileDropdownRef = $state<HTMLDivElement | undefined>(undefined);
  let profileButtonRef = $state<HTMLDivElement | undefined>(undefined);

  function toggleProfileDropdown() {
    profileDropdownOpen = !profileDropdownOpen;
  }

  function closeProfileDropdown() {
    profileDropdownOpen = false;
  }

  const navigation = [
    { title: "Dashboard", icon: "icon/layout-grid", href: "/merchant/dashboard" },
    { title: "Orders", icon: "icon/shopping-cart", href: "/merchant/dashboard/orders" },
    { title: "Payments", icon: "icon/dollar-sign", href: "/merchant/dashboard/payments" },
    { title: "Stocks", icon: "icon/box", href: "/merchant/dashboard/stocks" },
    { title: "Credit", icon: "icon/credit-card", href: "/merchant/dashboard/credit" },
    { title: "Reports", icon: "icon/bar-chart", href: "/merchant/dashboard/reports" },
    { title: "Setting", icon: "icon/dashboard/setting", href: "/merchant/dashboard/setting" },
  ];

  const pageTitle = $derived.by(() => {
    const path = $page.url.pathname;
    const item = navigation.find(nav => nav.href === path);
    return item ? item.title : "Dashboard";
  });

  function handleClickOutside(event: MouseEvent) {
    if (
      profileDropdownRef &&
      profileButtonRef &&
      !profileDropdownRef.contains(event.target as Node) &&
      !profileButtonRef.contains(event.target as Node)
    ) {
      closeProfileDropdown();
    }
  }

  $effect(() => {
    if (profileDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  });
</script>

<SidebarProvider>
  <div class="flex min-h-screen w-full">
    <Sidebar>
      <SidebarHeader>
        <div class="flex items-center px-4 py-2">
          <img
            src="/bamanstock-logo.png"
            alt="BAMANSTOCK"
            style="width: 223px; height: 66.17px;"
            class="object-contain"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu class="gap-2">
              {#each navigation as item}
                <SidebarMenuItem>
                  <a href={item.href} class="block">
                    <SidebarMenuButton isActive={$page.url.pathname === item.href}>
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
              <SidebarMenuButton class="text-destructive">
                <Icon iconName="icon/log-out" size={20} />
                <span>Logout</span>
              </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-6">
        <SidebarTrigger class="-ml-1" />
        <h1 class="text-2xl font-semibold text-foreground">{pageTitle}</h1>
        <div class="flex-1"></div>
        <div class="flex items-center gap-4">
          <Icon iconName="icon/bell" size={20} class="text-muted-foreground cursor-pointer" />
          <Icon iconName="icon/settings" size={20} class="text-muted-foreground cursor-pointer" />
          
          <div class="relative" bind:this={profileButtonRef}>
            <button
              type="button"
              onclick={toggleProfileDropdown}
              class="w-8 h-8 rounded-full overflow-hidden border border-border"
            >
              <img src="/path-to-merchant-avatar.png" alt="Profile" class="w-full h-full object-cover" />
            </button>

            {#if profileDropdownOpen}
              <div
                bind:this={profileDropdownRef}
                class="absolute right-0 top-12 w-64 bg-white rounded-lg shadow-lg border border-border z-50"
              >
                <div class="p-4 border-b border-border">
                  <p class="text-sm font-semibold">Alex Merchant</p>
                  <p class="text-xs text-muted-foreground">alex@example.com</p>
                </div>
                <button 
                  class="w-full px-4 py-2 text-left text-sm hover:bg-muted"
                  onclick={() => goto("/merchant/dashboard/setting")}
                >
                  Settings
                </button>
                <button 
                  class="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-muted"
                  onclick={() => goto("/logout")}
                >
                  Log out
                </button>
              </div>
            {/if}
          </div>
        </div>
      </header>
      <main class="flex flex-1 flex-col overflow-auto">
        {@render children()}
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>