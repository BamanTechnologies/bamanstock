import { ApolloClient, InMemoryCache, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { HttpLink } from '@apollo/client/link/http';
import { onError } from '@apollo/client/link/error';
import { CombinedGraphQLErrors, ServerError } from '@apollo/client/errors';
import { browser } from '$app/environment';
import { PUBLIC_HASURA_URL } from '$env/static/public';

const HASURA_URL = browser ? (PUBLIC_HASURA_URL || 'http://localhost:8080/v1/graphql') : '';

function errorLink() {
  return onError(({ error }) => {
    if (CombinedGraphQLErrors.is(error)) {
      for (const err of error.errors) {
        console.error(`[GraphQL]: ${err.message}`);
      }
    } else if (ServerError.is(error)) {
      console.error(`[Network ${error.statusCode}]: ${error.message}`);
    } else {
      console.error(`[Error]: ${error.message}`);
    }
  });
}

function anonymousLink() {
  const http = new HttpLink({ uri: HASURA_URL });
  return from([errorLink(), http]);
}

function authLink(token: string, role?: string) {
  const http = new HttpLink({ uri: HASURA_URL });
  const auth = setContext(() => {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (role) headers['x-hasura-role'] = role;
    return { headers };
  });
  return from([errorLink(), auth, http]);
}

function getToken(): string | null {
  if (!browser) return null;
  return localStorage.getItem('auth_token') ?? null;
}

const defaultOptions = {
  watchQuery: { fetchPolicy: 'network-only' as const },
  query: { fetchPolicy: 'network-only' as const },
  mutate: { fetchPolicy: 'network-only' as const },
};

let anonymousClient: ApolloClient | null = null;
let authClient: ApolloClient | null = null;
const roleClients = new Map<string, ApolloClient>();

export function getAnonymousClient(): ApolloClient {
  if (!anonymousClient) {
    anonymousClient = new ApolloClient({
      link: anonymousLink(),
      cache: new InMemoryCache(),
      defaultOptions,
    });
  }
  return anonymousClient;
}

export function getAuthClient(role?: string): ApolloClient {
  const token = getToken();
  if (!token) return getAnonymousClient();

  if (role) {
    const cached = roleClients.get(role);
    if (cached) return cached;
    const client = new ApolloClient({
      link: authLink(token, role),
      cache: new InMemoryCache(),
      defaultOptions,
    });
    roleClients.set(role, client);
    return client;
  }

  if (!authClient) {
    authClient = new ApolloClient({
      link: authLink(token),
      cache: new InMemoryCache(),
      defaultOptions,
    });
  }
  return authClient;
}

export function getClient(): ApolloClient {
  return getToken() ? getAuthClient() : getAnonymousClient();
}

export function resetClients() {
  anonymousClient = null;
  authClient = null;
  roleClients.clear();
}
