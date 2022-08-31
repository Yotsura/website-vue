<script setup lang="ts">
import { ref ,onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { projectFirestore } from '@/firebase/config'
import EventViewVue from './views/EventView.vue';
import { Work } from '@/components/work/Work';
import { EventData } from '@/components/event/Events';
import { useTagStore } from '@/store/modules/events';

const param = window.location.href.includes('/?id:')? (`/?id:` + window.location.href.split('/?id:')[1]) : "";

const events = useTagStore();
const allWorks = ref([] as Array<Work>);
onMounted(() => {
	const error :any = ref(null);
	const load = async () => {
		try {
			// projectFirestore.collection("events").onSnapshot(snap => {
			// 	events.seEventTagList(snap.docs.map(doc => new EventData().newEvent(doc)));
			// })
			projectFirestore.collection("events").onSnapshot(
			snap => {
				events.seEventTagList(snap.docs.map(doc => new EventData().newEvent(doc)));
				error.value = null;
			},
			err => {
				console.log(err.message);
				error.value = 'could not fetch data';
			});
			projectFirestore.collection("works").onSnapshot(
			snap => {
				allWorks.value = snap.docs.map(doc => new Work(doc));
				allWorks.value.forEach(dat => dat.loadImg());
				
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
	<div id="wrapper" class="container" ontouchstart="">
    <div class="row">
      <h1>弓張月/<small>寄弦</small></h1>
			<EventViewVue v-if="param" :allWorks="allWorks" />
      <RouterView v-else :allWorks="allWorks"/>
    </div>
  </div>
</template>

<style scoped>
</style>
