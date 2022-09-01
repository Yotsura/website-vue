import { defineStore } from 'pinia';
import { Work } from '@/components/work/Work';
import { CategoryData } from '@/components/category/Category'

interface WorkDataList {
  works: Array<Work>,
  categoryTag: CategoryData
}

export const useWorkStore = defineStore({
  id: 'works',
  state: () : WorkDataList => ({
    works: [],
    categoryTag: new CategoryData()
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works;
    },
    getFilteredWorks(): Array<Work> {
      return this.works.filter(work =>
        this.categoryTag.id == "" ? true :
        this.categoryTag.id == work.data.categoryID);
    },
    getURLParam(): string {
      return this.categoryTag.id == "" ? `` : `/?id:${this.categoryTag.id}`;
    },
    getCategoryIDs(): Array<string> {
      return Array.from(new Set( this.works.map(x=> x.data.categoryID)) );
    }
  },
  actions: {
    setWorks(works: Array<Work> ) {
      this.works = works;
    },
    setCategoryTag(category: CategoryData | undefined ) {
      this.categoryTag = category ?? new CategoryData();
    },
    getWork(id:string): Work | undefined {
      return this.works.find(e => e.id == id);
    },
    loadThumbnails() {
      this.works.forEach(dat => dat.loadImg());
    }
  }
});