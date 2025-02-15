<template>
	<div class="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
		<div class="sm:mx-auto sm:w-full sm:max-w-md">
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
		</div>

		<div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
			<div class="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
				<form class="space-y-6" @submit.prevent="handleLogin">
					<div>
						<label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
						<div class="mt-1">
							<input v-model="formData.email" id="email" type="email" required class="input-field" />
						</div>
					</div>

					<div>
						<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
						<div class="mt-1">
							<input v-model="formData.password" id="password" type="password" required class="input-field" />
						</div>
					</div>

					<div v-if="error" class="text-red-600 text-sm">
						{{ error.message }}
					</div>

					<div>
						<button type="submit" class="w-full btn-primary" :disabled="loading">
							{{ loading ? 'Signing in...' : 'Sign in' }}
						</button>
					</div>
				</form>

				<div class="mt-6">
					<div class="relative">
						<div class="absolute inset-0 flex items-center">
							<div class="w-full border-t border-gray-300"></div>
						</div>
						<div class="relative flex justify-center text-sm">
							<span class="px-2 bg-white text-gray-500">Or continue with</span>
						</div>
					</div>

					<div class="mt-6">
						<button @click="handleGithubLogin" class="w-full btn-primary bg-gray-800 hover:bg-gray-900">
							<span class="flex items-center justify-center">GitHub</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useAuth } from './composables/useAuth'

interface FormData {
	email: string
	password: string
}

const formData = reactive<FormData>({
	email: '',
	password: ''
})

const { loading, error, signInWithPassword, signInWithGithub } = useAuth()

const handleLogin = async () => {
	try {
		await signInWithPassword(formData.email, formData.password)
	} catch {
		// Error is handled by the composable
	}
}

const handleGithubLogin = async () => {
	try {
		await signInWithGithub()
	} catch {
		// Error is handled by the composable
	}
}
</script>
