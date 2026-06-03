<script lang="ts">
  import Icon from "$lib/components/ui/Icon/index.js";

  interface MerchantCardProps {
    name: string;
    avatar?: string;
    status: "active" | "declined" | "invited";
    productsSold: number;
    category: string;
    onHire?: () => void;
  }

  let {
    name,
    avatar,
    status,
    productsSold,
    category,
    onHire,
  }: MerchantCardProps = $props();

  const PRIMARY_BLUE = "var(--primary-blue)";

  const statusConfig = {
    active: {
      label: "Active",
      bgClass: "bg-green-100 dark:bg-green-900/40",
      textClass: "text-green-700 dark:text-green-300",
    },
    declined: {
      label: "Declined",
      bgClass: "bg-red-100 dark:bg-red-900/40",
      textClass: "text-red-700 dark:text-red-300",
    },
    invited: {
      label: "Invited",
      bgClass: "bg-blue-100 dark:bg-blue-900/40",
      textClass: "text-blue-700 dark:text-blue-300",
    },
  } as const;
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
      style="display: flex; flex-direction: row; justify-content: center; align-items: center; padding: 8px; gap: 10.22px; width: 55px; height: 55px; border-radius: 1.13536e+06px; flex: none; order: 0; flex-grow: 0;"
    >
      {#if avatar}
        <img
          src={avatar}
          alt={name}
          style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%; display: block;"
        />
      {:else}
        <span class="text-foreground" style="font-family: 'Nunito Sans', sans-serif; font-weight: 700; font-size: 20px;">
          {name.charAt(0).toUpperCase()}
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
            {productsSold}+ Product Sold
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
      style="padding: 0px; gap: 4.9px; width: 144.62px; height: 20px; flex-grow: 0;"
    >
      <div class="flex-none flex items-center justify-center" style="width: 14.71px; height: 20px;">
        <Icon iconName="icon/shopping-bag" size={14.71} class="text-foreground" />
      </div>
      <div
        class="flex-none flex items-center text-foreground"
        style="width: 125px; height: 20px; font-family: 'Raleway', sans-serif; font-weight: 400; font-size: 12.2619px; line-height: 20px; flex-grow: 0;"
      >
        {category}
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
        style="width: 32px; height: 23px; font-family: 'Raleway', sans-serif; font-weight: 700; font-size: 15.9405px; line-height: 22px; color: #FFFFFF; text-align: center; flex-grow: 0;"
      >
        Hire
      </span>
    </button>
  </div>
</div>
