<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
</script>

<div class="min-h-screen bg-background flex items-center justify-center">
  <div class="container mx-auto px-6 py-12 text-center space-y-8">
    <div class="space-y-4">
      <div class="flex items-center justify-center gap-3">
        <Icon iconName="icon/home" size={48} class="text-primary" />
        <h1 class="text-4xl font-bold text-foreground">BamanStock</h1>
      </div>
      <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
        Welcome to BamanStock Design System. Explore our guidelines for colors,
        icons, and components.
      </p>
    </div>

    <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
      <Button size="lg" href="/guideline" class="min-w-[200px]">
        <Icon iconName="icon/settings" size={20} />
        View Guidelines
      </Button>
      <Button
        variant="outline"
        size="lg"
        href="/onboarding/role"
        class="min-w-[200px]"
      >
        <Icon iconName="icon/user" size={20} />
        Get Started
      </Button>
    </div>

    <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <div class="p-6 bg-card border border-border rounded-lg">
        <Icon iconName="icon/settings" size={32} class="text-primary mb-3" />
        <h3 class="font-semibold text-foreground mb-2">Color System</h3>
        <p class="text-sm text-muted-foreground">
          OKLCH-based color system with dark mode support
        </p>
      </div>
      <div class="p-6 bg-card border border-border rounded-lg">
        <Icon iconName="icon/user" size={32} class="text-primary mb-3" />
        <h3 class="font-semibold text-foreground mb-2">Icon System</h3>
        <p class="text-sm text-muted-foreground">
          Centralized icon management with Lucide Svelte
        </p>
      </div>
      <div class="p-6 bg-card border border-border rounded-lg">
        <Icon iconName="icon/package" size={32} class="text-primary mb-3" />
        <h3 class="font-semibold text-foreground mb-2">Components</h3>
        <p class="text-sm text-muted-foreground">
          Reusable UI components built with Svelte 5
        </p>
      </div>
    </div>
  </div>
</div>
