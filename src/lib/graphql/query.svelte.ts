import { getClient, getAuthClient } from './client.ts';
import type { DocumentNode } from '@apollo/client';

export type QueryResult<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function queryStore<T = unknown>(
  document: DocumentNode,
  variables?: Record<string, unknown>,
  authenticated = false,
): QueryResult<T> {
  let data = $state<T | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  $effect(() => {
    const client = authenticated ? getAuthClient() : getClient();
    let cancelled = false;

    client
      .query<T>({ query: document, variables })
      .then((result) => {
        if (cancelled) return;
        data = result.data ?? null;
        loading = false;
      })
      .catch((err: Error) => {
        if (cancelled) return;
        error = err.message;
        loading = false;
      });

    return () => {
      cancelled = true;
    };
  });

  return {
    get data() { return data; },
    get loading() { return loading; },
    get error() { return error; },
  };
}

export function mutateStore<T = unknown>(
  document: DocumentNode,
  authenticated = false,
) {
  const client = authenticated ? getAuthClient() : getClient();

  async function mutate(variables?: Record<string, unknown>): Promise<T | null> {
    try {
      const result = await client.mutate<T>({ mutation: document, variables });
      return result.data ?? null;
    } catch (err) {
      console.error('[Mutation error]', err);
      return null;
    }
  }

  return mutate;
}
