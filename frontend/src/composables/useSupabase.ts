import { createClient, User, Provider, AuthResponse, AuthTokenResponse, AuthError } from "@supabase/supabase-js";
import { onUnmounted, ref } from "vue";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const useSupabaseClient = () => {
  const client = createClient(supabaseUrl, supabaseKey);
  return client;
};

export const useSupabaseAuth = () => {
  const user = ref<User | null>(null);
  const client = useSupabaseClient();
  const error = ref<string | null>(null);
  const loading = ref(false);

  const authStateChange = client.auth.onAuthStateChange((event, session) => {
    user.value = session?.user ?? null;
  });

  const signInWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (response.error) throw response.error;
      return response;
    } catch (err: any) {
      error.value = err.message;
      return { data: { user: null, session: null }, error: err as AuthError };
    } finally {
      loading.value = false;
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<AuthResponse> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.auth.signUp({
        email,
        password,
      });
      if (response.error) throw response.error;
      return response;
    } catch (err: any) {
      error.value = err.message;
      return { data: { user: null, session: null }, error: err as AuthError };
    } finally {
      loading.value = false;
    }
  };

  const signInWithGoogle = async (): Promise<{ data: { provider: Provider; url: string; } | { user: User | null }, error: AuthError | null }> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (response.error) throw response.error;
      return response;
    } catch (err: any) {
      error.value = err.message;
      return { data: { user: null }, error: err as AuthError };
    } finally {
      loading.value = false;
    }
  };

  const signOut = async (): Promise<{ error: AuthError | null }> => {
    loading.value = true;
    error.value = null;
    try {
      const response = await client.auth.signOut();
      if (response.error) throw response.error;
      return response;
    } catch (err: any) {
      error.value = err.message;
      return { error: err as AuthError };
    } finally {
      loading.value = false;
    }
  };

  onUnmounted(() => {
    authStateChange.data?.subscription.unsubscribe();
  });

  return {
    user,
    error,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };
};
