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
  class="relative flex-none"
  style="box-sizing: border-box; width: 311.52px; height: 225.21px; background: #FFFFFF; border: 1.22619px solid #E0E0E0; border-radius: 9.80952px; flex-grow: 0; align-self: stretch;"
>
  <div
    class="flex flex-col items-center flex-none"
    style="position: absolute; padding: 0px; gap: 11px; width: 267px; height: 110.24px; left: 22.26px; top: 18px; flex-grow: 0;"
  >
    <div
      class="flex flex-row justify-center items-center flex-none relative"
      style="width: 55.24px; height: 55.24px; background: rgba(77, 160, 230, 0.08); border-radius: 104029px; flex-grow: 0;"
    >
      <div
        class="flex-none"
        style="position: absolute; width: 27px; height: 27px; left: 16.96px; top: 14.19px;"
      >
        <Icon iconName="icon/user-plus" size={27} style="color: {PRIMARY_BLUE};" />
      </div>
    </div>

    <div
      class="flex flex-col items-center flex-none"
      style="padding: 0px; gap: 4px; width: 267px; height: 44px; flex-grow: 0; align-self: stretch;"
    >
      <div
        class="flex-none"
        style="width: 188px; height: 24px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 700; font-size: 19px; line-height: 24px; color: #212B36; flex-grow: 0;"
      >
        Invite New Merchant
      </div>

      <div
        class="flex-none"
        style="width: 267px; height: 16px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 400; font-size: 12px; line-height: 16px; color: #7E7E7E; flex: none; order: 1; flex-grow: 0;"
      >
        Know a merchant who isn't on Baman Stock yet?
      </div>
    </div>
  </div>

  <button
    type="button"
    class="flex flex-row justify-center items-center flex-none"
    style="box-sizing: border-box; position: absolute; padding: 8.58333px 14.7143px; gap: 9.81px; width: 287.52px; height: 40.17px; left: 12px; top: 162px; background: rgba(77, 160, 230, 0.2); border: 1.22619px solid {PRIMARY_BLUE}; border-radius: 6.13095px; flex-grow: 0;"
    onclick={onInvite}
  >
    <span
      class="flex-none text-center"
      style="width: 43px; height: 23px; font-family: 'Raleway', sans-serif; font-style: normal; font-weight: 700; font-size: 15.9405px; line-height: 22px; color: {PRIMARY_BLUE}; text-align: center; flex-grow: 0;"
    >
      Invite
    </span>
  </button>
</div>
