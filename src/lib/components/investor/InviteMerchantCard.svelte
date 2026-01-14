<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import Icon from "$lib/components/ui/Icon/index.js";

  interface InviteMerchantCardProps {
    onInvite?: () => void;
  }

  let { onInvite }: InviteMerchantCardProps = $props();
</script>

<div
  class="bg-white border-2 border-dashed border-muted rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center justify-center text-center min-h-[280px]"
>
  <div class="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center mb-4">
    <Icon iconName="icon/user-plus" size={32} class="text-info" />
  </div>

  <h3 class="text-lg font-semibold text-foreground mb-2">
    Invite New Merchant
  </h3>

  <p class="text-sm text-muted-foreground mb-6">
    Know a merchant who isn't on Baman Stock yet?
  </p>

  <Button
    variant="outline"
    class="bg-info/5 border-info text-info hover:bg-info/10"
    onclick={onInvite}
  >
    Invite
  </Button>
</div>
