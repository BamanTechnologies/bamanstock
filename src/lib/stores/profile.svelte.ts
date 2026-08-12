import { browser } from '$app/environment';
import { jwtDecode } from 'jwt-decode';
import { getAuthClient } from '$lib/graphql/client';
import PROFILE_QUERY from '$graphql/queries/auth/profile.gql';

function extractUserIdFromToken(): string | null {
  if (!browser) return null;
  const token = localStorage.getItem('auth_token');
  if (!token) return null;
  try {
    const payload = jwtDecode<Record<string, any>>(token);
    return payload?.metadata?.['x-hasura-user-id'] ?? null;
  } catch {
    return null;
  }
}

export function extractRoleFromToken(): string {
  if (!browser) return 'user';
  const token = localStorage.getItem('auth_token');
  if (!token) return 'user';
  try {
    const payload = jwtDecode<Record<string, any>>(token);
    return payload?.metadata?.['x-hasura-default-role'] ?? 'user';
  } catch {
    return 'user';
  }
}

export type ProfileData = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  profile_picture: string;
  telegram_chat_id?: string | null;
  telegram_user_name?: string | null;
  connect_telegram_url?: string | null;
  investors?: {
    id: string;
    first_name: string;
    last_name: string;
    phone_number: string;
    company_investors?: {
      company: {
        id: string;
        name: string;
      };
    }[];
  }[];
};

export type ProfileResult = {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  investorId: string | null;
  telegramChatId: string | null;
  telegramUserName: string | null;
  connectTelegramUrl: string | null;
  refetch: () => Promise<void>;
};

export function useProfile(): ProfileResult {
  let data = $state<ProfileData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  async function fetchProfile() {
    const userId = extractUserIdFromToken();
    if (!userId) {
      data = null;
      loading = false;
      return;
    }

    loading = true;
    error = null;

    try {
      const role = extractRoleFromToken();
      const client = getAuthClient(role);
      const result = await client.query<{ profile: ProfileData }>({
        query: PROFILE_QUERY,
        variables: { id: userId },
        fetchPolicy: 'network-only',
      });
      data = result.data?.profile ?? null;
    } catch (err: any) {
      error = err.message;
      data = null;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    fetchProfile();
  });

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
    get name() {
      if (!data) return '';
      return `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim();
    },
    get avatar() {
      return data?.profile_picture ?? '';
    },
    get email() {
      return data?.email ?? '';
    },
    get phone() {
      return data?.phone ?? '';
    },
    get investorId() {
      return data?.investors?.[0]?.id ?? null;
    },
    get telegramChatId() {
      return data?.telegram_chat_id ?? null;
    },
    get telegramUserName() {
      return data?.telegram_user_name ?? null;
    },
    get connectTelegramUrl() {
      return data?.connect_telegram_url ?? null;
    },
    refetch: fetchProfile,
  };
}

