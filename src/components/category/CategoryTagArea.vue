<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import { CategoryData } from "./Category";
import { useTagStore } from '@/store/modules/category';
import CategoryPanelVue from "./CategoryPanel.vue";
const props = defineProps({
  selectIDs: Array as PropType<string[]>,
});

const displayCategory = computed(() => {
  const allCategory: Array<CategoryData> = useTagStore().getCategoryTagList;
  const filteredList = props.selectIDs?
    allCategory.filter(category => props.selectIDs?.some(x=> x == category.id))
    :allCategory;

  const newList = Array<CategoryData>();
  newList.push(new CategoryData().newAllCategoryTag());
  return newList.concat(filteredList);
})
</script>

<template>
	<div class="row">
    <div class="horizontal-list">
      <transition-group name="list">
        <CategoryPanelVue v-for="category in displayCategory" :key="category.id"
          :category="category" />
      </transition-group>
    </div>
	</div>
</template>

<style>
  .horizontal-list {
    overflow-x: auto;
    white-space: nowrap;
    -webkit-overflow-scrolling: touch;
  }

  .horizontal-list-item {
    display: inline-block;
    user-select: none;
  }
</style>