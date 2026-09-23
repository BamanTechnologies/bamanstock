<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import { getAuthClient } from "$graphql/client.ts";
  import SEND_SMS from "$graphql/mutation/customers/send_sms.gql";
  import { _ } from "svelte-i18n";

  interface SmsModalProps {
    isOpen?: boolean;
    customerIds?: string[];
    onClose?: () => void;
    onSuccess?: () => void;
  }

  let {
    isOpen = $bindable(false),
    customerIds = [],
    onClose,
    onSuccess,
  }: SmsModalProps = $props();

  let message = $state("");
  let loading = $state(false);
  let error = $state<string | null>(null);
  let result: any = $state(null);

  function handleClose() {
    if (loading) return;
    isOpen = false;
    message = "";
    loading = false;
    error = null;
    result = null;
    onClose?.();
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget && !loading) handleClose();
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === "Escape" && !loading) handleClose();
  }

  function stopProp(e: Event) {
    e.stopPropagation();
  }

  async function handleSend() {
    if (!message.trim() || !customerIds.length) return;
    loading = true;
    error = null;
    result = null;
    try {
      const client = getAuthClient("investor");
      const res = await client.mutate({
        mutation: SEND_SMS,
        variables: { ids: customerIds, message: message.trim(), isWaightListReminder: false },
      });
      result = (res.data as any)?.send_customer_sms ?? null;
    } catch (err) {
      error = (err as Error).message;
    } finally {
      loading = false;
    }
  }

  function handleDone() {
    isOpen = false;
    message = "";
    loading = false;
    error = null;
    result = null;
    onSuccess?.();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
    role="dialog"
    aria-modal="true"
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
      onclick={stopProp}
      onkeydown={stopProp}
      role="document"
    >
      <div class="flex items-center justify-between p-6 border-b border-border">
        <h2 class="text-xl font-bold text-foreground">{$_('sendSmsMessage')}</h2>
        <button
          type="button"
          class="p-1 rounded hover:bg-muted transition-colors disabled:opacity-40"
          onclick={handleClose}
          disabled={loading}
          aria-label="Close"
        >
          <Icon iconName="icon/x" size={20} />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <p class="text-sm text-muted-foreground">
          Sending to {customerIds.length} customer{customerIds.length !== 1 ? 's' : ''}
        </p>

        {#if error}
          <div class="p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-start gap-2">
            <Icon iconName="icon/alert-circle" size={16} class="text-destructive mt-0.5 shrink-0" />
            <p class="text-sm text-destructive">{error}</p>
          </div>
        {/if}

        {#if result}
          <div class="space-y-3">
            <div class="p-4 rounded-md bg-muted/30 border border-border">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-muted-foreground">{$_('status')}: </span>
                  <span class="font-medium text-foreground">{result.status_code}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">{$_('messageLabel')}: </span>
                  <span class="font-medium text-foreground">{result.message}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">{$_('successCount')}: </span>
                  <span class="font-medium text-green-600 dark:text-green-400">{result.success_count}</span>
                </div>
                <div>
                  <span class="text-muted-foreground">{$_('failureCount')}: </span>
                  <span class="font-medium text-red-600 dark:text-red-400">{result.failure_count}</span>
                </div>
              </div>
              {#if result.error}
                <div class="mt-3 pt-3 border-t border-border">
                  <span class="text-sm text-muted-foreground">{$_('errors')}: </span>
                  <p class="text-sm text-destructive mt-1">{result.error}</p>
                </div>
              {/if}
            </div>
          </div>
        {:else}
          <div>
            <label for="sms-message" class="text-sm font-medium text-foreground mb-1 block">{$_('messageLabel')}</label>
            <textarea
              id="sms-message"
              rows="4"
              class="w-full px-3 py-2 bg-muted/20 border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:border-border resize-none"
              placeholder={$_('messageLabel') + '...'}
              bind:value={message}
              disabled={loading}
            ></textarea>
          </div>
        {/if}
      </div>

      <div class="flex items-center justify-end gap-3 p-6 border-t border-border">
        {#if result}
          <Button
            class="bg-[var(--primary-blue)] text-white hover:opacity-90"
            onclick={handleDone}
          >
            {$_('done')}
          </Button>
        {:else}
          <Button
            variant="outline"
            onclick={handleClose}
            disabled={loading}
            class="border-border text-foreground"
          >
            {$_('cancel')}
          </Button>
          <Button
            class="bg-[var(--primary-blue)] text-white hover:opacity-90"
            onclick={handleSend}
            disabled={loading || !message.trim()}
          >
            {#if loading}
              <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {$_('sending')}
            {:else}
              {$_('send')}
            {/if}
          </Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
