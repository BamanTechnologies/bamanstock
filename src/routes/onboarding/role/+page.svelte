<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";

  type Role = "investor" | "merchant";

  let selectedRole: Role = $state("investor");

  function handleContinue() {
    if (selectedRole === "investor") {
      goto("/onboarding/signup?role=investor");
    } else {
      goto("/onboarding/signup?role=merchant");
    }
  }
</script>

<div class="min-h-screen bg-white flex items-center justify-center p-4">
  <div
    class="w-full max-w-6xl flex flex-col lg:flex-row shadow-2xl rounded-2xl overflow-hidden"
  >
    <div
      class="hidden lg:block lg:w-1/2 relative bg-cover bg-center"
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
        <div class="flex-1 flex flex-col justify-center">
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
              <span class="text-2xl font-bold tracking-wide">BAMANSTOCK</span>
            </div>

            <div class="space-y-4">
              <h1 class="text-[29px] font-bold leading-[38px]">
                Manage Your Business With Confidence
              </h1>
              <p class="text-xs leading-4 text-white/90">
                Register to access your personalized dashboard and manage deals
                effortlessly.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 pb-8">
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
          <h2 class="text-3xl font-bold text-foreground">Select your role</h2>
          <p class="text-muted-foreground">
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
            on:click={() => (selectedRole = "investor")}
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
            on:click={() => (selectedRole = "merchant")}
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
          class="w-full hover:cursor-pointer bg-info text-info-foreground rounded-full py-6 text-lg font-medium"
          onclick={handleContinue}
        >
          Continue as {selectedRole === "investor" ? "Investor" : "Merchant"}
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
