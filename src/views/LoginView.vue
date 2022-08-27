<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import useLogin from '@/utils/useLogin';
import getUser from '@/utils/getUser';

const email = ref('');
const password = ref('');
const { error, login } = useLogin();
const { user } = getUser()
const router = useRouter()
watch(user, () => {
  if (user.value) {
    router.push({ name: 'admin' });
  }
})

const handleSubmit = async () => {
  await login(email.value, password.value)
  if (!error.value) {
    console.log('log in completed');
    router.push({ name: 'admin' });
  }
}
</script>

<template>
  <div class="col-lg-5 my-3">
    <form @submit.prevent="handleSubmit">
      <input class="form-control mb-2" type="email" required placeholder="email" v-model="email" />
      <input class="form-control mb-2" type="password" required placeholder="password" v-model="password" />
      <div class="error">{{ error }}</div>
      <button class="btn btn-primary m-1">Sign in</button>
    </form>
  </div>
</template>