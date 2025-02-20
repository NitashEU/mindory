<template>
	<div class="min-h-screen bg-gray-100">
		<header class="bg-white shadow">
			<div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
				<h1 class="text-3xl font-bold text-gray-900">Repositories</h1>
				<button @click="showAddModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
					Add Repository
				</button>
			</div>
		</header>
		<main>
			<div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
				<!-- Loading state -->
				<div v-if="loading" class="text-center">
					<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
				</div>

				<!-- Error state -->
				<div v-else-if="error" class="rounded-md bg-red-50 p-4">
					<div class="flex">
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">Error loading repositories</h3>
							<div class="mt-2 text-sm text-red-700">{{ error }}</div>
						</div>
					</div>
				</div>

				<!-- Repositories grid -->
				<div v-else class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					<div v-for="repo in repositories" :key="repo.id" 
							 class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
						<div class="px-4 py-5 sm:p-6">
							<div class="flex items-center">
								<div class="flex-shrink-0">
									<img v-if="repo.icon" :src="repo.icon" class="h-8 w-8" :alt="repo.name">
									<svg v-else class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
													d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
									</svg>
								</div>
								<div class="ml-4">
									<a :href="repo.url" target="_blank" 
										 class="text-lg font-medium text-blue-600 hover:text-blue-800">
										{{ repo.name }}
									</a>
									<p class="mt-1 text-sm text-gray-500">
										{{ repo.description }}
									</p>
								</div>
							</div>
							<div class="mt-4 flex justify-between items-center text-sm">
								<div class="text-gray-500">Updated {{ formatDate(repo.updated_at) }}</div>
								<div v-if="repo.vectorized" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
									Vectorized
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>

		<!-- Add Repository Modal -->
		<div v-if="showAddModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
			<div class="bg-white rounded-lg p-6 max-w-md w-full">
				<h2 class="text-xl font-bold mb-4">Add Repository</h2>
				<form @submit.prevent="handleAddRepository">
					<div class="space-y-4">
						<div>
							<label class="block text-sm font-medium text-gray-700">Name</label>
							<input 
								v-model="newRepo.name" 
								type="text" 
								required
								pattern=".{3,}"
								title="Repository name must be at least 3 characters long"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">URL</label>
							<input 
								v-model="newRepo.url" 
								type="url" 
								required
								pattern="^https?://.*"
								title="Please enter a valid repository URL starting with http:// or https://"
								class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
							/>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Description</label>
							<textarea v-model="newRepo.description"
												class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
						</div>
						<div>
							<label class="block text-sm font-medium text-gray-700">Icon URL</label>
							<input v-model="newRepo.icon" type="url"
										 class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
						</div>
					</div>
					<div class="mt-4">
						<div v-if="error" class="mb-4 text-sm text-red-600">
							{{ error }}
						</div>
						<div v-if="loading" class="mb-4 text-sm text-gray-600">
							{{ processingMessage }}
						</div>
						<div class="flex justify-end space-x-2">
							<button 
								type="button" 
								@click="showAddModal = false"
								:disabled="loading"
								class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md disabled:opacity-50">
								Cancel
							</button>
							<button 
								type="submit"
								:disabled="loading"
								class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center space-x-2">
								<span v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
								<span>{{ loading ? 'Processing...' : 'Add Repository' }}</span>
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSupabaseClient } from '@/composables/useSupabase';

interface Repository {
	id: string;
	icon: string | null;
	url: string;
	name: string;
	description: string | null;
	created_at: string;
	updated_at: string;
	user_id: string;
	vectorized: boolean;
}

const supabase = useSupabaseClient();
const repositories = ref<Repository[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const showAddModal = ref(false);
const newRepo = ref({
	name: '',
	url: '',
	description: '',
	icon: ''
});
const processingMessage = ref('');

const formatDate = (date: string) => {
	return new Date(date).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
};

const fetchRepositories = async () => {
	try {
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		const { data, error: err } = await supabase
			.from('repositories')
			.select('*')
			.order('updated_at', { ascending: false });

		if (err) throw err;
		repositories.value = data;
	} catch (err) {
		error.value = 'Failed to load repositories';
		console.error('Error:', err);
	} finally {
		loading.value = false;
	}
};

const handleAddRepository = async () => {
	try {
		if (!newRepo.value.url.trim() || !newRepo.value.name.trim()) {
			error.value = 'Repository name and URL are required';
			return;
		}

		loading.value = true;
		processingMessage.value = 'Fetching repository...';
		const { data: { user } } = await supabase.auth.getUser();
		if (!user) throw new Error('Not authenticated');

		processingMessage.value = 'Processing and vectorizing code...';
		const processResult = await fetch('http://127.0.0.1:3000/api/codebase-input/repo', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				repoUrl: newRepo.value.url,
				vectorize: true,
				includeDocs: true
			})
		});

		if (!processResult.ok) {
			const errorData = await processResult.json().catch(() => ({}));
			throw new Error(errorData.message || 'Failed to process repository');
		}

		const processData = await processResult.json();

		processingMessage.value = 'Saving repository...';
		const { error: err } = await supabase
			.from('repositories')
			.insert({
				name: newRepo.value.name,
				url: newRepo.value.url,
				description: newRepo.value.description || null,
				icon: newRepo.value.icon || null,
				user_id: user.id,
				vectorized: processData.vectorized || false
			});

		if (err) {
			if (err.code === '23505') { // Unique constraint error
				throw new Error('A repository with this URL already exists');
			}
			throw err;
		}
		
		showAddModal.value = false;
		newRepo.value = { name: '', url: '', description: '', icon: '' };
		await fetchRepositories();
	} catch (err: any) {
		error.value = err.message || 'Failed to add repository';
		console.error('Error:', err);
	} finally {
		loading.value = false;
		processingMessage.value = '';
	}
};

onMounted(() => {
	fetchRepositories();
});
</script>