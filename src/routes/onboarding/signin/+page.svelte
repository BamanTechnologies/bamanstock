<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { FormField } from "$lib/components/ui/form-field/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";

  let phone = $state("+2519********");
  let password = $state("");
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div
    class="w-full max-w-6xl flex flex-col lg:flex-row shadow-2xl rounded-2xl overflow-hidden"
  >
    <div
      class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      style="background-image: url('/role.jpg');"
    >
      <div
        class="absolute inset-0"
        style="background: linear-gradient(157.39deg, rgba(0, 136, 251, 0.75) -10.27%, rgba(14, 65, 108, 0.97) 98.36%);"
      ></div>

      <div
        class="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"
      ></div>
      <div
        class="relative z-10 flex flex-col justify-between h-full p-12 text-white"
      >
        <div class="flex-1 flex items-center justify-center">
          <div class="space-y-12 max-w-md">
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-md"
              >
                <Icon
                  iconName="icon/trending-up"
                  size={32}
                  class="text-primary"
                />
              </div>
              <span class="text-2xl font-bold tracking-wide">BAMANSTOCK</span>
            </div>

            <div class="space-y-6">
              <h1 class="text-[29px] font-bold leading-[38px]">
                Manage Your Business With Confidence
              </h1>
              <p class="text-xs leading-4 text-white/90">
                Log in to access your personalized dashboard and manage deals
                effortlessly.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 mb-8">
          <div class="w-8 h-1.5 bg-white rounded-full"></div>
          <div class="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
          <div class="w-1.5 h-1.5 bg-white/50 rounded-full"></div>
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

        <form class="space-y-6" on:submit|preventDefault={() => goto("/")}>
          <FormField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+2519********"
            bind:value={phone}
            required
          />

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
            class="w-full hover:cursor-pointer bg-info text-info-foreground rounded-full py-6 text-lg font-medium"
          >
            Login
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
