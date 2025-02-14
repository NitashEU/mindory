<template>
  <div class="shared-component">
    <slot></slot>
  </div>
</template>

<script lang="ts">
export default {
  name: 'SharedComponent',
};
</script>

<style scoped>
.shared-component {
  padding: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
}
</style>