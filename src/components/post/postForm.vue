<script lang="ts" setup>
import { ref, computed , onMounted, onUpdated } from 'vue'
import { PostData } from './Post'

const props = defineProps({
  paramStr: String
});
// const emit = defineEmits(['completed']);

const input = ref(new PostData);
const didInput = computed(() => (input.value.message == ""|| input.value.message == null)? false : true);
onMounted(() => {
	input.value.qr = props?.paramStr??'';
});

onUpdated(() =>{
	if(input.value.qr != (props?.paramStr || ''))
		input.value.qr = props?.paramStr || '';
})

const onSubmit = () => {
	if(confirm(`以下の内容で送信しますか？\r\n名前：${input.value.name}\r\n本文：${input.value.message}`)){
		const error = ref(null);
		const post = async () => {
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
}
</script>

<template>
	<form @submit.prevent class="col-lg-5 my-3">
		<input class="form-control mb-2 d-none" type="text" readonly v-model="input.qr" />
		<input class="form-control mb-2" type="text"
		v-model="input.name"
		placeholder="ハンドルネーム ※なくても大丈夫です" />
		<textarea
		placeholder="感想/メッセージなど*"
		v-model="input.message"
		class="form-control mb-2" rows="6" type="text"></textarea>
		<button :disabled="!didInput" class="btn btn-dark btn-lg btn-block float-end" type="button" @click="onSubmit">送信</button>
	</form>
</template>

<style scoped>
</style>
