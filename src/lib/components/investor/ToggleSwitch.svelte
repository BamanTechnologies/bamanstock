<script lang="ts">
  interface ToggleSwitchProps {
    label: string;
    checked?: boolean;
    onToggle?: (checked: boolean) => void;
  }

  let { label, checked = $bindable(false), onToggle }: ToggleSwitchProps = $props();

  function handleToggle() {
    checked = !checked;
    onToggle?.(checked);
  }
</script>

<div class="flex items-center justify-between py-2">
  <span class="text-sm font-medium text-foreground">{label}</span>
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-info focus:ring-offset-2 {checked
      ? 'bg-info'
      : 'bg-muted'}"
    onclick={handleToggle}
  >
    <span
      class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {checked
        ? 'translate-x-6'
        : 'translate-x-1'}"
    ></span>
  </button>
</div>
