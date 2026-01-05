<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import { cn } from "$lib/utils.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { goto } from "$app/navigation";
  import { onMount, onDestroy } from "svelte";

  let otpValues = $state(["", "", "", ""]);
  let otpInputs: (HTMLInputElement | null)[] = $state([]);
  let resendTimer = $state(29);
  let canResend = $state(false);
  let intervalId: ReturnType<typeof setInterval> | null = null;

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
      class="hidden lg:flex lg:w-1/2 relative bg-cover bg-center"
      style="background-image: url('/role.jpg');"
    >
      <!-- Rich blue gradient overlay -->
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
                  class="text-primary"
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
      <div class="w-full max-w-md space-y-10">
        <div class="space-y-2 text-center lg:text-left">
          <h2 class="text-3xl font-bold text-foreground">Verification Code</h2>
          <p class="text-muted-foreground">
            We have sent a verification code to your number +251 ****
          </p>
        </div>

        <div class="space-y-8">
          <div class="flex flex-col items-center gap-8">
            <div class="flex gap-4" on:paste={handlePaste}>
              {#each otpValues as _, i}
                <input
                  bind:this={otpInputs[i]}
                  type="text"
                  inputmode="numeric"
                  maxlength="1"
                  class="w-16 h-20 text-center text-2xl font-semibold rounded-xl border border-input bg-muted/50 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition"
                  value={otpValues[i]}
                  on:input={(e) => handleInput(i, e)}
                  on:keydown={(e) => handleKeyDown(i, e)}
                />
              {/each}
            </div>

            <div class="flex gap-4 w-fit">
              {#if canResend}
                <button
                  type="button"
                  class="text-sm text-primary font-medium hover:cursor-pointer"
                  on:click={handleResend}
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
            onclick={() => goto("/")}
            disabled={!isComplete}
          >
            Verify
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
