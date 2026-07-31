<script lang="ts">
  import { browser } from '$app/environment';
  import { jwtDecode } from 'jwt-decode';
  import { getAuthClient } from '$lib/graphql/client';
  import { toast } from 'svelte-sonner';
  import Icon from "$lib/components/ui/Icon/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Skeleton } from "$lib/components/ui/skeleton/index.js";
  import PROFILE_QUERY from '$graphql/queries/auth/profile.gql';
  import UPDATE_PROFILE_MUTATION from '$graphql/mutation/auth/update_profile.gql';

  function extractFromToken<T>(extractor: (payload: Record<string, unknown>) => T): T | null {
    if (!browser) return null;
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    try {
      const payload = jwtDecode<Record<string, unknown>>(token);
      return extractor(payload);
    } catch {
      return null;
    }
  }

  const userId = extractFromToken((p) => (p.metadata as Record<string, unknown>)?.['x-hasura-user-id'] as string) ?? '';
  const investorId = extractFromToken((p) => (p.metadata as Record<string, unknown>)?.['x-hasura-investor-id'] as string) ?? '';
  const role = 'user';

  let profileLoading = $state(true);
  let saving = $state(false);

  let firstName = $state('');
  let lastName = $state('');
  let email = $state('');
  let phone = $state('');
  let address = $state('');

  let profileName = $state('');

  $effect(() => {
    if (!userId) {
      profileLoading = false;
      return;
    }

    const client = getAuthClient(role);

    client.query<{ profile: { id: string; first_name: string; last_name: string; email: string; phone: string; profile_picture: string; investors?: { id: string; first_name: string; last_name: string; phone_number: string; address?: string }[] } }>({
      query: PROFILE_QUERY,
      variables: { id: userId },
      fetchPolicy: 'network-only',
    }).then((result) => {
      const data = result.data?.profile;
      if (data) {
        firstName = data.first_name ?? '';
        lastName = data.last_name ?? '';
        email = data.email ?? '';
        phone = data.phone ?? '';
        profileName = `${data.first_name ?? ''} ${data.last_name ?? ''}`.trim() || 'User';
        address = data.investors?.[0]?.address ?? '';
      }
    }).catch((err: Error) => {
      console.error('Failed to load profile', err);
    }).finally(() => {
      profileLoading = false;
    });
  });

  async function handleSave() {
    saving = true;

    try {
      const client = getAuthClient(role);

      const object = { first_name: firstName, last_name: lastName };
      const investorProfile = { first_name: firstName, last_name: lastName, address };

      await client.mutate({
        mutation: UPDATE_PROFILE_MUTATION,
        variables: { id: userId, object, investorId, investorProfile },
      });

      profileName = `${firstName} ${lastName}`.trim() || 'User';
      toast.success('Profile updated successfully');
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to update profile');
    } finally {
      saving = false;
    }
  }
</script>

<div class="flex-1 px-6 py-6 space-y-6">
  <!-- Profile Section -->
  <div class="bg-card border border-border rounded-lg p-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div
          class="w-20 h-20 rounded-full bg-muted flex items-center justify-center"
        >
          <Icon iconName="icon/user" size={40} class="text-muted-foreground" />
        </div>
        <div>
          <h2 class="text-2xl font-bold text-foreground mb-1">{profileName || (profileLoading ? '' : 'User')}</h2>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted-foreground">Investor</span>
            <span class="w-2 h-2 rounded-full bg-green-500"></span>
            <span class="text-sm text-green-600 font-medium">Active</span>
          </div>
        </div>
      </div>
      <!-- Change Photo button commented out -->
    </div>
  </div>

  <!-- Personal Information Section -->
  <div class="bg-card border border-border rounded-lg p-6">
    <h3 class="text-lg font-semibold text-foreground mb-6">
      Personal Information
    </h3>

    {#if profileLoading}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-4">
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
        </div>
        <div class="space-y-4">
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
          <Skeleton class="h-9 w-full" />
        </div>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-4">
          <!-- First Name -->
          <div class="space-y-2">
            <label for="first-name" class="text-sm font-medium text-foreground">
              First Name
            </label>
            <Input
              id="first-name"
              type="text"
              bind:value={firstName}
              class="w-full"
              disabled={saving}
            />
          </div>

          <!-- Last Name -->
          <div class="space-y-2">
            <label for="last-name" class="text-sm font-medium text-foreground">
              Last Name
            </label>
            <Input
              id="last-name"
              type="text"
              bind:value={lastName}
              class="w-full"
              disabled={saving}
            />
          </div>

          <!-- Email (disabled) -->
          <div class="space-y-2">
            <label for="email" class="text-sm font-medium text-foreground">
              Email
            </label>
            <Input
              id="email"
              type="email"
              bind:value={email}
              class="w-full"
              disabled
            />
          </div>
        </div>

        <!-- Right Column -->
        <div class="space-y-4">
          <!-- Phone (disabled) -->
          <div class="space-y-2">
            <label for="phone" class="text-sm font-medium text-foreground">
              Phone
            </label>
            <Input
              id="phone"
              type="tel"
              bind:value={phone}
              class="w-full"
              disabled
            />
          </div>

          <!-- Address -->
          <div class="space-y-2">
            <label for="address" class="text-sm font-medium text-foreground">
              Address
            </label>
            <Input
              id="address"
              type="text"
              bind:value={address}
              class="w-full"
              disabled={saving}
            />
          </div>
        </div>
      </div>
    {/if}

    <!-- Save Change Button -->
    <div class="flex justify-end mt-6">
      <Button
        class="bg-[#4DA0E6] text-white hover:bg-info/90"
        onclick={handleSave}
        disabled={saving || profileLoading}
      >
        {#if saving}
          <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        {/if}
        Save Change
      </Button>
    </div>
  </div>
</div>
