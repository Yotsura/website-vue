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

const eventTags = computed(() => allposts.value.map(x=> x.qr));
const IndicateEvents = computed(() => props.allEvents.filter(event =>{
  let result = eventTags.value.find(x=> x == event.id);
  return result;
}));
const allposts = ref([] as Array<PostData>);
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
  <EventTagAreaVue :delmode="false" :allEvents="IndicateEvents" @selectTag="eventClicked"  />
	<div class="row g-2">
    <transition-group name="list">
		  <postPanelVue v-for="post in sortedAllposts" :key="post.date?.toString()" :delmode="isDelMode" :post="post" />
    </transition-group>
	</div>
</template>

<style scoped>

  .list-move,
  .fade-enter-active, .fade-leave-active,
  .list-enter-active, .list-leave-active {
      -webkit-transition: all 0.8s;
      -moz-transition: all 0.8s;
      -ms-transition: all 0.8s;
      -o-transition: all 0.8s;
    transition: all 0.8s;
  }
  .list-enter-from, .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  
  .list-leave-active {
    position: absolute;
  }
  </style>