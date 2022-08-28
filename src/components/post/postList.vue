<script lang="ts" setup>
import { ref,onMounted,computed } from 'vue'
import type { PropType } from "vue";
import { projectFirestore } from '@/firebase/config'
import { PostData } from './Post'
import { EventData } from "@/components/event/Events";
import postPanelVue from './postPanel.vue';
import EventTagAreaVue from "@/components/event/EventTagArea.vue";
const props = defineProps({
  allEvents: {type: Array as PropType<EventData[]> , required:true}
});

const allposts = ref([] as Array<PostData>);
const sortedAllposts = computed(() => allposts.value.slice().sort((a: any, b: any) => a.date < b.date? 1 : -1 ));
const isDelMode = ref(false);
onMounted(() => {
  let error :any = ref(null);
  let load = async () => {
    try {
      let collectionRef = projectFirestore.collection("posts");
      const unsub = collectionRef.onSnapshot(
      snap => {
        allposts.value = [];
        snap.docs.forEach(doc => {
          let dat = new PostData().newPost(doc);
          // dat.id = doc.id;
          allposts.value.push(dat);
        })
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
	<!-- <h2>メッセージ一覧</h2> -->
  <input class="mb-3" type="checkbox" id="checkbox" v-model="isDelMode">
  <label for="checkbox">delMode</label>
  <EventTagAreaVue :delmode="false" :allEvents="allEvents" />
	<div class="row g-2">
		<postPanelVue v-for="post in sortedAllposts" :key="post.date?.toString()" :delmode="isDelMode" :post="post" />
	</div>
</template>
