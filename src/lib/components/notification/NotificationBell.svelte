<script lang="ts">
  import { browser } from "$app/environment";
  import { get } from "svelte/store";
  import { toast } from "svelte-sonner";
  import { _ } from "svelte-i18n";
  import { getAuthClient } from "$lib/graphql/client.js";
  import { authStore } from "$lib/stores/auth.svelte.js";
  import Icon from "$lib/components/ui/Icon/index.js";
  import GET_NOTIFICATIONS from "$graphql/queries/notifications/list.gql";
  import UNSEEN_COUNT from "$graphql/queries/notifications/unseen_count.gql";
  import SEEN_NOTIFICATION from "$graphql/mutation/notification/seen_notification.gql";
  import SEEN_ALL from "$graphql/mutation/notification/seen_all.gql";
  import UNSEEN_NOTIFICATION from "$graphql/mutation/notification/unseen_notification.gql";

  type Tab = "all" | "unseen" | "seen";

  type NotificationItem = {
    id: string;
    type: string;
    message: string;
    payload: unknown;
    is_seen: boolean;
    is_grouped: boolean;
    group_id?: string;
    created_at: string;
    updated_at: string;
  };

  type NotificationQueryResult = {
    notifications: NotificationItem[];
    total: { aggregate: { count: number } };
  };

  type CountQueryResult = {
    count: { aggregate: { count: number } };
  };

  const PAGE_SIZE = 20;
  const POLL_INTERVAL = 30_000;

  const isAuthenticated = $derived(authStore.isAuthenticated);
  const client = getAuthClient("user");

  let open = $state(false);
  let tab = $state<Tab>("all");
  let notifications = $state<NotificationItem[]>([]);
  let total = $state(0);
  let loading = $state(false);
  let loadingMore = $state(false);
  let error = $state<string | null>(null);
  let unseenCount = $state(0);
  let rootRef = $state<HTMLDivElement | undefined>(undefined);

  let requestSeq = 0;
  let pollTimer: ReturnType<typeof setInterval> | null = null;

  const tabs = $derived([
    { id: "all" as Tab, label: get(_)("notificationsAll") },
    { id: "unseen" as Tab, label: get(_)("notificationsUnseen") },
    { id: "seen" as Tab, label: get(_)("notificationsSeen") },
  ]);

  const filter = $derived.by(() => {
    if (tab === "unseen") return { is_seen: { _eq: false } };
    if (tab === "seen") return { is_seen: { _eq: true } };
    return {};
  });

  const hasMore = $derived(notifications.length < total);

  async function fetchUnseenCount() {
    try {
      const result = await client.query<CountQueryResult>({
        query: UNSEEN_COUNT,
        fetchPolicy: "network-only",
      });
      unseenCount = result.data?.count?.aggregate?.count ?? 0;
    } catch (err) {
      console.error("[Notifications] failed to fetch unseen count", err);
    }
  }

  async function fetchPage(offset: number, append: boolean) {
    const seq = ++requestSeq;
    if (append) {
      loadingMore = true;
    } else {
      loading = true;
      error = null;
    }

    try {
      const result = await client.query<NotificationQueryResult>({
        query: GET_NOTIFICATIONS,
        variables: { limit: PAGE_SIZE, offset, filter: filter },
        fetchPolicy: "network-only",
      });
      if (seq !== requestSeq) return;
      const list = result.data?.notifications ?? [];
      total = result.data?.total?.aggregate?.count ?? 0;
      notifications = append ? [...notifications, ...list] : list;
    } catch (err) {
      if (seq !== requestSeq) return;
      error = (err as Error).message;
    } finally {
      if (seq === requestSeq) {
        loading = false;
        loadingMore = false;
      }
    }
  }

  function switchTab(next: Tab) {
    if (next === tab) return;
    tab = next;
    notifications = [];
    total = 0;
    error = null;
    fetchPage(0, false);
  }

  function toggleOpen() {
    open = !open;
    if (open) {
      fetchPage(0, false);
      fetchUnseenCount();
    }
  }

  async function markSeen(item: NotificationItem) {
    try {
      await client.mutate({ mutation: SEEN_NOTIFICATION, variables: { ids: [item.id] } });
      unseenCount = Math.max(0, unseenCount - 1);
      if (tab === "unseen") {
        notifications = notifications.filter((n) => n.id !== item.id);
        total = Math.max(0, total - 1);
      } else {
        notifications = notifications.map((n) =>
          n.id === item.id ? { ...n, is_seen: true } : n
        );
      }
      refetchCurrent();
    } catch (err) {
      console.error("[Notifications] failed to mark as seen", err);
      toast.error("Failed to update notification");
    }
  }

  async function markUnseen(item: NotificationItem) {
    try {
      await client.mutate({ mutation: UNSEEN_NOTIFICATION, variables: { ids: [item.id] } });
      unseenCount += 1;
      if (tab === "seen") {
        notifications = notifications.filter((n) => n.id !== item.id);
        total = Math.max(0, total - 1);
      } else {
        notifications = notifications.map((n) =>
          n.id === item.id ? { ...n, is_seen: false } : n
        );
      }
      refetchCurrent();
    } catch (err) {
      console.error("[Notifications] failed to mark as unseen", err);
      toast.error("Failed to update notification");
    }
  }

  async function markAllSeen() {
    if (unseenCount === 0) return;
    try {
      await client.mutate({ mutation: SEEN_ALL });
      notifications = notifications.map((n) => ({ ...n, is_seen: true }));
      unseenCount = 0;
      refetchCurrent();
    } catch (err) {
      console.error("[Notifications] failed to mark all as seen", err);
      toast.error("Failed to mark all notifications as seen");
    }
  }

  function refetchCurrent() {
    fetchPage(0, false);
    fetchUnseenCount();
  }

  function relativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const diffMin = Math.round((date.getTime() - Date.now()) / 60000);
    const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
    if (Math.abs(diffMin) < 60) return formatter.format(diffMin, "minute");
    const diffHr = Math.round(diffMin / 60);
    if (Math.abs(diffHr) < 24) return formatter.format(diffHr, "hour");
    const diffDay = Math.round(diffHr / 24);
    if (Math.abs(diffDay) < 7) return formatter.format(diffDay, "day");
    return date.toLocaleDateString();
  }

  function handleCardClick(item: NotificationItem) {
    if (tab === "unseen") markSeen(item);
    else if (tab === "seen") markUnseen(item);
  }

  $effect(() => {
    if (!isAuthenticated || !browser) return;
    fetchUnseenCount();
    pollTimer = setInterval(fetchUnseenCount, POLL_INTERVAL);
    return () => {
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
    };
  });

  $effect(() => {
    if (!open || !browser) return;
    const handler = (event: MouseEvent) => {
      if (rootRef && !rootRef.contains(event.target as Node)) {
        open = false;
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  });
</script>

{#if isAuthenticated}
  <div class="relative" bind:this={rootRef}>
    <button
      type="button"
      onclick={toggleOpen}
      aria-label={get(_)("notificationsLabel")}
      class="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
    >
      <Icon iconName="icon/bell" size={20} class="text-muted-foreground" />
      {#if unseenCount > 0}
        <span
          class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-background"
        >
          {unseenCount > 99 ? "99+" : unseenCount}
        </span>
      {/if}
    </button>

    {#if open}
      <div
        class="absolute right-0 top-full mt-2 w-[26rem] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-border">
          <p class="text-sm font-semibold text-foreground">{get(_)("notificationsTitle")}</p>
          <button
            type="button"
            onclick={markAllSeen}
            disabled={unseenCount === 0}
            class="text-xs font-medium text-info hover:underline disabled:opacity-40 disabled:pointer-events-none"
          >
            {get(_)("notificationsSeenAll")}
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex items-center gap-1 px-3 pt-3">
          {#each tabs as t}
            <button
              type="button"
              onclick={() => switchTab(t.id)}
              class={[
                "flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                tab === t.id
                  ? "bg-info/10 text-info"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              ].join(" ")}
            >
              {t.label}
            </button>
          {/each}
        </div>

        <!-- List -->
        <div class="max-h-[24rem] overflow-y-auto p-2">
          {#if loading}
            <div class="px-3 py-2 flex flex-col gap-3">
              {#each [0, 1, 2, 3, 4] as i}
                <div class="flex items-start gap-3">
                  <div class="flex-1">
                    <div class="shimmer h-3.5 w-3/4 rounded-md"></div>
                    <div class="shimmer h-3 w-1/3 rounded-md mt-2"></div>
                  </div>
                  <div class="shimmer w-7 h-7 rounded-full flex-none"></div>
                </div>
              {/each}
            </div>
          {:else if error}
            <div class="py-10 text-center">
              <p class="text-sm text-destructive">{error}</p>
            </div>
          {:else if notifications.length === 0}
            <div class="py-8 flex flex-col items-center gap-2 text-center">
              <Icon iconName="icon/bell" size={32} class="text-muted-foreground/40" />
              <p class="text-sm text-muted-foreground">
                {tab === "unseen"
                  ? get(_)("notificationsEmptyUnseen")
                  : tab === "seen"
                    ? get(_)("notificationsEmptySeen")
                    : get(_)("noNotificationsMsg")}
              </p>
            </div>
          {:else}
            <div class="flex flex-col gap-1">
              {#each notifications as item}
                <button
                  type="button"
                  onclick={() => handleCardClick(item)}
                  class={[
                    "w-full text-left px-3 py-2.5 rounded-lg flex items-start gap-3 transition-colors",
                    tab === "all" ? "cursor-default" : "hover:bg-muted cursor-pointer",
                  ].join(" ")}
                >
                  <div class="flex-1 min-w-0">
                    <p class="text-sm text-foreground leading-snug break-words">{item.message}</p>
                    <p class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Icon iconName="icon/clock" size={12} />
                      {relativeTime(item.created_at)}
                    </p>
                  </div>

                  {#if tab === "unseen"}
                    <span
                      class="mt-1 flex-none w-7 h-7 rounded-full bg-info/10 text-info flex items-center justify-center"
                      title={get(_)("notificationsMarkSeen")}
                    >
                      <Icon iconName="icon/eye" size={14} />
                    </span>
                  {:else if tab === "seen"}
                    <span
                      class="mt-1 flex-none w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center"
                      title={get(_)("notificationsMarkUnseen")}
                    >
                      <Icon iconName="icon/eye-off" size={14} />
                    </span>
                  {:else}
                    {#if !item.is_seen}
                      <span class="mt-1.5 flex-none w-2 h-2 rounded-full bg-info"></span>
                    {/if}
                  {/if}
                </button>
              {/each}

              {#if hasMore}
                <button
                  type="button"
                  onclick={() => fetchPage(notifications.length, true)}
                  disabled={loadingMore}
                  class="mt-2 w-full py-2.5 text-sm font-medium text-info hover:bg-info/5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {loadingMore
                    ? get(_)("notificationsLoading")
                    : get(_)("notificationsLoadMore")}
                </button>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .shimmer {
    background: linear-gradient(
      90deg,
      var(--color-muted) 25%,
      var(--color-border) 50%,
      var(--color-muted) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.4s ease-in-out infinite;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
