import { defineStore } from 'pinia';
import { Work } from '@/components/work/Work';
import { EventData } from '@/components/event/Events'

interface WorkDataList {
  works: Array<Work>,
  eventTag: EventData
}

export const useWorkStore = defineStore({
  id: 'works',
  state: () : WorkDataList => ({
    works: [],
    eventTag: new EventData()
  }),
  getters:{
    getWorks(): Array<Work> {
      return this.works;
    },
    getFilteredWorks(): Array<Work> {
      return this.works.filter(work =>
        this.eventTag.id == "" ? true :
        this.eventTag.id == work.data.eventID);
    },
    getURLParam(): string {
      return this.eventTag.id == "" ? `` : `/?id:${this.eventTag.id}`;
    },
    getEventIDs(): Array<string> {
      return Array.from(new Set( this.works.map(x=> x.data.eventID)) );
    }
  },
  actions: {
    setWorks(works: Array<Work> ) {
      this.works = works;
    },
    setEventTag(event: EventData | undefined ) {
      this.eventTag = event ?? new EventData();
    },
    getWork(id:string): Work | undefined {
      return this.works.find(e => e.id == id);
    },
    loadThumbnails() {
      this.works.forEach(dat => dat.loadImg());
    }
  }
});