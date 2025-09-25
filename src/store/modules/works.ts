import { defineStore  } from 'pinia';
import type { Work } from '@/components/work/Work';
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
    firstLoaded: false,
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works.filter(x => ! x.delFlg);
    },
    getFilteredWorks(): Array<Work> {
      const modes = useEnabledModesStore();
      return this.getWorks.filter(work =>
        (!modes.editCategoryIsEnabled && this.categoryTag.id != "") ?
          (this.categoryTag.id == work.data.categoryID) : true)
        .slice().sort((a: Work, b: Work) => Number(a.id) < Number(b.id) ? 1 : -1 );
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
    }
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
    setHideAllWorks() {
      this.getWorks.forEach(work => work.hideImg());
    },
    getWork(id:string): Work | undefined {
      return this.getWorks.find(e => e.id == id);
    },
    getNextWork(img:Work | undefined ): Work | undefined {
      if(!img) return undefined;
      let prevImg :Work = img;
      for (const [index, value] of this.getFilteredWorks.entries()) {
        if(value.id == img.id) break;
        prevImg = value;
      }
      return img.id==prevImg.id? undefined : prevImg;
    },
    getPrevWork(img:Work | undefined ): Work | undefined {
      if(!img) return undefined;
      let findFlg = false;
      for (const [index, value] of this.getFilteredWorks.entries()) {
        if(findFlg) return value;
        if(value.id == img.id) findFlg = true;
      }
      return undefined;
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