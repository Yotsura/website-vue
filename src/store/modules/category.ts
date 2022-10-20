import { defineStore } from 'pinia';
import { CategoryData } from '@/components/category/Category';

interface CategoryTagData {
  categoryTagList: Array<CategoryData>,
  selectedCategoryTag : CategoryData,
  isDelMode: boolean,
}

export const useTagStore = defineStore({
  id: 'category-tags',
  state: () : CategoryTagData => ({
    categoryTagList: [],
    selectedCategoryTag: new CategoryData().newAllCategoryTag(),
    isDelMode: false,
  }),
  getters:{
    getCategoryTagList(): Array<CategoryData> {
      return this.categoryTagList;
    },
    delModeIsEnabled(): boolean {
      return this.isDelMode;
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
    setDelModeEnabled(isEnabled:boolean) {
      this.isDelMode = isEnabled;
    },
  }
});