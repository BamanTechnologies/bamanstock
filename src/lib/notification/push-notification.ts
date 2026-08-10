import { browser } from '$app/environment';
import { PUBLIC_NOTIFICATION_TIME_GAP } from '$env/static/public';
import { getAuthClient } from '$lib/graphql/client.js';
import { authStore } from '$lib/stores/auth.svelte.js';
import { getFirebaseApp, firebaseVapidKey } from '$lib/firebase/client.js';
import { toast } from 'svelte-sonner';
import UPSERT_DEVICE_TOKEN from '$graphql/mutation/notification/insert_dispatch_device_tokens.gql';
import type { MessagePayload, Messaging } from 'firebase/messaging';

const DEVICE_TOKEN_KEY = 'baman_notification_device_token';
const LAST_UPSERT_KEY = 'baman_notification_last_upsert';

const timeGap = Number(PUBLIC_NOTIFICATION_TIME_GAP || 120000);

let initialized = false;
let messagingInstance: Messaging | null = null;
let foregroundListenerAttached = false;
let sound: HTMLAudioElement | null = null;

function playNotificationSound() {
  if (!sound) {
    sound = new Audio('/notification-sound.wav');
  }
  sound.currentTime = 0;
  sound.play().catch(() => {});
}

function formatTitle(title: string): string {
  return title
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function showNotificationToast(payload: MessagePayload) {
  const { title, body } = payload.notification ?? {};
  playNotificationSound();
  toast.success(formatTitle(title ?? 'Bamanstock'), {
    description: body ?? '',
  });
}

async function getMessagingInstance(): Promise<Messaging | null> {
  if (!messagingInstance) {
    const { getMessaging } = await import('firebase/messaging');
    messagingInstance = getMessaging(getFirebaseApp());
  }
  return messagingInstance;
}

async function attachForegroundListener(): Promise<void> {
  if (foregroundListenerAttached) return;
  foregroundListenerAttached = true;

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  const { onMessage } = await import('firebase/messaging');
  onMessage(messaging, (payload) => {
    console.log('[PushNotification] foreground message received:', payload);
    showNotificationToast(payload);
  });

  navigator.serviceWorker.addEventListener('message', (event) => {
    const message = event.data as { type?: string; payload?: MessagePayload };
    if (message?.type !== 'FCM_MESSAGE' || !message.payload) return;
    console.log('[PushNotification] message forwarded from service worker:', message.payload);
    showNotificationToast(message.payload);
  });
}

async function upsertDeviceToken(deviceToken: string): Promise<void> {
  await getAuthClient('user').mutate({
    mutation: UPSERT_DEVICE_TOKEN,
    variables: { object: { device_token: deviceToken } },
  });
  localStorage.setItem(DEVICE_TOKEN_KEY, deviceToken);
  localStorage.setItem(LAST_UPSERT_KEY, String(Date.now()));
}

async function registerDevice(): Promise<void> {
  const savedToken = localStorage.getItem(DEVICE_TOKEN_KEY);
  const lastUpsert = Number(localStorage.getItem(LAST_UPSERT_KEY) ?? 0);
  if (savedToken && Date.now() - lastUpsert < timeGap) return;

  const messaging = await getMessagingInstance();
  if (!messaging) return;

  try {
    const { getToken } = await import('firebase/messaging');
    const deviceToken = await getToken(messaging, {
      vapidKey: firebaseVapidKey,
    });
    if (deviceToken) {
      await upsertDeviceToken(deviceToken);
    }
  } catch (err) {
    console.error('[PushNotification] device token registration failed:', err);
  }
}

export async function ensurePushNotifications(): Promise<void> {
  if (!browser || initialized) return;
  initialized = true;

  if (!authStore.isAuthenticated || authStore.isTokenExpired()) return;

  const { isSupported } = await import('firebase/messaging');
  const supported = await isSupported();
  if (!supported || !('Notification' in window) || !navigator.serviceWorker) {
    console.log('[PushNotification] desktop push notification is not supported');
    return;
  }

  await attachForegroundListener();

  if (Notification.permission === 'granted') {
    await registerDevice();
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerDevice();
    }
  }
}