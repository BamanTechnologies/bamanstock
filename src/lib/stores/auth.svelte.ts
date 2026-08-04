import { browser } from '$app/environment';
import { jwtDecode } from 'jwt-decode';

const logoutListeners = new Set<() => void>();
const loginListeners = new Set<() => void>();

export type AuthUser = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar: string;
  role: string;
  investorId?: string;
} | null;

export type JwtPayload = {
  sub: string;
  name: string;
  email: string;
  phone: string;
  profile_picture: string | null;
  metadata: {
    'x-hasura-default-role': string;
    'x-hasura-allowed-roles': string[];
    'x-hasura-user-id': string;
    'x-hasura-investor-id': string;
  };
  exp: number;
};

function createAuthStore() {
  let user = $state<AuthUser>(null);

  function decodeAndSetUser(token: string) {
    try {
      const payload = jwtDecode<JwtPayload>(token);
      user = {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        avatar: payload.profile_picture ?? '',
        role: payload.metadata['x-hasura-default-role'],
        investorId: payload.metadata['x-hasura-investor-id'],
      };
    } catch {
      user = null;
    }
  }

  function getToken(): string | null {
    if (!browser) return null;
    return localStorage.getItem('auth_token');
  }

  function isTokenExpired(): boolean {
    const token = getToken();
    if (!token) return true;
    try {
      const payload = jwtDecode<JwtPayload>(token);
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  function init() {
    if (!browser) return;
    const token = getToken();
    if (token) {
      decodeAndSetUser(token);
    }
  }

  function loginWithToken(token: string) {
    if (!browser) return;
    localStorage.setItem('auth_token', token);
    decodeAndSetUser(token);
    loginListeners.forEach((fn) => fn());
  }

  function logout() {
    user = null;
    if (browser) {
      localStorage.removeItem('auth_token');
    }
    logoutListeners.forEach((fn) => fn());
  }

  function onLogout(listener: () => void) {
    logoutListeners.add(listener);
    return () => logoutListeners.delete(listener);
  }

  function onLogin(listener: () => void) {
    loginListeners.add(listener);
    return () => loginListeners.delete(listener);
  }

  return {
    get user() { return user; },
    get isAuthenticated() { return user !== null; },
    getToken,
    isTokenExpired,
    init,
    loginWithToken,
    logout,
    onLogout,
    onLogin,
  };
}

export const authStore = createAuthStore();
