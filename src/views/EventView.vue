<script setup lang="ts">
import { computed } from "vue";
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
import { useTagStore } from '@/store/modules/events';
import WorkPanelListVue from "@/components/work/WorkPanelList.vue";
import PostFormVue from '@/components/post/postForm.vue';

const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const param = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
const eventInfo = computed(() => useTagStore().getEvent(param));

const indicateWorks = computed(() =>
	props.allWorks.filter(work => param == "" ?
    true : (param == work.data.eventID)));
</script>

<template>
  <PostFormVue :paramStr="param" :tagTitle="eventInfo?.name??'イベントの登録がありません。'" />
	<WorkPanelListVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" />
</template>

<style scoped>

</style>