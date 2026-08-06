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
  class="flex flex-col justify-between items-start w-full h-full bg-card border border-border"
  style="box-sizing: border-box; padding: 18px 12.2619px 23px; gap: 13.49px; border-radius: 9.80952px;"
>
  <div
    class="flex flex-row items-start w-full min-w-0"
    style="padding: 0px; gap: 11.04px;"
  >
    <div
      class="flex-none shrink-0"
      style="display: flex; flex-direction: row; justify-content: center; align-items: center; width: 55px; height: 55px; border-radius: 50%; background: {avatarColor};"
    >
      {#if avatar}
        <img
          src={avatar}
          alt={name}
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;"
        />
      {:else}
        <span style="font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 16px; color: #FFFFFF;">
          {initials}
        </span>
      {/if}
    </div>

    <div
      class="flex flex-row justify-between items-start flex-1 min-w-0"
      style="padding: 0px; gap: 4.9px;"
    >
      <div
        class="flex flex-col justify-center items-start flex-1 min-w-0"
        style="padding: 0px;"
      >
        <div
          class="w-full min-w-0 text-foreground"
          style="height: 30px; font-family: 'Raleway'; font-style: normal; font-weight: 700; font-size: 23.2976px; line-height: 29px; display: flex; align-items: flex-end; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
        >
          {name}
        </div>

        <div
          class="flex flex-row items-center w-full min-w-0"
          style="padding: 0px; gap: 4.9px; height: 20px;"
        >
          <div class="flex-none shrink-0" style="width: 14.71px; height: 14.71px;">
            <Icon iconName="icon/trending-up" size={14.71} style="color: {PRIMARY_BLUE};" />
          </div>
          <div
            class="flex-1 min-w-0"
            style="height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; color: {PRIMARY_BLUE}; display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
          >
            {productsSold}+ {$_('productSold')}
          </div>
        </div>
      </div>

      <!-- Status badge -->
      <div
        class="flex flex-col justify-center items-center flex-none shrink-0 {statusConfig[status].bgClass} {statusConfig[status].textClass}"
        style="padding: 0px; width: 67.44px; height: 20px; border-radius: 104029px;"
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

  <div class="w-full border-t border-border"></div>

  <div
    class="flex flex-col items-start w-full"
    style="padding: 0px; gap: 22.07px;"
  >
    <div
      class="flex flex-row items-center w-full min-w-0"
      style="padding: 0px; gap: 4.9px; height: 20px;"
    >
      <div class="flex-none shrink-0 flex items-center justify-center" style="width: 14.71px; height: 20px;">
        <Icon iconName="icon/map-pin" size={14.71} class="text-foreground" />
      </div>
      <div
        class="flex-1 min-w-0 flex items-center text-foreground"
        style="height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;"
      >
        {location}
      </div>
    </div>

    <button
      type="button"
      class="flex flex-row justify-center items-center w-full flex-none"
      style="box-sizing: border-box; padding: 8.58333px 14.7143px; gap: 9.81px; height: 40.17px; background: {PRIMARY_BLUE}; border: 1.22619px solid {PRIMARY_BLUE}; border-radius: 6.13095px;"
      onclick={onHire}
    >
      <span
        class="flex-none text-center"
        style="height: 23px; font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 15.9405px; line-height: 22px; color: #FFFFFF; text-align: center;"
      >
        {$_('hire')}
      </span>
    </button>
  </div>
</div>
