<script lang="ts" setup>
import { ref } from 'vue'
import { WorkData } from './Work'
import { CategoryData } from '../category/Category';
import { useTagStore } from '@/store/modules/category';
const allCategory = useTagStore().getCategoryTagList;

const props = defineProps({
	needCaption:  {type: Boolean , required:true},
	dirName: {type: String , required:true}
});

const input = ref<WorkData>(new WorkData({}));

const preview = ref();
const fileData = ref();
const imgurl = ref('');

const previewImg = () =>{
	fileData.value = preview.value.files[0];
	imgurl.value = URL.createObjectURL(fileData.value);
	preview.value = '';
}

const deletePreview = () => {
	fileData.value = '';
	imgurl.value = '';
	
	const target = document.getElementById("fileUp") as HTMLInputElement;
	if(target){
		target.value = "";
	}
}

const submitting = ref(false);
const onSubmit = () => {
	submitting.value = true;
	const error = ref(null);
	const load = async () => {
		try {
			console.log('送信開始');
			const id = new Date().getTime().toString();
			console.log(`パス：img\\${props.dirName}\\${id}`);
			await input.value.upload(fileData.value ,props.dirName ,id).then(() => {
				deletePreview();
				input.value.caption='';
				console.log("作品の投稿が完了しました。")
				alert('作品の投稿が完了しました。');
				submitting.value = false;
			});
		} catch (err: any) {
			error.value = err.message;
			console.log(error.value);
			alert('送信失敗');
			submitting.value = false;
		}
	}
	load();
	return { error, load }
}

const selectedCategory  = ref(new CategoryData);
</script>

<template>
<div class="row">
	<div class="p-3 col-md-4 col-12">
		<label class="btn btn-outline-secondary">
			<input id="fileUp" type="file" ref="preview"
				:disabled="submitting"
				@change="previewImg"
				accept="image/png, image/jpeg, image/jpg"/>
			Upload Work
		</label><br>
		<img v-if="imgurl" class="img-fluid" :src="imgurl">
	</div>
	<div v-if="imgurl" class="p-3 col-md-8 col-12">
		<select v-model="selectedCategory" @change="input.categoryID = selectedCategory.id" class="btn btn-outline-secondary dropdown-toggle mb-2">
			<option v-for="category in allCategory" :key="category.id"
				v-bind:value="category">
				{{ category.name }}
			</option>
		</select>

		<span>Selected: {{ selectedCategory.id }}</span>

    <input class="form-control mb-2" disabled type="text"
      v-model="input.categoryID"
      placeholder="イベントID ※urlに使用" />
		<textarea v-if="props.needCaption" class="form-control mb-2" type="text"
		v-model="input.caption"  rows="10"
		placeholder="作品のキャプション" />
		<div class=" btn-group d-flex my-2" role="group">
			<button class="btn btn-primary flex-fill" :disabled="submitting" @click="deletePreview">CANCEL</button>
			<button class="btn btn-danger flex-fill" :disabled="submitting || input.categoryID==''" @click="onSubmit">UPLOAD</button>
		</div>
	</div>
</div>
</template>

<style scoped>
input[type="file"] {
    display: none;
}
</style>