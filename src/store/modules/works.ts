import { defineStore } from 'pinia';
import { Work } from '@/components/work/Work';

interface WorkDataList {
  works: Array<Work>
}

export const useWorkStore = defineStore({
  id: 'works',
  state: () : WorkDataList => ({
    works: [],
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works;
    }
  },
  actions: {
    setWorks(works: Array<Work> ) {
      this.works = works
    },
    getWork(id:string): Work | undefined {
      return this.works.find(e => e.id == id);
    },
    loadThumbnails() {
      this.works.forEach(dat => dat.loadImg());
    }
  }
});