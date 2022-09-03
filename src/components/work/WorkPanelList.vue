<script lang="ts" setup>
import { ref, computed } from 'vue'
// import type{ PropType } from 'vue'
import WorkPanel from './WorkPanel.vue';
import WorkModal from './WorkModal.vue';
import { Work } from './Work';
import { backfaceFixed } from '@/utils/backforceFixed';
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from "@/store/modules/works";
const props = defineProps({
  adminmode: Boolean,
	delmode: Boolean,
	editCategory: Boolean,
  showButton: Boolean
});

const alldata = computed(() => useWorkStore().getFilteredWorks);
const sortedWorks = computed(() => alldata.value.slice().sort((a: Work, b: Work) => Number(a.id) < Number(b.id) ? 1 : -1 ));
const delData = () => {
  if(confirm(`【${useTagStore().selectedCategoryTag?.name??""}】表示中の作品を削除しますか？`)){
    alldata.value.forEach(dat => dat.delImg());
  }
}

const disableModal = computed(() => props.adminmode || props.delmode || props.editCategory)

const showContent = ref(false);
const targetImg = ref<Work>();
const ShowModal = (img :Work) => {
  if(disableModal.value) return;
	if(!img) return;
  console.log("■showModal："+img.img_large);
	const load = async () => {
		if(!img.img_large){
			await img.loadLargeImg().then(() => {
				console.log('ダウンロード完了');
			});
		}
		targetImg.value = img;
		showContent.value = true;
		backfaceFixed(true);
	}
	load();
}
const HideModal = () => {
  console.log("■hideModal");
	showContent.value = false;
	backfaceFixed(false);
}

const ShowModalImg = () => {
  console.log("■showModalImg");
	targetImg.value?.showImg();
}
const HideModalImg = () => {
  console.log("■hideModalImg");
	targetImg.value?.hideImg();
}
</script>

<template>
  <div v-if="showButton">
    <div v-if="delmode && !useWorkStore().getEditCategory" class="mb-3">
      <button @click="delData" type="button" class="btn btn-danger">DELETE ALL</button>
    </div>
    <div v-else class="mb-3">
      <button type="button" class="btn btn-outline-danger" disabled>DELETE ALL</button>
    </div>
  </div>
  <div class="row g-lg-3 g-md-2 g-1">
    <transition-group name="list">
      <WorkPanel
        v-for="work in sortedWorks"
        :key="work.id" :workDat="work"
        :delmode="delmode" 
        @imgClicked="ShowModal" />
    </transition-group>
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
</style>