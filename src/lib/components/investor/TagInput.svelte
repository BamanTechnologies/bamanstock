<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Input } from "$lib/components/ui/input/index.js";

  interface TagInputProps {
    tags?: string[];
    placeholder?: string;
    onAdd?: (tag: string) => void;
    onRemove?: (tag: string) => void;
  }

  let {
    tags = $bindable([]),
    placeholder = "Add...",
    onAdd,
    onRemove,
  }: TagInputProps = $props();

  let inputValue = $state("");

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      const newTag = inputValue.trim();
      if (!tags.includes(newTag)) {
        tags = [...tags, newTag];
        onAdd?.(newTag);
      }
      inputValue = "";
    }
  }

  function removeTag(tag: string) {
    tags = tags.filter((t) => t !== tag);
    onRemove?.(tag);
  }
</script>

<div
  class="flex flex-wrap items-center gap-2 min-h-9 px-3 py-2 border border-input rounded-md bg-background focus-within:ring-2 focus-within:ring-info focus-within:ring-offset-1"
>
  {#each tags as tag}
    <div
      class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-muted rounded-md text-sm"
    >
      <span class="text-foreground">{tag}</span>
      <button
        type="button"
        class="text-muted-foreground hover:text-foreground transition-colors"
        onclick={() => removeTag(tag)}
        aria-label="Remove {tag}"
      >
        <Icon iconName="icon/x" size={14} />
      </button>
    </div>
  {/each}
  <Input
    type="text"
    bind:value={inputValue}
    {placeholder}
    class="flex-1 min-w-[120px] border-0 focus-visible:ring-0 p-0 h-auto"
    onkeydown={handleKeyDown}
  />
</div>
