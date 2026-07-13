<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { FormField } from "$lib/components/ui/form-field/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";
  import { toast } from "svelte-sonner";
  import { getAnonymousClient } from "$graphql/client.ts";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import LOGIN from "$graphql/queries/auth/login.gql";
  import type { ApolloError } from "@apollo/client";
  import { jwtDecode } from "jwt-decode";
  import type { JwtPayload } from "$lib/stores/auth.svelte.js";

  let credential = $state("");
  let password = $state("");
  let credentialError = $state("");
  let submitError = $state("");
  let loading = $state(false);
  let currentSlide = $state(0);

  function validateCredential(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (!value.trim()) {
      credentialError = "Please enter an email or phone number";
      return false;
    }
    if (emailRegex.test(value) || phoneRegex.test(value)) {
      credentialError = "";
      return true;
    }
    credentialError = "Invalid email or phone number format";
    return false;
  }

  function isEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!validateCredential(credential)) return;
    submitError = "";
    loading = true;
    try {
      const variables: { email?: string; phone?: string; password: string } = {
        password,
      };
      if (isEmail(credential)) {
        variables.email = credential;
      } else {
        variables.phone = credential;
      }
      const result = await getAnonymousClient().mutate<{
        user_login: { token: string; status_code: number; message?: string };
      }>({
        mutation: LOGIN,
        variables,
      });
      const data = result.data?.user_login;
      if (data?.token && data?.status_code === 200) {
        const payload = jwtDecode<JwtPayload>(data.token);
        const allowedRoles = payload.metadata['x-hasura-allowed-roles'] ?? [];
        if (!allowedRoles.includes('investor')) {
          toast.error("You do not have investor permissions");
          return;
        }
        toast.success("Login successful");
        authStore.loginWithToken(data.token);
        goto("/dashboard");
      } else if (data?.message) {
        toast.error(data.message);
      } else {
        toast.error("Something went wrong");
      }
    } catch (err: unknown) {
      const apolloErr = err as ApolloError;
      if (apolloErr.graphQLErrors?.length) {
        toast.error(apolloErr.graphQLErrors[0]?.message ?? "Something went wrong");
      } else if (apolloErr.networkError) {
        const netErr = apolloErr.networkError as { statusCode?: number; message?: string };
        if (netErr.statusCode === 401 || netErr.statusCode === 403) {
          toast.error("Invalid credentials");
        } else if (netErr.message) {
          toast.error(netErr.message);
        } else {
          toast.error("Something went wrong");
        }
      } else {
        toast.error("Something went wrong");
      }
    } finally {
      loading = false;
    }
  }
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
      class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center overflow-hidden"
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
          <h2 class="text-3xl font-bold text-foreground">
            Log in to your account
          </h2>
          <p class="text-muted-foreground">
            Please enter your details to continue.
          </p>
        </div>

        <form class="space-y-6" onsubmit={handleSubmit}>
          <FormField
            id="credential"
            label="Email or Phone Number"
            type="text"
            placeholder="Email or phone number"
            bind:value={credential}
            oninput={() => { if (credentialError) validateCredential(credential); }}
            required
          />
          {#if credentialError}
            <p class="text-sm text-destructive -mt-4">{credentialError}</p>
          {/if}

          <div class="space-y-2">
            <FormField
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              bind:value={password}
              showPasswordToggle
              required
            />
            <div class="flex justify-end">
              <button
                type="button"
                class="text-sm text-info font-medium hover:cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={loading}
            class="w-full hover:cursor-pointer bg-info text-info-foreground rounded-full py-6 text-lg font-medium"
          >
            {#if loading}
              <Icon iconName="icon/refresh-cw" size={18} class="animate-spin" />
              Logging in...
            {:else}
              Login
            {/if}
          </Button>
        </form>

        <div class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <a href="/onboarding/role" class="text-info font-medium ml-1">
            Register Now
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
