<script setup lang="ts">
import { ref ,onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { projectFirestore } from '@/firebase/config'
import { Work } from '@/components/work/Work';
import { EventData } from '@/components/event/Events';
import { useTagStore } from '@/store/modules/events';
import { useWorkStore } from '@/store/modules/works';
import EventViewVue from './views/EventView.vue';

const param = window.location.href.includes('/?id:')? (`/?id:` + window.location.href.split('/?id:')[1]) : "";

const events = useTagStore();
const works = useWorkStore();
onMounted(() => {
	const error :any = ref(null);
	const load = async () => {
		try {
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
				works.setWorks(snap.docs.map(doc => new Work(doc)));
				works.loadThumbnails();
				
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
			<EventViewVue v-if="param" />
      <RouterView v-else />
			<!-- <transition v-else name="fade" mode="out-in">
        <RouterView />
			</transition> -->
    </div>
  </div>
</template>

<style>
  .list-move, .list-enter-active, .list-leave-active {
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

.fade-enter-active, .fade-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}

.fade-enter-from, .fade-leave-to  {
  opacity: 0;
}
</style>
