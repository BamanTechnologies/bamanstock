import { getAuthClient } from '$lib/graphql/client';
import GET_COMPANY_SUBSCRIPTION from '$lib/graphql/queries/subscription/company_subscriptions.gql';
import type { CompanySubscription, SubscriptionLoadResult } from './types';

export async function fetchCompanySubscriptionForCompany(
	companyId: string | null | undefined,
	role?: string
): Promise<SubscriptionLoadResult> {
	if (!companyId) {
		return {
			subscription: null,
			hasActiveSubscription: null,
			error: null,
			loaded: true
		};
	}

	try {
		const client = getAuthClient(role);
		const res = await client.query<{
			companies_by_pk: { id: string; name: string; has_active_subscription: boolean | null } | null;
			billing_subscriptions: CompanySubscription[];
		}>({
			query: GET_COMPANY_SUBSCRIPTION,
			variables: { companyId },
			fetchPolicy: 'network-only'
		});

		return {
			subscription: res.data?.billing_subscriptions?.[0] ?? null,
			hasActiveSubscription: res.data?.companies_by_pk?.has_active_subscription ?? null,
			error: null,
			loaded: true
		};
	} catch (error) {
		return {
			subscription: null,
			hasActiveSubscription: null,
			error: error instanceof Error ? error.message : 'Failed to load subscription',
			loaded: true
		};
	}
}
