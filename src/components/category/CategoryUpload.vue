<script lang="ts" setup>
import { ref ,computed } from "vue";
// import type { PropType } from "vue";
import { CategoryData } from "./Category";

const input = ref(new CategoryData);
const didInput = computed(() => (input.value.id == ""|| input.value.name == null)? false : true);

const onSubmit = () => {
  const error = ref(null);
  const post = async () => {
    try {
      console.log('送信開始');
      await input.value.setData();
      alert('送信成功');
      input.value = new CategoryData;
    } catch (err: any) {
      error.value = err.message;
      console.log(error.value);
      alert('送信失敗');
    }
  }
  post();
  return { error, post }
}
</script>

<template>
  <h2>Create New Category</h2>
  <form @submit.prevent class="col-lg-5 my-3">
    <input class="form-control mb-2" type="text"
      v-model="input.name"
      placeholder="カテゴリー名" />
    <input class="form-control mb-2" type="text"
      v-model="input.id"
      placeholder="カテゴリーID ※urlに使用" />
    <button :disabled="!didInput" class="btn btn-primary btn-lg btn-block" type="button" @click="onSubmit">送信</button>
  </form>
</template>

<style scoped>
</style>