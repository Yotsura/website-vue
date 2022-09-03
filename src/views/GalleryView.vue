<script setup lang="ts">
import { computed } from 'vue'
import { CategoryData } from '@/components/category/Category';
import { useWorkStore } from '@/store/modules/works';
import WorkPanelListVue from '@/components/work/WorkPanelList.vue';
import NavBarVue from '@/components/NavBar.vue';
import CategoryTagAreaVue from "@/components/category/CategoryTagArea.vue";

const works = useWorkStore()
const allWorks = computed(() => works.getFilteredWorks)
const categoryClicked = (category:CategoryData) => {
  works.setCategoryTag(category);
}
const workTagList = computed(() => works.getCategoryIDs);
</script>

<template>
  <NavBarVue />
	<CategoryTagAreaVue :delmode="false" :selectIDs="workTagList" @selectTag="categoryClicked" />
  <WorkPanelListVue v-if="allWorks" :delmode="false" :adminmode="false" :editCategory="false" />
</template>

<style scoped>

</style>