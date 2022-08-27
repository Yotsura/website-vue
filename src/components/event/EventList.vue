<script lang="ts" setup>
import { ref , onMounted } from "vue";
import type { PropType } from "vue";
import { Work } from "@/components/work/Work";
import { EventData } from "./Events";
import { projectFirestore } from '@/firebase/config'
import EventVue from "./Event.vue";
// const props = defineProps({
//   allEvents: { type: Array as PropType<EventData[]>, required: true },
// });
const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const allEvents = ref([] as Array<EventData>);
onMounted(() => {
	let error :any = ref(null);
	let load = async () => {
		try {
		let collectionRef = projectFirestore.collection("events");
		const unsub = collectionRef.onSnapshot(
		snap => {
			allEvents.value = snap.docs.map(doc => {
        var temp = new EventData().newEvent(doc);
        temp.works = props.allWorks.filter(work => work.data.eventID == temp.id);
        console.log(`${temp.id}`);
        
        return temp;
      });
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
const isDelMode = ref(false);
</script>

<template>
  <h2>EventList</h2>
  <input class="mb-3" type="checkbox" id="checkbox" v-model="isDelMode" />
  <label for="checkbox">delMode</label>
  <!-- <div v-if="isDelMode" class="mb-3">
    <button type="button" class="btn btn-danger">DELETE EVENT</button>
  </div> -->
  <EventVue v-for="event in allEvents" :key="event.id"
    :event="event" :delmode="isDelMode"/>
</template>

<style scoped>
</style>