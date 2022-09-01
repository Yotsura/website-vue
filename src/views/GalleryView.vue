<script setup lang="ts">
import { computed } from 'vue'
import { CategoryData } from '@/components/category/Category';
import { useWorkStore } from '@/store/modules/works';
import WorkPanelListCtrlVue from '@/components/work/WorkPanelListCtrl.vue';
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
  <WorkPanelListCtrlVue v-if="allWorks" :delmode="false" :alldata="allWorks" />
</template>

<style scoped>

</style>