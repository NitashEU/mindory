<template>
	<div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
		<div class="max-w-md w-full space-y-8">
			<div>
				<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
					{{ isLogin ? 'Sign in to your account' : 'Create new account' }}
				</h2>
			</div>

			<!-- Error Alert -->
			<div v-if="error" class="rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm text-red-700">{{ error }}</div>
					</div>
				</div>
			</div>

			<form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
				<div class="rounded-md shadow-sm -space-y-px">
					<div>
						<input
							v-model="email"
							type="email"
							required
							class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Email address"
						/>
					</div>
					<div>
						<input
							v-model="password"
							type="password"
							required
							class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
							placeholder="Password"
						/>
					</div>
				</div>

				<div>
					<button
						type="submit"
						:disabled="loading"
						class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
					>
						<span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
							<svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						</span>
						{{ isLogin ? 'Sign in' : 'Sign up' }}
					</button>
				</div>

				<div class="flex items-center justify-center">
					<div class="text-sm">
						<button
							type="button"
							@click="toggleMode"
							class="font-medium text-blue-600 hover:text-blue-500"
						>
							{{ isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in' }}
						</button>
					</div>
				</div>

				<div class="relative">
					<div class="absolute inset-0 flex items-center">
						<div class="w-full border-t border-gray-300"></div>
					</div>
					<div class="relative flex justify-center text-sm">
						<span class="px-2 bg-gray-100 text-gray-500">Or continue with</span>
					</div>
				</div>

				<div>
					<button
						type="button"
						@click="handleGoogleSignIn"
						:disabled="loading"
						class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
					>
						<svg class="h-5 w-5 mr-2" viewBox="0 0 24 24">
							<path
								fill="currentColor"
								d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
							/>
						</svg>
						Continue with Google
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabaseAuth } from '@/composables/useSupabase';

const router = useRouter();
const { signInWithEmail, signUpWithEmail, signInWithGoogle, error: authError, loading } = useSupabaseAuth();

const email = ref('');
const password = ref('');
const isLogin = ref(true);
const error = ref<string | null>(null);

const handleSubmit = async () => {
	error.value = null;
	try {
		if (isLogin.value) {
			const response = await signInWithEmail(email.value, password.value);
			if (!authError.value && response.data.user) {
				router.push('/');
			} else {
				error.value = authError.value;
			}
		} else {
			const response = await signUpWithEmail(email.value, password.value);
			if (!authError.value && response.data.user) {
				router.push('/');
			} else {
				error.value = authError.value;
			}
		}
	} catch (err: any) {
		error.value = err.message;
	}
};

const handleGoogleSignIn = async () => {
	error.value = null;
	try {
		const { data, error: signInError } = await signInWithGoogle();
		if (signInError) {
			error.value = signInError.message;
		}
		// OAuth redirect will handle the rest
	} catch (err: any) {
		error.value = err.message;
	}
};

const toggleMode = () => {
	isLogin.value = !isLogin.value;
	error.value = null;
};

</script>