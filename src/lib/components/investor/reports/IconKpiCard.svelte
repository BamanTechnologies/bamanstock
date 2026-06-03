<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  interface Props {
    label: string;
    value: string;
    icon: string;
    iconBgClass: string;
    iconColor: string;
    borderColor: string;
  }

  let { label, value, icon, iconBgClass, iconColor, borderColor }: Props = $props();
</script>

<div class="bg-card border-2 {borderColor} rounded-2xl p-6 flex items-center gap-5">
  <div
    class="{iconBgClass} w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
  >
    <Icon iconName={icon as any} size={32} color={iconColor} />
  </div>
  <div class="flex flex-col gap-0.5">
    <span class="text-sm text-muted-foreground">{label}</span>
    <p class="text-2xl font-bold text-foreground">{value}</p>
  </div>
</div>
