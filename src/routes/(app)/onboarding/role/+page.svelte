<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  type Role = "investor" | "merchant";

  let selectedRole: Role = $state("investor");
  let currentSlide = $state(0);
  let carouselContainer: HTMLDivElement;
  let isDragging = $state(false);
  let startX = $state(0);
  let scrollLeft = $state(0);

  const slides = [
    {
      title: "Organize stocks across locations",
      description:
        "Manage products, merchants, and inventory across all your branches from one secure platform.",
    },
    {
      title: "Real-time inventory tracking",
      description:
        "Get instant updates on stock levels, track movements, and prevent stockouts with automated alerts.",
    },
    {
      title: "Streamlined business operations",
      description:
        "Simplify your workflow with powerful analytics, reporting tools, and seamless integration capabilities.",
    },
  ];

  function goToSlide(index: number) {
    currentSlide = index;
    if (carouselContainer) {
      carouselContainer.scrollTo({
        left: index * carouselContainer.clientWidth,
        behavior: "smooth",
      });
    }
    // Reset auto-scroll timer when user manually navigates
    startAutoScroll();
  }

  function handleScroll() {
    if (carouselContainer && !isDragging) {
      const slideWidth = carouselContainer.clientWidth;
      const scrollPosition = carouselContainer.scrollLeft;
      currentSlide = Math.round(scrollPosition / slideWidth);
    }
  }

  function handleMouseDown(e: MouseEvent) {
    isDragging = true;
    startX = e.pageX - carouselContainer.offsetLeft;
    scrollLeft = carouselContainer.scrollLeft;
    carouselContainer.style.cursor = "grabbing";
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - carouselContainer.offsetLeft;
    const walk = (x - startX) * 2;
    carouselContainer.scrollLeft = scrollLeft - walk;
  }

  function handleMouseUp() {
    isDragging = false;
    if (carouselContainer) {
      carouselContainer.style.cursor = "grab";
    }
  }

  function handleTouchStart(e: TouchEvent) {
    isDragging = true;
    startX = e.touches[0].pageX - carouselContainer.offsetLeft;
    scrollLeft = carouselContainer.scrollLeft;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    const x = e.touches[0].pageX - carouselContainer.offsetLeft;
    const walk = (x - startX) * 2;
    carouselContainer.scrollLeft = scrollLeft - walk;
  }

  function handleTouchEnd() {
    isDragging = false;
  }

  function handleContinue() {
    if (selectedRole === "investor") {
      goto("/onboarding/signup?role=investor");
    } else {
      goto("/onboarding/signup?role=merchant");
    }
  }

  let autoScrollInterval: ReturnType<typeof setInterval> | null = null;

  function startAutoScroll() {
    if (autoScrollInterval) clearInterval(autoScrollInterval);
    autoScrollInterval = setInterval(() => {
      if (!isDragging && carouselContainer) {
        const nextSlide = (currentSlide + 1) % slides.length;
        goToSlide(nextSlide);
      }
    }, 3000);
  }

  function stopAutoScroll() {
    if (autoScrollInterval) {
      clearInterval(autoScrollInterval);
      autoScrollInterval = null;
    }
  }

  onMount(() => {
    if (carouselContainer) {
      carouselContainer.addEventListener("scroll", handleScroll);
      startAutoScroll();
    }
  });

  onDestroy(() => {
    stopAutoScroll();
  });

  // Pause auto-scroll when user interacts
  $effect(() => {
    if (isDragging) {
      stopAutoScroll();
    } else {
      startAutoScroll();
    }
  });
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div
    class="w-full max-w-6xl flex flex-col lg:flex-row rounded-2xl overflow-hidden"
  >
    <div
      class="hidden lg:block lg:w-1/2 relative bg-cover bg-center overflow-hidden"
      style="background-image: url('/role.jpg');"
    >
      <div
        class="absolute inset-0 z-0"
        style="background: linear-gradient(157.39deg, rgba(0, 136, 251, 0.75) -10.27%, rgba(14, 65, 108, 0.97) 98.36%);"
      ></div>

      <div
        class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent z-0"
      ></div>

      <div
        class="relative z-10 flex flex-col justify-between h-full p-12 text-white"
      >
        <!-- Slides container -->
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div
          bind:this={carouselContainer}
          class="flex-1 flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          style="scroll-snap-type: x mandatory; cursor: grab;"
          role="region"
          aria-label="Onboarding carousel"
          onscroll={handleScroll}
          onmousedown={handleMouseDown}
          onmousemove={handleMouseMove}
          onmouseup={handleMouseUp}
          onmouseleave={handleMouseUp}
          ontouchstart={handleTouchStart}
          ontouchmove={handleTouchMove}
          ontouchend={handleTouchEnd}
        >
          {#each slides as slide, index}
            <div
              class="min-w-full h-full flex flex-col justify-center snap-start"
            >
              <div class="space-y-12 max-w-md">
                <div class="flex items-center gap-3">
                  <div
                    class="w-12 h-12 bg-white rounded-lg flex items-center justify-center"
                  >
                    <Icon
                      iconName="icon/trending-up"
                      size={32}
                      class="text-info"
                    />
                  </div>
                  <span class="text-2xl font-bold tracking-wide"
                    >BAMANSTOCK</span
                  >
                </div>

                <div class="space-y-4">
                  <h1 class="text-[29px] font-bold leading-[38px]">
                    {slide.title}
                  </h1>
                  <p class="text-xs leading-4 text-white/90">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          {/each}
        </div>

        <!-- Navigation indicators -->
        <div class="flex items-center gap-2 pb-8">
          {#each slides as _, index}
            <button
              type="button"
              class="transition-all duration-300 {currentSlide === index
                ? 'w-8 h-1.5 bg-white rounded-full'
                : 'w-1.5 h-1.5 bg-white/50 rounded-full hover:bg-white/75'}"
              onclick={() => goToSlide(index)}
              aria-label="Go to slide {index + 1}"
            ></button>
          {/each}
        </div>
      </div>
    </div>

    <div
      class="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 lg:p-16"
    >
      <div class="w-full max-w-md space-y-8">
        <div class="space-y-2 text-center lg:text-left">
          <h2 class="text-2xl font-bold text-foreground">Select your role</h2>
          <p
            class="text-[12px] leading-4 font-normal max-w-[364px] h-4 flex items-center"
            style="font-family: 'Raleway', sans-serif; color: #7E7E7E;"
          >
            Select your role below to tailor your experience on BamanStock.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button
            type="button"
            class="relative p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all {selectedRole ===
            'investor'
              ? 'ring-2 ring-info ring-offset-2'
              : ''}"
            onclick={() => (selectedRole = "investor")}
          >
            {#if selectedRole === 'investor'}
              <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-info flex items-center justify-center">
                <Icon
                  iconName="icon/check-circle"
                  size={16}
                  class="text-info-foreground"
                />
              </div>
            {/if}
            <div class="flex flex-col items-center gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
              >
                <Icon
                  iconName="icon/trending-up"
                  size={28}
                  class="text-info"
                />
              </div>
              <span class="font-medium">Investor</span>
            </div>
          </button>

          <button
            type="button"
            class="relative p-6 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all {selectedRole ===
            'merchant'
              ? 'ring-2 ring-info ring-offset-2'
              : ''}"
            onclick={() => (selectedRole = "merchant")}
          >
            {#if selectedRole === 'merchant'}
              <div class="absolute top-2 right-2 w-6 h-6 rounded-full bg-info flex items-center justify-center">
                <Icon
                  iconName="icon/check-circle"
                  size={16}
                  class="text-info-foreground"
                />
              </div>
            {/if}
            <div class="flex flex-col items-center gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center"
              >
                <Icon iconName="icon/store" size={28} class="text-info" />
              </div>
              <span class="font-medium">Merchant</span>
            </div>
          </button>
        </div>

        <Button
          size="lg"
          class="w-full hover:cursor-pointer bg-info rounded-full py-6 flex items-center justify-center"
          onclick={handleContinue}
        >
          <span
            class="h-5 flex items-center justify-center text-center"
            style="font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 15px; line-height: 20px; color: #FFFFFF; max-width: 364px; flex-grow: 1;"
          >
            Continue as {selectedRole === "investor" ? "Investor" : "Merchant"}
          </span>
        </Button>

        <div class="text-center text-sm text-muted-foreground">
          Already have an account?
          <a href="/onboarding/signin" class="text-info font-bold ml-1">
            Log In
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
</style>
