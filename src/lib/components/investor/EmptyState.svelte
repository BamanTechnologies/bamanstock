<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon, { type IconType } from "$lib/components/ui/Icon/index.js";

  interface EmptyStateProps {
    icon?: IconType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    illustration?: "location" | "stock" | "stock-page" | "merchants";
  }

  let {
    icon,
    title,
    description,
    actionLabel,
    onAction,
    illustration,
  }: EmptyStateProps = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 px-6">
  <!-- Illustration -->
  <div class="relative mb-8">
    {#if illustration === "location"}
      <!-- Location Empty State: Globe with map pin and question mark -->
      <div class="relative w-64 h-64">
        <!-- Globe background -->
        <div
          class="absolute inset-0 rounded-full bg-blue-50 flex items-center justify-center"
        >
          <div
            class="w-48 h-48 rounded-full bg-blue-100 flex items-center justify-center"
          >
            <div
              class="w-32 h-32 rounded-full bg-blue-200 flex items-center justify-center"
            >
              <!-- Globe lines -->
              <div class="absolute inset-0">
                <div
                  class="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-300/30"
                ></div>
                <div
                  class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-300/30"
                ></div>
                <div
                  class="absolute top-1/4 left-0 right-0 h-0.5 bg-blue-300/20 rotate-12"
                ></div>
                <div
                  class="absolute top-3/4 left-0 right-0 h-0.5 bg-blue-300/20 -rotate-12"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <!-- Map pin -->
        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 transform">
          <Icon
            iconName="icon/map-pin"
            size={48}
            class="text-red-500 drop-shadow-lg"
          />
        </div>
        <!-- Question mark -->
        <div class="absolute top-4 right-8 transform">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-md"
          >
            <span class="text-3xl font-bold text-blue-600">?</span>
          </div>
        </div>
      </div>
    {:else if illustration === "stock"}
      <!-- Stock Empty State: Box with question mark -->
      <div class="relative w-64 h-64">
        <!-- Box background -->
        <div class="absolute inset-0 flex items-center justify-center">
          <div
            class="w-48 h-48 bg-blue-50 rounded-lg flex items-center justify-center shadow-lg"
          >
            <Icon iconName="icon/box" size={96} class="text-blue-200" />
          </div>
        </div>
        <!-- Question mark -->
        <div class="absolute top-4 right-4 transform">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-md"
          >
            <span class="text-3xl font-bold text-blue-600">?</span>
          </div>
        </div>
      </div>
    {:else if illustration === "stock-page"}
      <!-- Stock Page Empty State: Box with fly/bug above it -->
      <div class="relative w-64 h-64">
        <!-- Light grey circle background -->
        <div
          class="absolute inset-0 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <!-- Brown cardboard box -->
          <div
            class="w-40 h-32 bg-amber-800 rounded-lg flex items-center justify-center shadow-lg relative"
          >
            <!-- Box opening/lid effect -->
            <div
              class="absolute top-0 left-0 right-0 h-8 bg-amber-900 rounded-t-lg"
            ></div>
            <!-- Box interior (lighter) -->
            <div
              class="w-32 h-20 bg-amber-700 rounded mt-2 border-2 border-amber-900"
            ></div>
          </div>
        </div>
        <!-- Fly/bug above the box with dotted path -->
        <div class="absolute top-8 left-1/2 -translate-x-1/2">
          <!-- Dotted line path -->
          <svg
            class="absolute -top-4 left-1/2 -translate-x-1/2"
            width="40"
            height="20"
            viewBox="0 0 40 20"
          >
            <path
              d="M 0 10 Q 10 5, 20 10 T 40 10"
              stroke="#9ca3af"
              stroke-width="2"
              fill="none"
              stroke-dasharray="4 4"
            />
          </svg>
          <!-- Fly/bug icon (using a simple circle with wings) -->
          <div
            class="relative w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center"
          >
            <!-- Body -->
            <div class="w-4 h-4 bg-gray-500 rounded-full"></div>
            <!-- Wings -->
            <div
              class="absolute -left-1 top-1 w-3 h-2 bg-gray-300 rounded-full opacity-60"
            ></div>
            <div
              class="absolute -right-1 top-1 w-3 h-2 bg-gray-300 rounded-full opacity-60"
            ></div>
          </div>
        </div>
      </div>
    {:else if illustration === "merchants"}
      <!-- Merchants Empty State: User faces with question mark -->
      <div class="relative w-64 h-64">
        <!-- User faces background -->
        <div class="absolute inset-0 flex items-center justify-center gap-4">
          <!-- Three user avatars in a row -->
          <div
            class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg"
          >
            <Icon iconName="icon/user" size={40} class="text-blue-400" />
          </div>
          <div
            class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg -mt-8"
          >
            <Icon iconName="icon/user" size={40} class="text-blue-400" />
          </div>
          <div
            class="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-white shadow-lg"
          >
            <Icon iconName="icon/user" size={40} class="text-blue-400" />
          </div>
        </div>
        <!-- Question mark -->
        <div class="absolute top-4 right-4 transform">
          <div
            class="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center shadow-md"
          >
            <span class="text-3xl font-bold text-blue-600">?</span>
          </div>
        </div>
      </div>
    {:else if icon}
      <!-- Simple icon fallback -->
      <div
        class="w-32 h-32 rounded-full bg-muted flex items-center justify-center mb-4"
      >
        <Icon iconName={icon} size={64} class="text-muted-foreground" />
      </div>
    {/if}
  </div>

  <!-- Title -->
  <h3 class="text-2xl font-bold text-foreground mb-3">{title}</h3>

  <!-- Description -->
  <p class="text-muted-foreground text-center max-w-md mb-6">
    {description}
  </p>

  <!-- Action Button -->
  {#if actionLabel && onAction}
    <Button
      class="bg-[var(--primary-blue)] text-white hover:opacity-90"
      onclick={onAction}
    >
      {actionLabel}
    </Button>
  {/if}
</div>
