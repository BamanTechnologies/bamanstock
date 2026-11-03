import { SUBSCRIPTION_BLOCKED_MESSAGE } from '$lib/subscription/status';

const USER_FACING_ERROR_MESSAGES: Array<[RegExp, string]> = [
	[/active subscription is required|active subscription required|subscription has expired/i, SUBSCRIPTION_BLOCKED_MESSAGE],
	[/unique constraint|duplicate key|already exists|uniqueness violation/i, 'A record with these details already exists.'],
	[/foreign key constraint|violates foreign key|not present in table/i, 'This cannot be saved because it refers to data that no longer exists.'],
	[/not-null constraint|null value in column|cannot be null/i, 'A required field is missing.'],
	[/check constraint|violates check constraint|invalid input syntax/i, 'Some of the values are not valid.'],
	[/permission denied|not authorized|access denied|insufficient permissions/i, 'You do not have permission to complete this action.']
];

function parseGraphqlErrorMessage(value: string): string | null {
	const jsonStart = value.indexOf('[');
	if (jsonStart < 0) return null;
	try {
		const parsed: unknown = JSON.parse(value.slice(jsonStart));
		if (!Array.isArray(parsed)) return null;
		const message = parsed.find(
			(item): item is { message: string } =>
				typeof item === 'object' && item !== null && 'message' in item && typeof item.message === 'string'
		)?.message;
		return message?.trim() || null;
	} catch {
		return null;
	}
}

function extractErrorMessage(value: unknown): string | null {
	if (typeof value === 'string') {
		const trimmed = value.trim();
		if (!trimmed) return null;
		const graphqlMessage = parseGraphqlErrorMessage(trimmed);
		if (graphqlMessage) return graphqlMessage;
		try {
			const parsed: unknown = JSON.parse(trimmed);
			if (parsed !== value) {
				const parsedMessage = extractErrorMessage(parsed);
				if (parsedMessage) return parsedMessage;
			}
		} catch {
			// ignore
		}
		return trimmed;
	}
	if (typeof value === 'object' && value !== null) {
		if ('message' in value) {
			return extractErrorMessage((value as { message?: unknown }).message);
		}
		if ('errors' in value) {
			return extractErrorMessage((value as { errors?: unknown }).errors);
		}
		if ('graphQLErrors' in value) {
			return extractErrorMessage((value as { graphQLErrors?: unknown }).graphQLErrors);
		}
		if ('networkError' in value) {
			return extractErrorMessage((value as { networkError?: unknown }).networkError);
		}
	}
	if (Array.isArray(value)) {
		for (const item of value) {
			const message = extractErrorMessage(item);
			if (message) return message;
		}
	}
	return null;
}

export function userFacingErrorMessage(value: unknown, fallback = 'Request failed'): string {
	const message = extractErrorMessage(value);
	if (!message) return fallback;
	const mappedMessage = USER_FACING_ERROR_MESSAGES.find(([pattern]) => pattern.test(message))?.[1];
	if (mappedMessage) return mappedMessage;
	if (/graphql errors?:\s*\[/i.test(message) || /^\s*[[{]/.test(message)) {
		return fallback;
	}
	return message;
}

export function formatErrorForToast(error: unknown): string {
	return userFacingErrorMessage(error, 'Something went wrong');
}

export function formatFormError(error: unknown): string {
	return userFacingErrorMessage(error, 'Request failed');
}
