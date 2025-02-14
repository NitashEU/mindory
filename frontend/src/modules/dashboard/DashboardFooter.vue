<template>
  <footer class="dashboard-footer">
    <div class="footer-content">
      <p>&copy; {{ currentYear }} Your Company Name. All rights reserved.</p>
    </div>
  </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'DashboardFooter',
  data() {
    return {
      currentYear: new Date().getFullYear(),
    };
  },
});
</script>

<style scoped>
.dashboard-footer {
  background-color: #f8f9fa;
  padding: 20px;
  text-align: center;
  border-top: 1px solid #dee2e6;
}
</style>