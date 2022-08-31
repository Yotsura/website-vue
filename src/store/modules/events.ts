import { defineStore } from 'pinia';
import { EventData } from '@/components/event/Events';

interface EventTagData {
  eventTagList: Array<EventData>,
  selectedEventTag : EventData
}

export const useTagStore = defineStore({
  id: 'event-tags',
  state: () : EventTagData => ({
    eventTagList: [],
    selectedEventTag: new EventData().newAllEventTag()
  }),
  getters:{
    getEventTagList(): Array<EventData> {
      return this.eventTagList;
    }
  },
  actions: {
    seEventTagList(events: Array<EventData> ) {
      this.eventTagList = events
    },
    setSelectedEventTag(event: EventData ) {
      this.selectedEventTag = event
    },
    getEvent(id:string): EventData | undefined {
      return this.eventTagList.find(e => e.id == id);
    },
    getEventName(id:string): string {
      const hit = this.eventTagList.find(e => e.id == id);
      return hit?.name?? '';
    }
  }
});