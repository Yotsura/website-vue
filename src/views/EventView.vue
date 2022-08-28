<script setup lang="ts">
import { ref , onMounted, computed, onUpdated } from "vue";
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
import WorkPanelListVue from "@/components/work/WorkPanelList.vue";
import PostFormVue from '@/components/post/postForm.vue'
// import WorkPanelListCtrlVue from "@/components/work/WorkPanelListCtrl.vue";

let props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const param = ref('');
const indicateWorks = computed(() =>
	props.allWorks.filter(work => param.value == "" ?
    true : (param.value == work.data.eventID)));

onMounted(() => {
	// console.log("■Event-onMounted");
  param.value = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
});

onUpdated(() => {
	console.log("■Event-onUpdated");
  console.log(indicateWorks.value );
})
</script>

<template>
  <h2>Eventid:{{param}}</h2>
  <PostFormVue />
	<WorkPanelListVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" />
	<!-- <WorkPanelListCtrlVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" /> -->
</template>

<style scoped>

</style>