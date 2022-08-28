<script lang="ts" setup>
import { ref, computed ,defineEmits } from 'vue'
import { PostData } from './Post'

const emit = defineEmits(['completed']);

const param = window.location.href.includes('?id:')? window.location.href.split('?id:')[1]:"";
const input = ref(new PostData);
const didInput = computed(() => (input.value.message == ""|| input.value.message == null)? false : true);

const onSubmit = () => {
	let error = ref(null);
	let post = async () => {
		try {
			console.log('送信開始');
			input.value.upload();
			input.value = new PostData;
			emit("completed");
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
	<form @submit.prevent class="col-lg-5 my-3">
		<input class="form-control mb-2" type="text"
		v-model="input.name"
		placeholder="ハンドルネーム ※なくても大丈夫です" />
		<textarea
		placeholder="感想/メッセージなど*"
		v-model="input.message"
		class="form-control mb-2" rows="10" type="text"></textarea>
	<input class="form-control mb-2" type="text" readonly v-model="input.qr" v-if="input.qr" />
	<button :disabled="!didInput" class="btn btn-primary btn-lg btn-block" type="button" @click="onSubmit">送信</button>
	</form>
</template>

<style scoped>
</style>
