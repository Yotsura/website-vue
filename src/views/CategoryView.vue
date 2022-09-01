<script setup lang="ts">
import { computed ,onMounted ,onUpdated } from "vue";
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListCtrlVue from "@/components/work/WorkPanelListCtrl.vue";
import PostFormVue from '@/components/post/postForm.vue';

const param = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
const categoryInfo = computed(() => useTagStore().getCategory(param));

const works = useWorkStore();
const indicateWorks = computed(() => works.getFilteredWorks);

onMounted(() => {
  works.setCategoryTag(categoryInfo.value);
})
onUpdated(() => {
  works.setCategoryTag(categoryInfo.value);
})

</script>

<template>
  <PostFormVue :paramStr="param" :tagTitle="categoryInfo?.name??'イベントの登録がありません。'" />
  <WorkPanelListCtrlVue v-if="indicateWorks" :delmode="false" :alldata="indicateWorks" />
</template>

<style scoped>

</style>