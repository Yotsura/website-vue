<script lang="ts" setup>
import { ref ,computed } from "vue";
// import type { PropType } from "vue";
import { EventData } from "./Events";
// defineProps({
//   allEvents: { type: Array as PropType<EventData[]>, required: true },
// });

const input = ref(new EventData);
const didInput = computed(() => (input.value.id == ""|| input.value.name == null)? false : true);

const onSubmit = () => {
  let error = ref(null);
  let post = async () => {
    try {
      console.log('送信開始');
      await input.value.setData();
      alert('送信成功');
      input.value = new EventData;
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
      v-model="input.id"
      placeholder="イベントID ※urlに使用" />
    <input class="form-control mb-2" type="text"
      v-model="input.name"
      placeholder="イベント名" />
    <button :disabled="!didInput" class="btn btn-primary btn-lg btn-block" type="button" @click="onSubmit">送信</button>
  </form>
</template>

<style scoped>
</style>