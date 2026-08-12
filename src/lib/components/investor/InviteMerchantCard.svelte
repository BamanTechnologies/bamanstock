<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  interface InviteMerchantCardProps {
    onInvite?: () => void;
  }

  let { onInvite }: InviteMerchantCardProps = $props();

  // Color constants from Figma
  const PRIMARY_BLUE = "var(--primary-blue)";
</script>

<div
  class="flex flex-col items-center w-full h-full bg-card border border-border"
  style="box-sizing: border-box; padding: 18px 22.26px 23px; gap: 11px; border-radius: 9.80952px;"
>
  <div
    class="flex flex-row justify-center items-center flex-none shrink-0"
    style="width: 55.24px; height: 55.24px; background: rgba(77, 160, 230, 0.08); border-radius: 104029px;"
  >
    <Icon iconName="icon/user-plus" size={27} style="color: {PRIMARY_BLUE};" />
  </div>

  <div
    class="flex flex-col items-center w-full"
    style="padding: 0px; gap: 4px;"
  >
    <div
      class="w-full text-center text-foreground"
      style="font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 700; font-size: 19px; line-height: 24px;"
    >
      Invite New Merchant
    </div>

    <div
      class="w-full text-center text-muted-foreground"
      style="font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 400; font-size: 12px; line-height: 16px;"
    >
      Know a merchant who isn't on Baman Stock yet?
    </div>
  </div>

  <button
    type="button"
    class="flex flex-row justify-center items-center w-full mt-auto"
    style="box-sizing: border-box; padding: 8.58333px 14.7143px; gap: 9.81px; height: 40.17px; background: rgba(77, 160, 230, 0.2); border: 1.22619px solid {PRIMARY_BLUE}; border-radius: 6.13095px;"
    onclick={onInvite}
  >
    <span
      class="flex-none text-center"
      style="height: 23px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 700; font-size: 15.9405px; line-height: 22px; color: {PRIMARY_BLUE}; text-align: center;"
    >
      Invite
    </span>
  </button>
</div>
