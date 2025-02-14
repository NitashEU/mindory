<template>
  <div class="profile-view">
    <ProfileHeader />
    <ProfileDetails />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ProfileHeader from './ProfileHeader.vue';
import ProfileDetails from './ProfileDetails.vue';

export default defineComponent({
  name: 'ProfileView',
  components: {
    ProfileHeader,
    ProfileDetails,
  },
});
</script>

<style scoped>
.profile-view {
  padding: 20px;
}
</style>