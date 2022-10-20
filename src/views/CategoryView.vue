<script setup lang="ts">
import { computed ,onMounted ,onUpdated } from "vue";
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListVue from "@/components/work/WorkPanelList.vue";
import PostFormVue from '@/components/post/postForm.vue';

const param = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
const categoryInfo = computed(() => useTagStore().getCategory(param));

const works = useWorkStore();
const indicateWorks = computed(() => works.getFilteredWorks);

onMounted(() => {
  console.log('onmounted');
  if(categoryInfo.value)
    works.setCategoryTag(categoryInfo.value);
})
onUpdated(() => {
  console.log('onupdated');
  if(categoryInfo.value)
    works.setCategoryTag(categoryInfo.value);
})

</script>

<template>
  <PostFormVue :paramStr="param" :tagTitle="categoryInfo?.name??'カテゴリーの登録がありません。'" />
  <WorkPanelListVue v-if="categoryInfo && indicateWorks" />
</template>

<style scoped>

</style>