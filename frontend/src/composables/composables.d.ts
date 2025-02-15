declare module '@/composables/useSupabase' {
	import { Ref } from 'vue'
	import { SupabaseClient, User, AuthResponse, AuthError, Provider } from '@supabase/supabase-js'

	export function useSupabaseClient(): SupabaseClient

	export function useSupabaseAuth(): {
		user: Ref<User | null>
		error: Ref<string | null>
		loading: Ref<boolean>
		signInWithEmail: (email: string, password: string) => Promise<AuthResponse>
		signUpWithEmail: (email: string, password: string) => Promise<AuthResponse>
		signInWithGoogle: () => Promise<{ 
			data: { provider: Provider; url: string; } | { user: User | null }, 
			error: AuthError | null 
		}>
		signOut: () => Promise<{ error: AuthError | null }>
	}
}