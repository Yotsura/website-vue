import { defineStore  } from 'pinia';
import { Work } from '@/components/work/Work';
import { CategoryData } from '@/components/category/Category';
import { useEnabledModesStore } from './mode';

interface WorkDataList {
  works: Array<Work>,
  categoryTag: CategoryData,
  firstLoaded: boolean
}

export const useWorkStore = defineStore({
  id: 'works',
  state: () : WorkDataList => ({
    works: [],
    categoryTag: new CategoryData(),
    firstLoaded: false
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works.filter(x => ! x.delFlg);
    },
    getFilteredWorks(): Array<Work> {
      const modes = useEnabledModesStore();
      return this.getWorks.filter(work =>
        (!modes.editCategoryIsEnabled && this.categoryTag.id != "") ?
          (this.categoryTag.id == work.data.categoryID)
          : true);
    },
    getURLParam(): string {
      return this.categoryTag.id == "" ? `` : `/?id:${this.categoryTag.id}`;
    },
    getCategoryIDs(): Array<string> {
      return Array.from(new Set( this.getWorks.map(x=> x.data.categoryID)) );
    },
    getSelectedCategoryID(): string {
      return this.categoryTag.id;
    },
    isFirstLoaded(): boolean{
      return this.firstLoaded;
    },
  },
  actions: {
    setWorks(newworks: Array<Work> ) {
      this.works.forEach(work => {
        const newObj = newworks.find(x => x.id == work.id);
        if ( !newObj ) {
          //作品削除でフラグオン
          work.delFlg = true;
        } else{
          if ( newObj.data.categoryID != work.data.categoryID )
            work.data.categoryID = newObj.data.categoryID??'';
          if ( newObj.data.caption != work.data.caption )
            work.data.caption = newObj.data.caption??'';
        }
      });

      newworks.filter(work => this.getWorks.every(x => x.id != work.id)).forEach(work => {
        this.works.push(work)
      });
    },
    setCategoryTag(category: CategoryData | undefined ) {
      this.categoryTag = category ?? new CategoryData();
    },
    getWork(id:string): Work | undefined {
      return this.getWorks.find(e => e.id == id);
    },
    loadThumbnails() {
      this.getWorks.forEach(dat => dat.loadImg());
    },
    completeFirstLoad() {
      if ( this.firstLoaded ) return;
      this.firstLoaded = true;
      console.log("firstloaded");
    },
  }
});