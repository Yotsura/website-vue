import { defineStore } from 'pinia';
import { CategoryData } from '@/components/category/Category';

interface CategoryTagData {
  categoryTagList: Array<CategoryData>,
  selectedCategoryTag : CategoryData,
}

export const useTagStore = defineStore({
  id: 'category-tags',
  state: () : CategoryTagData => ({
    categoryTagList: [],
    selectedCategoryTag: new CategoryData().newAllCategoryTag(),
  }),
  getters:{
    getCategoryTagList(): Array<CategoryData> {
      return this.categoryTagList;
    },
  },
  actions: {
    setCategoryTagList(categories: Array<CategoryData> ) {
      this.categoryTagList = categories
    },
    setSelectedCategoryTag(category: CategoryData ) {
      this.selectedCategoryTag = category
    },
    getCategory(id:string): CategoryData | undefined {
      return this.categoryTagList.find(e => e.id == id);
    },
    getCategoryName(id:string): string {
      const hit = this.categoryTagList.find(e => e.id == id);
      return hit?.name?? '';
    },
  }
});