<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  const stats = [
    { label: "Total Investors", value: "95", change: "-19%", trend: "down", color: "text-[#A855F7]", bg: "bg-[#F5F3FF]", icon: "icon/users" },
    { label: "Total Merchant", value: "2891", change: "+35%", trend: "up", color: "text-[#06B6D4]", bg: "bg-[#ECFEFF]", icon: "icon/user" },
    { label: "Total Revenue", value: "$29,350.89", change: "-19%", trend: "down", color: "text-[#10B981]", bg: "bg-[#F0FDF4]", icon: "icon/bar-chart" },
    { label: "System Status", value: "Healthy", change: "+41%", trend: "up", color: "text-[#22C55E]", bg: "bg-[#F0FDF4]", icon: "icon/activity" }
  ];

  const activities = [
    { id: "1", title: "Merchant Suspended", desc: "Merchant ID #19302 violated TOS", time: "1m", icon: "icon/user-minus", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]" },
    { id: "2", title: "Subscription Upgraded", desc: "Sarah J. switched to Pro Plan", time: "1m", icon: "icon/trending-up", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]" },
    { id: "3", title: "New User Registration", desc: "Mike Ross joined as Merchant", time: "1m", icon: "icon/user-plus", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]" },
    { id: "4", title: "Invoice Generated", desc: "Invoice #NV0293 sent to a client", time: "1m", icon: "icon/file-text", iconBg: "bg-[#DBEAFE]", iconColor: "text-[#3B82F6]" }
  ];
</script>

<div class="space-y-6 p-2">
  <div class="flex items-center justify-between mb-8">
    <h2 class="text-2xl font-semibold text-slate-800">Welcome, Alex</h2>
    <div class="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
      <Icon iconName="icon/calendar" size={14} />
      <span>01 Jan 2024 - 07 Jan 2024</span>
    </div>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each stats as stat}
      <div class="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between min-h-[140px]">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-xl font-bold text-slate-900 leading-tight">{stat.value}</p>
            <p class="text-[13px] text-slate-400 mt-1 font-normal">{stat.label}</p>
          </div>
          <div class="{stat.bg} {stat.color} p-2.5 rounded-lg">
            <Icon iconName={stat.icon as any} size={20} />
          </div>
        </div>
 
        <div class="mt-4 pt-4 border-t border-slate-50 flex items-center gap-1">
          <span class="text-xs font-bold {stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}">
            {stat.change}
          </span>
          <span class="text-xs text-slate-400">vs Last Month</span>
        </div>
      </div>
    {/each}
  </div>

  <div class="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-8">
    <div class="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
      <h3 class="text-base font-bold text-slate-800">Recent Activity</h3>
      <button class="text-xs font-bold text-[#4DA0E6] hover:text-blue-600">View All</button>
    </div>
    
    <div class="divide-y divide-slate-50">
      {#each activities as activity}
        <div class="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
          <div class="flex items-center gap-4">
            <div class="{activity.iconBg} {activity.iconColor} w-10 h-10 rounded-lg flex items-center justify-center">
              <Icon iconName={activity.icon as any} size={18} />
            </div>
            <div>
              <h4 class="text-sm font-bold text-slate-800 leading-tight">{activity.title}</h4>
              <p class="text-xs text-slate-400 mt-0.5">{activity.desc}</p>
            </div>
          </div>
          <span class="text-xs font-medium text-blue-400">{activity.time}</span>
        </div>
      {/each}
    </div>
  </div>
</div>