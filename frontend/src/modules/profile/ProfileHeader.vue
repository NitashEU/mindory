<template>
  <header class="profile-header">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ProfileHeader',
  data() {
    return {
      title: 'User Profile',
      subtitle: 'Welcome to your profile page'
    };
  }
});
</script>

<style scoped>
.profile-header {
  text-align: center;
  padding: 20px;
  background-color: #f5f5f5;
  border-bottom: 1px solid #e0e0e0;
}
</style>