/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

declare module 'vscode' {
	export interface AuthenticatedCSUser {
		email: string;
	}

	export type SubscriptionStatus =
		| 'free'
		| 'pending_activation'
		| 'active'
		| 'pending_cancellation'
		| 'cancelled';

	export interface SubscriptionResponse {
		status: SubscriptionStatus;
		subscriptionEnding?: number;
	}
}
