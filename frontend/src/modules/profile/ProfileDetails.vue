<template>
  <div class="profile-details">
    <h2>Profile Details</h2>
    <div v-if="user">
      <p><strong>Name:</strong> {{ user.name }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Bio:</strong> {{ user.bio }}</p>
    </div>
    <div v-else>
      <p>Loading user details...</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useStore } from 'vuex';

export default defineComponent({
  name: 'ProfileDetails',
  computed: {
    user() {
      const store = useStore();
      return store.state.user.profile;
    }
  }
});
</script>

<style scoped>
.profile-details {
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
}
</style>