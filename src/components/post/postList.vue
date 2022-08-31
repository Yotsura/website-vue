<script lang="ts" setup>
import { ref,onMounted,computed } from 'vue'
import { projectFirestore } from '@/firebase/config'
import { PostData } from './Post'
import { EventData } from "@/components/event/Events";
import postPanelVue from './postPanel.vue';
import EventTagAreaVue from "@/components/event/EventTagArea.vue";

const eventTags = computed(() =>  Array.from(new Set( allposts.value.map(x=> x.qr)) ));

const allposts = ref([] as Array<PostData>);
const isDelMode = ref(false);
onMounted(() => {
  const error :any = ref(null);
  const load = async () => {
    try {
      const collectionRef = projectFirestore.collection("posts");
      collectionRef.onSnapshot(
      snap => {
        allposts.value = [];
        snap.docs.forEach(doc => {
          const dat = new PostData().newPost(doc);
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

const indicatePosts = computed(() =>
	allposts.value.filter(post => selectedEvent.value.id == "" ? true :
		(selectedEvent.value.id == post.qr)));
const sortedAllposts = computed(() => indicatePosts.value.slice().sort((a: any, b: any) => a.date < b.date? 1 : -1 ));
const selectedEvent = ref(new EventData);

const eventClicked = (event:EventData) => {
  // console.log(`${event.name}(${event.id})` );
	selectedEvent.value = event;
}
</script>

<template>
	<!-- <h2>メッセージ一覧</h2> -->
  <input class="mb-3" type="checkbox" id="checkbox" v-model="isDelMode">
  <label for="checkbox">delMode</label>
  <EventTagAreaVue :delmode="false" :selectIDs="eventTags" @selectTag="eventClicked"  />
	<div class="row g-2">
    <transition-group name="list">
      <postPanelVue v-for="post in sortedAllposts" :key="post.date?.toString()" :delmode="isDelMode" :post="post" />
    </transition-group>
	</div>
</template>