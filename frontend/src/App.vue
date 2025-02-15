<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Navigation -->
    <nav class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex space-x-8">
            <div class="flex-shrink-0 flex items-center">
              <router-link to="/" class="text-xl font-bold text-gray-900">
                Mindory
              </router-link>
            </div>
            <div v-if="user" class="flex space-x-4">
              <router-link 
                to="/" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
              >
                Dashboard
              </router-link>
              <router-link 
                v-if="isAdmin"
                to="/admin" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/admin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
              >
                Admin
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <router-link 
              to="/about" 
              class="inline-flex items-center px-1 pt-1 text-sm font-medium"
              :class="[$route.path === '/about' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700']"
            >
              About
            </router-link>
            <button v-if="user" @click="handleLogout" class="text-gray-500 hover:text-gray-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSupabaseClient } from '@/composables/useSupabase';
import type { User } from '@supabase/supabase-js';

const router = useRouter();
const supabase = useSupabaseClient();
const user = ref<User | null>(null);

const isAdmin = computed(() => {
  return user.value?.user_metadata?.role === 'admin';
});

const handleLogout = async () => {
  try {
    await supabase.auth.signOut();
    router.push('/login');
  } catch (error) {
    console.error('Error:', error);
  }
};

onMounted(async () => {
  const { data: { user: currentUser } } = await supabase.auth.getUser();
  user.value = currentUser;

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null;
  });
});
</script>