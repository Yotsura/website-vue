import { defineStore } from 'pinia';
import { Work } from '@/components/work/Work';
import { CategoryData } from '@/components/category/Category'

interface WorkDataList {
  works: Array<Work>,
  categoryTag: CategoryData,
  editCategory: boolean
}

export const useWorkStore = defineStore({
  id: 'works',
  state: () : WorkDataList => ({
    works: [],
    categoryTag: new CategoryData(),
    editCategory: false
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works.filter(x => ! x.delFlg);
    },
    getFilteredWorks(): Array<Work> {
      return this.getWorks.filter(work =>
        (!this.editCategory && this.categoryTag.id != "") ?
          (this.categoryTag.id == work.data.categoryID)
          : true);
    },
    getURLParam(): string {
      return this.categoryTag.id == "" ? `` : `/?id:${this.categoryTag.id}`;
    },
    getCategoryIDs(): Array<string> {
      return Array.from(new Set( this.getWorks.map(x=> x.data.categoryID)) );
    },
    getEditCategory(): boolean {
      return this.editCategory;
    },
    getSelectedCategoryID(): string {
      return this.categoryTag.id;
    }
  },
  actions: {
    setWorks(works: Array<Work> ) {
      if (works.length < this.works.length){
        console.log("works削除されたよ");
        // this.works = works;
        return;
      }
      this.works.forEach(work => {
        const newObj = works.find(x => x.id == work.id);
        if( newObj?.data.categoryID != work.data.categoryID ){
          //category変更を反映する
          console.log("category変更:" + newObj?.id);
          work.data.categoryID = newObj?.data.categoryID??'';
        } else if ( !newObj) {
          //作品削除でフラグオン？
          work.delFlg = true;
        }
      });

      works.filter(work => this.getWorks.every(x => x.id != work.id)).forEach(work => {
        console.log("works追加:" + work.id);
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
    enableEditCategory() {
      this.editCategory = true;
    },
    disableEditCategory() {
      this.editCategory = false;
    }
  }
});