<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";
  import { _ } from "svelte-i18n";

  const AVATAR_COLORS = [
    "#4DA0E6", "#D15B7A", "#34A853", "#FBBC05",
    "#FF6B6B", "#6B5B95", "#88B04B", "#F7CAC9",
    "#92A8D1", "#955251", "#B565A7", "#009B77",
  ];

  interface MerchantCardProps {
    name: string;
    avatar?: string;
    status: "active" | "declined" | "invited";
    productsSold: number;
    location: string;
    onHire?: () => void;
  }

  let {
    name,
    avatar,
    status,
    productsSold,
    location,
    onHire,
  }: MerchantCardProps = $props();

  const PRIMARY_BLUE = "var(--primary-blue)";

  const initials = $derived(
    (() => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
      }
      return name.charAt(0).toUpperCase();
    })()
  );

  const avatarColor = $derived(AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]);

  const statusConfig = $derived({
    active: {
      label: $_('statusActive'),
      bgClass: "bg-green-100 dark:bg-green-900/40",
      textClass: "text-green-700 dark:text-green-300",
    },
    declined: {
      label: $_('statusDeclined'),
      bgClass: "bg-red-100 dark:bg-red-900/40",
      textClass: "text-red-700 dark:text-red-300",
    },
    invited: {
      label: $_('statusInvited'),
      bgClass: "bg-blue-100 dark:bg-blue-900/40",
      textClass: "text-blue-700 dark:text-blue-300",
    },
  });
</script>

<div
  class="flex flex-col justify-between items-start flex-none bg-card border border-border"
  style="box-sizing: border-box; padding: 18px 12.2619px 23px; gap: 13.49px; width: 311.52px; height: 225.21px; border-radius: 9.80952px; flex-grow: 0;"
>
  <div
    class="flex flex-row items-start flex-none"
    style="padding: 0px; gap: 11.04px; margin: 0 auto; width: 287px; height: 50px; flex-grow: 0;"
  >
    <div
      class="flex-none"
      style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 55px; height: 55px; border-radius: 50%; background: {avatarColor}; flex: none; order: 0; flex-grow: 0;"
    >
      {#if avatar}
        <img
          src={avatar}
          alt={name}
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;"
        />
      {:else}
        <span style="font-family: 'Nunito Sans', sans-serif; font-weight: 700; font-size: 16px; color: #FFFFFF;">
          {initials}
        </span>
      {/if}
    </div>

    <div
      class="flex flex-row justify-between items-start flex-none"
      style="padding: 0px; gap: 4.9px; width: 226.92px; height: 50px; flex-grow: 1;"
    >
      <div
        class="flex flex-col justify-center items-start flex-none"
        style="padding: 0px; margin: 0 auto; width: 139px; height: 50px; flex-grow: 0;"
      >
        <div
          class="flex-none text-foreground"
          style="width: 139px; height: 30px; font-family: 'Nunito Sans'; font-style: normal; font-weight: 700; font-size: 23.2976px; line-height: 29px; display: flex; align-items: flex-end; flex: none; order: 0; flex-grow: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        >
          {name}
        </div>

        <div
          class="flex flex-row items-center flex-none"
          style="padding: 0px; gap: 4.9px; width: 144.62px; height: 20px; flex-grow: 0;"
        >
          <div class="flex-none" style="width: 14.71px; height: 14.71px;">
            <Icon iconName="icon/trending-up" size={14.71} style="color: {PRIMARY_BLUE};" />
          </div>
          <div
            class="flex-none"
            style="width: 125px; height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; color: {PRIMARY_BLUE}; display: flex; align-items: center; flex-grow: 0;"
          >
            {productsSold}+ {$_('productSold')}
          </div>
        </div>
      </div>

      <!-- Status badge -->
      <div
        class="flex flex-col justify-center items-center flex-none {statusConfig[status].bgClass} {statusConfig[status].textClass}"
        style="padding: 0px; margin: 0 auto; width: 67.44px; height: 20px; border-radius: 104029px; flex-grow: 0;"
      >
        <div
          class="flex-none"
          style="width: 36px; height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; display: flex; align-items: center; flex-grow: 0;"
        >
          {statusConfig[status].label}
        </div>
      </div>
    </div>
  </div>

  <div class="flex-none border-t border-border" style="margin: 0 auto; width: 287px;"></div>

  <div
    class="flex flex-col items-start flex-none"
    style="padding: 0px; gap: 22.07px; margin: 0 auto; width: 287px; height: 82.24px; flex-grow: 0;"
  >
    <div
      class="flex flex-row items-center flex-none"
      style="padding: 0px; gap: 4.9px; width: 287px; height: 20px; flex-grow: 0;"
    >
      <div class="flex-none flex items-center justify-center" style="width: 14.71px; height: 20px;">
        <Icon iconName="icon/map-pin" size={14.71} class="text-foreground" />
      </div>
      <div
        class="flex-none flex items-center text-foreground"
        style="max-width: 260px; height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; flex-grow: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
      >
        {location}
      </div>
    </div>

    <button
      type="button"
      class="flex flex-row justify-center items-center flex-none"
      style="box-sizing: border-box; padding: 8.58333px 14.7143px; gap: 9.81px; width: 287px; height: 40.17px; background: {PRIMARY_BLUE}; border: 1.22619px solid {PRIMARY_BLUE}; border-radius: 6.13095px; flex-grow: 0; align-self: stretch;"
      onclick={onHire}
    >
      <span
        class="flex-none text-center"
        style="height: 23px; font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 15.9405px; line-height: 22px; color: #FFFFFF; text-align: center; flex-grow: 0;"
      >
        {$_('hire')}
      </span>
    </button>
  </div>
</div>
