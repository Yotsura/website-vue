<script setup lang="ts">
import { useRouter } from 'vue-router'
import useLogout from '../utils/useLogout';
import { ref ,watch ,onMounted } from 'vue'
import type { PropType } from 'vue'
import getUser from '@/utils/getUser';
import { Work } from '@/components/work/Work';
import { EventData } from '@/components/event/Events';
import { projectFirestore } from '@/firebase/config';

import WorkCtrlVue from '@/components/work/WorkCtrl.vue';
import EventCtrlVue from '@/components/event/EventCtrl.vue';
import postListVue from '@/components/post/postList.vue';
// import SettingsCtrl from '@/components/SettinsCtrl.vue';

const { error, logout } = useLogout();
const router = useRouter();

const signout = async () => {
  if(confirm("ログアウトしますか？")){
    await logout();
    if (!error.value) {
      console.log('user logged out');
      // router.push({ name: 'login' });
    }
  }
}

const { user } = getUser();
watch(user, () => { if (!user.value) router.push({ name: 'login' }); })

const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const selectedMenu = ref<number>(0);

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
  <h1>Admin Control <button class="float-end btn btn-danger m-2" @click="signout">Sign out</button></h1>
  <div class="col-lg-6 col-12 d-flex flex-row">
    <input type="radio" id="option1" :value="0" v-model="selectedMenu" class="d-none" />
    <label for="option1" class="menulink px-2 pb-2 flex-fill text-nowrap" :isChecked="selectedMenu==0">Messages</label>
    <input type="radio" id="option2" :value="1" v-model="selectedMenu" class="d-none" />
    <label for="option2" class="menulink px-2 pb-2 flex-fill text-nowrap" :isChecked="selectedMenu==1">Works</label>
    <input type="radio" id="option3" :value="2" v-model="selectedMenu" class="d-none" />
    <label for="option3" class="menulink px-2 pb-2 flex-fill text-nowrap" :isChecked="selectedMenu==2">Setings</label>
    <!-- <label class="menulink px-2 pb-2 flex-fill text-nowrap" @click="signout">-Sign out</label> -->
  </div>
  <transition name="fade" mode="out-in">
    <div v-if="selectedMenu==0"><postListVue :allEvents="allEvents" /></div>
    <div v-else-if="selectedMenu==1"><EventCtrlVue :allWorks="allWorks" :allEvents="allEvents" /></div>
    <!-- <div v-else-if="selectedMenu==2"><EventCtrlVue :allWorks="allWorks" /></div> -->
    <!-- <div v-else-if="selectedMenu==3"><SettingsCtrl /></div> -->
    <!-- <div  v-else><postListVue :allEvents="allEvents" /></div> -->
  </transition>
</template>

<style>
[isChecked=true] {
	color: rgba(0, 0, 0, 1) !important;
	font-size: 1.5rem;
}
.menulink{
	user-select: none; /* CSS3 */
    -moz-user-select: none; /* Firefox */
    -webkit-user-select: none; /* Safari、Chromeなど */
	position: relative;
	color: rgba(0, 0, 0, 0.3);
	text-decoration: none;
	font-weight: 500;
	font-size: 1.3rem;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
.menulink::after{
	position: absolute;
	left: 0;
	content: '';
	width: 100%;
	height: 2px;
	background: #000000;
	bottom: 0.5rem;
	transform: scale(0, 1);
	transform-origin: left top;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}


@media (hover: hover) {
    .menulink:hover {
        cursor: pointer;
    }
    .menulink:hover::after {
        transform: scale(1, 1);
        transform-origin: left top; /*左から右に向かう*/
    }
}

@media (hover: none) {
    .menulink:active {
        cursor: pointer;
    }
    .menulink:active::after {
        transform: scale(1, 1);
        transform-origin: left top; /*左から右に向かう*/
    }
}

.fade-enter-active, .fade-leave-active {
    -webkit-transition: opacity 0.3s;
    -moz-transition: opacity 0.3s;
    -ms-transition: opacity 0.3s;
    -o-transition: opacity 0.3s;
	transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to  {
  opacity: 0;
}
</style>