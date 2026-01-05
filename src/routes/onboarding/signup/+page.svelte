<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { FormField } from "$lib/components/ui/form-field/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";

  const role = $derived($page.url.searchParams.get("role") || "investor");

  let name = $state("");
  let email = $state("");
  let phone = $state("+2519********");
  let password = $state("");
  let confirmPassword = $state("");
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
        <div class="flex flex-col justify-center h-full">
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
          <h2 class="text-3xl font-bold text-foreground">Create an Account</h2>
          <p class="text-muted-foreground">
            Please enter your details to continue.
          </p>
        </div>

        <form
          class="space-y-6"
          on:submit|preventDefault={() => goto("/onboarding/otp")}
        >
          <FormField
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name"
            bind:value={name}
            required
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="Enter your email address"
            bind:value={email}
            required
          />

          <FormField
            id="phone"
            label="Phone Number"
            type="tel"
            placeholder="+2519********"
            bind:value={phone}
            required
          />

          <FormField
            id="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            bind:value={password}
            showPasswordToggle
            required
          />

          <FormField
            id="confirm-password"
            label="Confirm Password"
            type="password"
            placeholder="Enter your password again"
            bind:value={confirmPassword}
            showPasswordToggle
            required
          />

          <Button
            type="submit"
            size="lg"
            class="w-full bg-info text-info-foreground hover:cursor-pointer rounded-full py-6 text-lg font-medium"
          >
            Create Account
          </Button>
        </form>

        <div class="text-center text-sm text-muted-foreground">
          Already have an account?
          <a
            href="/onboarding/signin"
            class="text-info font-bold hover:cursor-pointer ml-1"
          >
            Log In
          </a>
        </div>
      </div>
    </div>
  </div>
</div>
