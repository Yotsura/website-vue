<script lang="ts" setup>
import { ref, computed ,defineEmits, onMounted } from 'vue'
import { PostData } from './Post'

const emit = defineEmits(['completed']);

const paramStr = window.location.href.includes('?id:')? window.location.href.split('?id:')[1]:"";
const input = ref(new PostData);
const didInput = computed(() => (input.value.message == ""|| input.value.message == null)? false : true);

onMounted(() => {
	input.value.qr = paramStr;
});

const onSubmit = () => {
	let error = ref(null);
	let post = async () => {
		try {
			input.value.upload();
			input.value = new PostData;
			alert("送信完了しました。ありがとうございました！");
		} catch (err: any) {
			error.value = err.message;
			console.log(error.value);
			alert('送信失敗しました。');
		}
	}
	post();
	return { error, post }
}
</script>

<template>
	<form @submit.prevent class="col-lg-5 my-3">
		<input class="form-control mb-2" type="text" readonly v-model="input.qr" v-if="input.qr" />	
		<input class="form-control mb-2" type="text"
		v-model="input.name"
		placeholder="ハンドルネーム ※なくても大丈夫です" />
		<textarea
		placeholder="感想/メッセージなど*"
		v-model="input.message"
		class="form-control mb-2" rows="6" type="text"></textarea>
		<button :disabled="!didInput" class="btn btn-primary btn-lg btn-block" type="button" @click="onSubmit">送信</button>
	</form>
</template>

<style scoped>
</style>
