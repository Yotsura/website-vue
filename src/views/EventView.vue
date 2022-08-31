<script setup lang="ts">
import { computed ,onMounted ,onUpdated } from "vue";
import { useTagStore } from '@/store/modules/events';
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListCtrlVue from "@/components/work/WorkPanelListCtrl.vue";
import PostFormVue from '@/components/post/postForm.vue';

const param = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
const eventInfo = computed(() => useTagStore().getEvent(param));

const works = useWorkStore();
const indicateWorks = computed(() => works.getFilteredWorks);

onMounted(() => {
  works.setEventTag(eventInfo.value);
})
onUpdated(() => {
  works.setEventTag(eventInfo.value);
})

</script>

<template>
  <PostFormVue :paramStr="param" :tagTitle="eventInfo?.name??'イベントの登録がありません。'" />
  <WorkPanelListCtrlVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" />
</template>

<style scoped>

</style>