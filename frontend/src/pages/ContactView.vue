<template>
  <div class="contact-view">
    <h1>Contact Us</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="form.name" required />
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="form.email" required />
      </div>
      <div>
        <label for="message">Message:</label>
        <textarea id="message" v-model="form.message" required></textarea>
      </div>
      <button type="submit">Send Message</button>
    </form>
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ContactView',
  setup() {
    const form = ref({
      name: '',
      email: '',
      message: ''
    });
    const successMessage = ref('');

    const submitForm = () => {
      // Here you would typically send the form data to your backend
      console.log('Form submitted:', form.value);
      successMessage.value = 'Your message has been sent successfully!';
      form.value = { name: '', email: '', message: '' }; // Reset form
    };

    return {
      form,
      successMessage,
      submitForm
    };
  }
});
</script>

<style scoped>
.contact-view {
  max-width: 600px;
  margin: auto;
  padding: 20px;
}

.success-message {
  margin-top: 20px;
  color: green;
}
</style>