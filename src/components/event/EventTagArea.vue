<script lang="ts" setup>
import { computed } from "vue";
import type { PropType } from "vue";
import { EventData } from "./Events";
import { useTagStore } from '@/store/modules/events';
import EventPanelVue from "./EventPanel.vue";
const props = defineProps({
	delmode: Boolean,
  selectIDs: Array as PropType<string[]>,
});

const displayEvents = computed(() => {
  const allEvents: Array<EventData> = useTagStore().getEventTagList;
  const filteredList = props.selectIDs?
    allEvents.filter(event => props.selectIDs?.some(x=> x == event.id))
    :allEvents

  const newEvent = new EventData();
  newEvent.name = "ALL";
  const newList = Array<EventData>();
  newList.push(newEvent);
  return newList.concat(filteredList);
})
</script>

<template>
	<div class="row">
    <div class="horizontal-list">
      <transition-group name="list">
        <EventPanelVue v-for="event in displayEvents" :key="event.id"
          :event="event" :delmode="delmode" @eventClicked="$emit('selectTag', event)"/>
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

<style scoped>
.list-move,
.fade-enter-active, .fade-leave-active,
.list-enter-active, .list-leave-active {
    -webkit-transition: all 0.8s;
    -moz-transition: all 0.8s;
    -ms-transition: all 0.8s;
    -o-transition: all 0.8s;
	transition: all 0.8s;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.list-item {
  display: inline-block;
  margin-right: 10px;
}

.list-leave-active {
  position: absolute;
}
</style>