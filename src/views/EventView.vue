<script setup lang="ts">
import { ref , onMounted, computed } from "vue";
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
import { EventData } from '@/components/event/Events';
import { projectFirestore } from '@/firebase/config';
import WorkPanelListVue from "@/components/work/WorkPanelList.vue";
import PostFormVue from '@/components/post/postForm.vue'

const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const param = ref('');
const indicateWorks = computed(() =>
	props.allWorks.filter(work => param.value == "" ?
    true : (param.value == work.data.eventID)));

const eventInfo = ref<EventData>();
onMounted(() => {
  param.value = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
  if(param.value != "")
    projectFirestore.collection("events").onSnapshot(snap => {
      const allEvents = snap.docs.map(doc => new EventData().newEvent(doc));
      const hitevent = allEvents.find(e => e.id == param.value);
      if(hitevent) eventInfo.value = hitevent;
    })
});
</script>

<template>
  <PostFormVue :paramStr="param" :tagTitle="eventInfo?.name??'イベントの登録がありません。'" />
	<WorkPanelListVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" />
</template>

<style scoped>

</style>