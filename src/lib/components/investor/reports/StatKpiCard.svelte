<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  interface Props {
    label: string;
    value: string;
    change: string;
    changeLabel: string;
    valueColor?: string;
    icon?: string;
    iconColor?: string;
    textColor?: string;
  }

  let {
    label,
    value,
    change,
    changeLabel,
    valueColor = "text-foreground",
    icon,
    iconColor,
    textColor,
  }: Props = $props();
</script>

<div class="bg-card border border-border rounded-lg p-3 sm:p-5">
  <div class="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-3">
    {#if icon}
      <div
        class="{iconColor} w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
      >
        <Icon iconName={icon as any} size={18} class={textColor} />
      </div>
    {/if}
    <span class="text-xs sm:text-sm text-muted-foreground">{label}</span>
  </div>
  <p class="text-lg sm:text-2xl font-bold {valueColor} mb-3">{value}</p>
  <div class="flex items-center gap-3">
    <div
      class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs sm:text-sm font-medium"
    >
      <Icon iconName="icon/arrow-up" size={11} />
      <span>{change}%</span>
    </div>
    <p class="text-xs sm:text-sm text-muted-foreground">{changeLabel}</p>
  </div>
</div>
