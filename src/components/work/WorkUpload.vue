<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { uploadFile } from './fileCtrl'
import { WorkData } from './Work'
import { projectFirestore } from '@/firebase/config'
import { EventData } from '../event/Events'
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
	
	let target = document.getElementById("fileUp") as HTMLInputElement;
	if(target){
		target.value = "";
	}
}

const submitting = ref(false);
const onSubmit = () => {
	submitting.value = true;
	let error = ref(null);
	let load = async () => {
		try {
			console.log('送信開始');
			let id = new Date().getTime().toString();
			console.log(`パス：img\\${props.dirName}\\${id}`);
			//firestoreを更新するとsnapが変更を受け取って画像をDLしようとするため、先にstrogeに保存する。
			await uploadFile(fileData.value ,props.dirName ,id).then(() => {
				deletePreview();
				projectFirestore.collection(props.dirName).doc(id).set(input.value.getDataObj()).then(() => {
					input.value.caption='';
					alert('作品の投稿が完了しました。');
					submitting.value = false;
				});
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

const selectedEvent  = ref(new EventData);
const allEvents = ref([] as Array<EventData>);
onMounted(() => {
	let error :any = ref(null);
	let load = async () => {
		try {
		let collectionRef = projectFirestore.collection("events");
		const unsub = collectionRef.onSnapshot(
		snap => {
			allEvents.value = snap.docs.map(doc => new EventData().newEvent(doc));
			error.value = null;
		},
		err => {
			console.log(err.message);
			error.value = 'could not fetch data';
		});
		} catch (err: any) {
      error.value = err.message;
      console.log(error.value);
      alert('取得失敗');
		}
	}
	load();
	return { error, load }
});
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
		<select v-model="selectedEvent">
			<option v-for="event in allEvents" :key="event.id"
				v-bind:value="event">
				{{ event.name }}
			</option>
		</select>
		<span>Selected: {{ selectedEvent.name }}</span>
		
    <input class="form-control mb-2" type="text"
      v-model="input.eventID"
      placeholder="イベントID ※urlに使用" />
		<textarea v-if="props.needCaption" class="form-control mb-2" type="text"
		v-model="input.caption"  rows="10"
		placeholder="作品のキャプション" />
		<div class=" btn-group d-flex my-2" role="group">
			<button class="btn btn-primary flex-fill" :disabled="submitting" @click="deletePreview">CANCEL</button>
			<button class="btn btn-danger flex-fill" :disabled="submitting" @click="onSubmit">UPLOAD</button>
		</div>
	</div>
</div>
</template>

<style scoped>
input[type="file"] {
    display: none;
}
</style>