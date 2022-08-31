<script lang="ts" setup>
import { ref ,onMounted ,onUpdated ,computed } from 'vue'
import type{ PropType } from 'vue'
import WorkPanel from './WorkPanel.vue';
import WorkModal from './WorkModal.vue';
import { backfaceFixed } from '@/utils/backforceFixed';
import { Work } from './Work';
const props = defineProps({
	delmode: Boolean,
	alldata: {type: Array as PropType<Work[]> , required:true}
});

const allWorks = ref([] as Array<Work>);
const sortedWorks = computed(() => allWorks.value.slice().sort((a: Work, b: Work) => Number(a.id) < Number(b.id) ? 1 : -1 ));

const allLoaded = computed(() => allWorks.value.length > 0 && allWorks.value.every(x => x.img));
function loadData (){
	if(allWorks.value.length == props.alldata.length) return;
	console.log(`■画像表示更新`);
	indicateWorks.value = [];
	allWorks.value = props.alldata;
	indicateWorks.value.splice(0 ,0 ,sortedWorks.value[0]);
}

const indicateWorks = ref([] as Array<Work>);
const allIndicated = computed(() => indicateWorks.value.length > allWorks.value.length);
const addIndicateImg = () => {
	// console.log(`after-enter:${indicateWorks.value.length}：${allIndicated.value?'complete':''}`);
	if(sortedWorks.value.length > indicateWorks.value.length)
		indicateWorks.value.splice(indicateWorks.value.length ,0 ,sortedWorks.value[indicateWorks.value.length]);
}

onUpdated(()=> {
	// console.log("■Work-onupdated");
	loadData();
});
onMounted(() => {
	// console.log("■Work-onMounted");
	loadData();
});

const showContent = ref(false);
const targetImg = ref<Work>();
const ShowModal = (img :Work) => {
	if(props.delmode) return;
	if(!img) return;
	const load = async () => {
		if(!img.img_large){
			await img.loadLargeImg().then(() => {
				console.log('ダウンロード完了');
			});
		}
		targetImg.value = img;
		showContent.value = true;
		document.documentElement.style.overflow = 'hidden'
		backfaceFixed(true);
	}
	load();
}
const HideModal = () => {
	showContent.value = false;
	document.documentElement.style.overflow = 'auto'
	backfaceFixed(false);
}

const ShowModalImg = () => {
	targetImg.value?.showImg();
}
const HideModalImg = () => {
	targetImg.value?.hideImg();
}
</script>

<template>
    <div class="container">
		<div v-if="props.alldata.length > 0">
			<div v-show="allLoaded" class="row g-lg-3 g-md-2 g-1">
				<transition-group name="list" @after-enter="addIndicateImg">
					<WorkPanel
						v-for="work in indicateWorks"
						:key="work.id" :workDat="work"
						:delmode="delmode"
						:style="{ 'transition-delay': `${allIndicated? 0 : 0.3}s` }"
						@imgClicked="ShowModal" />
				</transition-group>
			</div>
			<div v-if="!allLoaded">
				<p class="lead">Now Loading...</p>
			</div>
		</div>
		<div v-else>
			<p class="lead">登録作品なし</p>
		</div>
    </div>
	<transition name="fade" mode="out-in" @after-enter="ShowModalImg">
		<div class="overlay container-fluid" v-if="showContent" @click="HideModalImg">
		<WorkModal @leaved="HideModal" :img="targetImg"/>
		</div>
	</transition>
</template>

<style scoped>
.overlay{
    z-index:1;
    position:fixed;
    top:0;
    left:0;
    width:100%;
    height:100%;
    background-color:rgba(255,255,255,0.7);

    display: flex;
    align-items: center;
    justify-content: center;
}

.fade-enter-active, .fade-leave-active ,
.list-enter-active, .list-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}
.list-enter-from, .list-leave-to  {
  transform: translateY(-10px);
  opacity: 0;
}

.fade-enter-from, .fade-leave-to  {
  opacity: 0;
}
</style>