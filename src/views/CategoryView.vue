<script setup lang="ts">
import { computed ,onMounted ,onUpdated } from "vue";
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListVue from "@/components/work/WorkPanelList.vue";
import PostFormVue from '@/components/post/postForm.vue';
import LinkBarVue from "@/components/LinkBar.vue";

const param = window.location.href.includes('?id:') ? window.location.href.split('?id:')[1] : "";
const categoryInfo = computed(() => useTagStore().getCategory(param));

const works = useWorkStore();
const indicateWorks = computed(() => works.getFilteredWorks);

onMounted(() => {
  if(categoryInfo.value)
    works.setCategoryTag(categoryInfo.value);
})
onUpdated(() => {
  if(categoryInfo.value)
    works.setCategoryTag(categoryInfo.value);
})

</script>

<template>
  <LinkBarVue />
  <PostFormVue :paramStr="param"/>
  <WorkPanelListVue v-if="categoryInfo && indicateWorks" />
</template>

<style scoped>

</style>