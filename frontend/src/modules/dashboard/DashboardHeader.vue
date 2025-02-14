<template>
  <header class="dashboard-header">
    <h1>Dashboard</h1>
    <nav>
      <ul>
        <li><router-link to="/home">Home</router-link></li>
        <li><router-link to="/profile">Profile</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li><router-link to="/contact">Contact</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DashboardHeader',
});
</script>

<style scoped>
.dashboard-header {
  background-color: #f8f9fa;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard-header h1 {
  margin: 0;
}

.dashboard-header nav ul {
  list-style: none;
  padding: 0;
  display: flex;
  gap: 15px;
}

.dashboard-header nav a {
  text-decoration: none;
  color: #007bff;
}
</style>