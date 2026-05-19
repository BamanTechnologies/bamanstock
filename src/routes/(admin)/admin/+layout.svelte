<script lang="ts">
  import "../../../app.css";
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

  let { children } = $props();

  const adminNavigation = [
    { title: "Dashboard", icon: "icon/layout-grid", href: "/admin/dashboard" },
    { title: "Users", icon: "icon/users", href: "/admin/users" },
    { title: "Activity Log", icon: "icon/activity", href: "/admin/activity" },
    { title: "Subscription", icon: "icon/credit-card", href: "/admin/subscription" },
    { title: "Setting", icon: "icon/settings", href: "/admin/setting" },
  ];
</script>

<SidebarProvider>
  <div class="flex min-h-screen w-full bg-[#F8FAFC]">
    <Sidebar>
      <SidebarHeader>
        <div class="flex items-center gap-2 px-4 py-2">
          <div class="w-10 h-10 rounded-xl bg-info flex items-center justify-center">
            <Icon iconName="icon/trending-up" size={20} class="text-info-foreground" />
          </div>
          <span class="text-xl font-bold text-info">BAMANSTOCK</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu class="gap-1 px-2">
              {#each adminNavigation as item}
                <SidebarMenuItem>
                  <a href={item.href} class="block">
                    <SidebarMenuButton 
                      isActive={$page.url.pathname === item.href}
                      class="px-4 py-6 rounded-lg transition-all"
                    >
                      <Icon iconName={item.icon as any} size={20} />
                      <span class="font-medium">{item.title}</span>
                    </SidebarMenuButton>
                  </a>
                </SidebarMenuItem>
              {/each}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="p-4">
        <a href="/logout" class="flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
          <Icon iconName="icon/log-out" size={20} />
          <span class="font-medium">Logout</span>
        </a>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header class="flex h-20 items-center justify-between px-8 bg-white border-b border-slate-100">
        <div class="flex items-center gap-4 flex-1">
          <SidebarTrigger />
          <div class="relative w-full max-w-md">
            <Icon iconName="icon/search" size={18} class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search" 
              class="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div class="flex items-center gap-6">
          <Icon iconName="icon/bell" size={22} class="text-slate-400 cursor-pointer hover:text-slate-600" />
          <Icon iconName="icon/settings" size={22} class="text-slate-400 cursor-pointer hover:text-slate-600" />
          <div class="flex items-center gap-3 pl-4 border-l border-slate-100">
             <div class="w-6 h-4 rounded-sm bg-blue-600 border border-border flex items-center justify-center">
               <span class="text-[7px] font-bold text-white leading-none">EN</span>
             </div>
             <div class="w-10 h-10 rounded-full bg-info/10 border-2 border-white shadow-sm flex items-center justify-center">
               <Icon iconName="icon/user" size={20} class="text-info" />
             </div>
          </div>
        </div>
      </header>
      
      <main class="p-8">
        {@render children()}
      </main>
    </SidebarInset>
  </div>
</SidebarProvider>