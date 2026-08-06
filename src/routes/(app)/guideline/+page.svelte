<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon, { type IconType } from "$lib/components/ui/Icon/index.js";
  import { IconMap } from "$assets/index.js";

  // Get all icon names organized by category
  const iconCategories = {
    "Navigation & UI": [
      "icon/menu",
      "icon/search",
      "icon/home",
      "icon/settings",
      "icon/user",
      "icon/users",
      "icon/bell",
      "icon/mail",
    ] as IconType[],
    Actions: [
      "icon/plus",
      "icon/minus",
      "icon/x",
      "icon/check",
      "icon/edit",
      "icon/trash",
      "icon/save",
      "icon/download",
      "icon/upload",
    ] as IconType[],
    Commerce: [
      "icon/shopping-cart",
      "icon/shopping-bag",
      "icon/package",
      "icon/credit-card",
    ] as IconType[],
    "Media & Files": ["icon/image", "icon/file", "icon/folder"] as IconType[],
    "Arrows & Navigation": [
      "icon/arrow-left",
      "icon/arrow-right",
      "icon/arrow-up",
      "icon/arrow-down",
      "icon/chevron-left",
      "icon/chevron-right",
    ] as IconType[],
    "Status & Feedback": [
      "icon/info",
      "icon/alert-circle",
      "icon/check-circle",
      "icon/x-circle",
    ] as IconType[],
  };

  // Color palette organized by category
  const colorCategories = {
    "Primary Colors": [
      { name: "primary", var: "--primary", foreground: "--primary-foreground" },
      {
        name: "secondary",
        var: "--secondary",
        foreground: "--secondary-foreground",
      },
      { name: "accent", var: "--accent", foreground: "--accent-foreground" },
    ],
    "Semantic Colors": [
      {
        name: "destructive",
        var: "--destructive",
        foreground: "--destructive-foreground",
      },
      { name: "success", var: "--success", foreground: "--success-foreground" },
      { name: "warning", var: "--warning", foreground: "--warning-foreground" },
      { name: "info", var: "--info", foreground: "--info-foreground" },
    ],
    "UI Colors": [
      { name: "background", var: "--background", foreground: "--foreground" },
      { name: "card", var: "--card", foreground: "--card-foreground" },
      { name: "muted", var: "--muted", foreground: "--muted-foreground" },
      { name: "border", var: "--border" },
      { name: "input", var: "--input" },
      { name: "ring", var: "--ring" },
    ],
  };
</script>

<div class="min-h-screen bg-background">
  <!-- Header -->
  <header class="border-b border-border bg-card">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center gap-3">
        <Icon iconName="icon/home" size={24} class="text-primary" />
        <h1 class="text-2xl font-bold text-foreground">
          BamanStock Design System
        </h1>
      </div>
      <p class="mt-2 text-sm text-muted-foreground">
        Guidelines for using colors and icons in the project
      </p>
    </div>
  </header>

  <main class="container mx-auto px-6 py-8 space-y-12">
    <!-- Color System Section -->
    <section>
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-foreground mb-2">Color System</h2>
        <p class="text-muted-foreground">
          All colors are defined using OKLCH color space in <code
            class="px-1.5 py-0.5 rounded bg-muted text-sm">src/app.css</code
          >. Use CSS variables for consistent theming and dark mode support.
        </p>
      </div>

      {#each Object.entries(colorCategories) as [category, colors]}
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-foreground mb-4">{category}</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each colors as color}
              <div class="border border-border rounded-lg overflow-hidden">
                <div
                  class="h-24 flex items-center justify-center"
                  style="background-color: var({color.var})"
                >
                  {#if color.foreground}
                    <span
                      class="text-sm font-medium px-3 py-1 rounded"
                      style="color: var({color.foreground})"
                    >
                      {color.name}
                    </span>
                  {:else}
                    <span class="text-sm font-medium text-foreground/50">
                      {color.name}
                    </span>
                  {/if}
                </div>
                <div class="p-3 bg-card border-t border-border">
                  <code class="text-xs text-muted-foreground">
                    var({color.var})
                  </code>
                  {#if color.foreground}
                    <br />
                    <code class="text-xs text-muted-foreground">
                      var({color.foreground})
                    </code>
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/each}

      <!-- Usage Example -->
      <div class="mt-8 p-6 bg-card border border-border rounded-lg">
        <h4 class="text-lg font-semibold mb-3">Usage Example</h4>
        <div class="space-y-3">
          <div class="flex gap-3">
            <Button variant="default">Primary Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
          <div class="flex gap-3">
            <div
              class="px-4 py-2 rounded bg-success text-success-foreground text-sm font-medium"
            >
              Success Message
            </div>
            <div
              class="px-4 py-2 rounded bg-warning text-warning-foreground text-sm font-medium"
            >
              Warning Message
            </div>
            <div
              class="px-4 py-2 rounded bg-info text-info-foreground text-sm font-medium"
            >
              Info Message
            </div>
          </div>
          <pre class="p-4 bg-muted rounded text-xs overflow-x-auto"><code
              >{`<!-- In your Svelte components -->
<div class="bg-primary text-primary-foreground">
  Primary content
</div>

<!-- Or use Tailwind classes -->
<div class="bg-success text-success-foreground">
  Success message
</div>`}</code
            ></pre>
        </div>
      </div>
    </section>

    <!-- Icon System Section -->
    <section>
      <div class="mb-6">
        <h2 class="text-3xl font-bold text-foreground mb-2">Icon System</h2>
        <p class="text-muted-foreground mb-2">
          Icons are managed centrally in <code
            class="px-1.5 py-0.5 rounded bg-muted text-sm"
            >src/assets/index.ts</code
          >.
        </p>
        <div class="text-sm text-muted-foreground space-y-1">
          <p>
            • <strong>Lucide Icons:</strong> Already available icons from Lucide
            Svelte
          </p>
          <p>
            • <strong>Custom Icons:</strong> Add SVG files to
            <code class="px-1 py-0.5 rounded bg-muted">src/assets/icon/</code> or
            category folders
          </p>
          <p>
            • <strong>Flags:</strong> Add PNG files to
            <code class="px-1 py-0.5 rounded bg-muted">src/assets/flags/</code>
          </p>
          <p>
            • <strong>Technology:</strong> Add to
            <code class="px-1 py-0.5 rounded bg-muted"
              >src/assets/technology/</code
            >
          </p>
        </div>
      </div>

      {#each Object.entries(iconCategories) as [category, icons]}
        <div class="mb-8">
          <h3 class="text-xl font-semibold text-foreground mb-4">{category}</h3>
          <div
            class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4"
          >
            {#each icons as iconName}
              {@const iconExists = IconMap[iconName] !== undefined}
              {#if iconExists}
                <div
                  class="flex flex-col items-center gap-2 p-4 border border-border rounded-lg bg-card hover:bg-accent transition-colors"
                >
                  <Icon {iconName} size={32} class="text-foreground" />
                  <code
                    class="text-xs text-muted-foreground text-center break-all"
                  >
                    {iconName}
                  </code>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/each}

      <!-- Icon Sizes Example -->
      <div class="mt-8 p-6 bg-card border border-border rounded-lg">
        <h4 class="text-lg font-semibold mb-4">Icon Sizes</h4>
        <div class="flex items-center gap-6">
          <div class="flex flex-col items-center gap-2">
            <Icon iconName="icon/user" size={16} />
            <span class="text-xs text-muted-foreground">16px</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Icon iconName="icon/user" size={24} />
            <span class="text-xs text-muted-foreground">24px</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Icon iconName="icon/user" size={32} />
            <span class="text-xs text-muted-foreground">32px</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Icon iconName="icon/user" size={48} />
            <span class="text-xs text-muted-foreground">48px</span>
          </div>
          <div class="flex flex-col items-center gap-2">
            <Icon iconName="icon/user" size={64} />
            <span class="text-xs text-muted-foreground">64px</span>
          </div>
        </div>
      </div>

      <!-- Usage Example -->
      <div class="mt-6 p-6 bg-card border border-border rounded-lg">
        <h4 class="text-lg font-semibold mb-3">Usage Example</h4>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <Icon
              iconName="icon/search"
              size={20}
              class="text-muted-foreground"
            />
            <span class="text-sm text-foreground">Icon in text</span>
          </div>
          <Button>
            <Icon iconName="icon/plus" size={16} />
            Add Item
          </Button>
          <div class="flex gap-2">
            <Icon iconName="icon/check-circle" size={24} class="text-success" />
            <Icon iconName="icon/alert-circle" size={24} class="text-warning" />
            <Icon iconName="icon/x-circle" size={24} class="text-destructive" />
            <Icon iconName="icon/info" size={24} class="text-info" />
          </div>
          <pre class="p-4 bg-muted rounded text-xs overflow-x-auto"><code
              >{`<script>
  import Icon from "$lib/components/ui/Icon/index.js";
</script>

<!-- Basic usage -->
<Icon iconName="icon/user" size={24} />

<!-- With custom styling -->
<Icon iconName="icon/check-circle" size={24} class="text-success" />

<!-- In buttons -->
<Button>
  <Icon iconName="icon/plus" size={16} />
  Add Item
</Button>`}</code
            ></pre>
        </div>
      </div>
    </section>

    <!-- Guidelines Section -->
    <section class="border-t border-border pt-8">
      <h2 class="text-3xl font-bold text-foreground mb-4">Guidelines</h2>
      <div class="grid md:grid-cols-2 gap-6">
        <div class="p-6 bg-card border border-border rounded-lg">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon iconName="icon/settings" size={20} class="text-primary" />
            Adding Colors
          </h3>
          <ol
            class="text-sm text-muted-foreground space-y-2 list-decimal list-inside"
          >
            <li>
              Open <code class="px-1 py-0.5 rounded bg-muted">src/app.css</code>
            </li>
            <li>
              Add color variable in <code class="px-1 py-0.5 rounded bg-muted"
                >:root</code
              >
              and <code class="px-1 py-0.5 rounded bg-muted">.dark</code>
            </li>
            <li>
              Add to <code class="px-1 py-0.5 rounded bg-muted"
                >@theme inline</code
              > for Tailwind access
            </li>
            <li>
              Use OKLCH format: <code class="px-1 py-0.5 rounded bg-muted"
                >oklch(L C H)</code
              >
            </li>
          </ol>
        </div>

        <div class="p-6 bg-card border border-border rounded-lg">
          <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Icon iconName="icon/plus" size={20} class="text-primary" />
            Adding Icons
          </h3>
          <ol
            class="text-sm text-muted-foreground space-y-2 list-decimal list-inside"
          >
            <li>
              <strong>Lucide:</strong> Add to
              <code class="px-1 py-0.5 rounded bg-muted">icon</code>
              object in
              <code class="px-1 py-0.5 rounded bg-muted"
                >src/assets/index.ts</code
              >
            </li>
            <li>
              <strong>Custom SVG:</strong> Place in
              <code class="px-1 py-0.5 rounded bg-muted">src/assets/icon/</code>
              and import
            </li>
            <li>
              <strong>Flags:</strong> Place PNG in
              <code class="px-1 py-0.5 rounded bg-muted">src/assets/flags/</code
              >
            </li>
            <li>
              Use format: <code class="px-1 py-0.5 rounded bg-muted"
                >'category/name'</code
              >
            </li>
          </ol>
        </div>
      </div>
    </section>
  </main>
</div>

<style>
  code {
    font-family: "Raleway", sans-serif;
  }
</style>
