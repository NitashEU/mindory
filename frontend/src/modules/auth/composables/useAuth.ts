import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient } from '@/composables/useSupabase'

interface AuthError {
	message: string
	code?: string
}

export function useAuth() {
	const router = useRouter()
	const supabase = useSupabaseClient()
	
	const loading = ref(false)
	const error = ref<AuthError | null>(null)

	const signInWithPassword = async (email: string, password: string) => {
		try {
			loading.value = true
			error.value = null
			
			const { error: authError } = await supabase.auth.signInWithPassword({
				email,
				password,
			})

			if (authError) throw authError
			
			router.push('/repositories')
		} catch (err: any) {
			error.value = {
				message: err.message || 'Failed to sign in',
				code: err.code
			}
			throw error.value
		} finally {
			loading.value = false
		}
	}

	const signInWithGithub = async () => {
		try {
			error.value = null
			const { error: authError } = await supabase.auth.signInWithOAuth({
				provider: 'github',
			})
			if (authError) throw authError
		} catch (err: any) {
			error.value = {
				message: err.message || 'Failed to sign in with GitHub',
				code: err.code
			}
			throw error.value
		}
	}

	return {
		loading,
		error,
		signInWithPassword,
		signInWithGithub
	}
}