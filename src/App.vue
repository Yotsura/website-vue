<script setup lang="ts">
import { ref ,onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { projectFirestore } from '@/firebase/config'
import EventViewVue from './views/EventView.vue';
import { Work } from '@/components/work/Work';
import EventView from './views/EventView.vue';

const param = window.location.href.includes('/?id:')? (`/?id:` + window.location.href.split('/?id:')[1]) : "";

const allWorks = ref([] as Array<Work>);
onMounted(() => {
	let error :any = ref(null);
	let load = async () => {
		try {
		let collectionRef = projectFirestore.collection("works");
		const unsub = collectionRef.onSnapshot(
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
			<EventView v-if="param" :allWorks="allWorks" :param="param"/>
      <RouterView v-else :allWorks="allWorks"/>
    </div>
  </div>
</template>

<style scoped>
</style>
