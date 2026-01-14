<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import { onMount, onDestroy } from "svelte";

  const role = $derived($page.url.searchParams.get("role") || "investor");

  let otpValues = $state(["", "", "", ""]);
  let otpInputs: (HTMLInputElement | null)[] = $state([]);
  let resendTimer = $state(29);
  let canResend = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;
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

  onMount(() => {
    intervalId = setInterval(() => {
      if (resendTimer > 0) {
        resendTimer--;
      } else {
        canResend = true;
        if (intervalId) clearInterval(intervalId);
      }
    }, 1000);
    setTimeout(() => otpInputs[0]?.focus(), 100);
    if (carouselContainer) {
      carouselContainer.addEventListener("scroll", handleScroll);
    }
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }

  function handleResend() {
    if (canResend) {
      resendTimer = 29;
      canResend = false;
      otpValues = ["", "", "", ""];
      otpInputs[0]?.focus();
    }
  }

  function handleInput(index: number, e: Event) {
    const target = e.currentTarget as HTMLInputElement;
    const value = target.value.slice(-1);
    if (value && !/^\d$/.test(value)) {
      target.value = otpValues[index];
      return;
    }
    otpValues[index] = value;
    if (value && index < 3) otpInputs[index + 1]?.focus();
  }

  function handleKeyDown(index: number, e: KeyboardEvent) {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputs[index - 1]?.focus();
    }
  }

  function handlePaste(e: ClipboardEvent) {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData("text") || "").slice(0, 4);
    const digits = pasted.match(/\d/g) || [];
    digits.forEach((d, i) => {
      if (i < 4) {
        otpValues[i] = d;
        otpInputs[i]!.value = d;
      }
    });
    const next = Math.min(digits.length, 3);
    otpInputs[next]?.focus();
  }

  let isComplete = $derived(otpValues.every((v) => v !== ""));
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div
    class="w-full max-w-6xl flex flex-col lg:flex-row shadow-2xl rounded-2xl overflow-hidden"
  >
    <!-- Left side: Consistent across all onboarding pages -->
    <div
      class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center overflow-hidden"
      style="background-image: url('/role.jpg');"
    >
      <!-- Rich blue gradient overlay -->
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
                    class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md"
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

                <!-- Content -->
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
      <div class="w-full max-w-md space-y-10">
        <div class="space-y-2 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-foreground">Verification Code</h2>
          <p class="text-muted-foreground">
            We have sent a verification code to your number +251 ****
          </p>
        </div>

        <div class="space-y-8">
          <div class="flex flex-col items-center gap-8">
            <div class="flex gap-4" onpaste={handlePaste}>
              {#each otpValues as _, i}
                <input
                  bind:this={otpInputs[i]}
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="w-16 h-20 text-center text-2xl font-semibold rounded-xl border border-input bg-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition"
                  value={otpValues[i]}
                  oninput={(e) => handleInput(i, e)}
                  onkeydown={(e) => handleKeyDown(i, e)}
                />
              {/each}
            </div>

            <div class="flex gap-4 w-fit">
              {#if canResend}
                <button
                  type="button"
                  class="text-sm text-primary font-medium hover:cursor-pointer"
                  onclick={handleResend}
                >
                  Resend code
                </button>
              {:else}
                <p class="text-lg font-bold text-start text-muted-foreground">
                  Resend code in <span class="text-info font-medium"
                    >{formatTime(resendTimer)}</span
                  >
                </p>
              {/if}
            </div>
          </div>

          <Button
            size="lg"
            class="w-full bg-info text-info-foreground rounded-full py-6 text-lg hover:cursor-pointer font-medium"
            onclick={() => {
              if (role === "investor") {
                goto("/investor/landing");
              } else {
                goto("/merchant");
              }
            }}
            disabled={!isComplete}
          >
            Verify
          </Button>
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
