<script lang="ts" setup>
import { ref, computed , onMounted, onUpdated } from 'vue'

const link1 = ref('');
const link2 = ref('');
const link3 = ref('');
const link4 = ref('');
const didInput = computed(() => link1.value!='' && link2.value!='' && link3.value!='' && link4.value!='');

const onSubmit = () => {
	if(confirm(`設定を保存しますか？`)){
		const error = ref(null);
		const post = async () => {
			try {
				// input.value.upload();
				// input.value = new PostData;
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
	※テスト中
	<form @submit.prevent class="col-lg-5 my-3">
    pixiv
		<input class="form-control mb-2" type="text" v-model="link1" placeholder="pixiv link" />
    twitter
		<input class="form-control mb-2" type="text" v-model="link2" placeholder="twitter link" />
    circlems
		<input class="form-control mb-2" type="text" v-model="link3" placeholder="circlems link" />
    melonbooks
		<input class="form-control mb-2" type="text" v-model="link4" placeholder="melon books link" />
		<button :disabled="!didInput" class="btn btn-dark btn-lg btn-block float-end" type="button" @click="onSubmit">送信</button>
	</form>
</template>

<style scoped>
</style>