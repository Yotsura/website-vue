<script lang="ts" setup>
import { computed } from 'vue'
import type{ PropType } from 'vue'
import { EventData } from './Events';
import { useTagStore } from '@/store/modules/events';

const props = defineProps({
	delmode: Boolean,
  event: {type: Object as PropType<EventData>, required:true}
});

const events = useTagStore();
const styleTxt = computed(() => {
  const base = "col-auto horizontal-list-item m-1 panel";
  return base
    + ( events.selectedEventTag.id == props.event.id ? " active" : "" )
    + ( props.delmode ? " delmode" : "" ) ;
});
const emit = defineEmits(['eventClicked']);
const eventClicked = () => {
  events.setSelectedEventTag(props.event);
  emit('eventClicked');
}
</script>

<template>
  <div :class="styleTxt">
    <div class="p-1">{{event.name}}</div>
    <div class="panel-veil" @click="eventClicked"></div>
  </div>
</template>

<style scoped>
.panel{
  position: relative;
  user-select: none;
  background-color: rgb(126, 200, 166);
  font-weight: 600;
  color: white;
  border-radius: 0.25rem;
  overflow: hidden;
  text-align: center;
  
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -ms-transition: all 0.2s;
  -o-transition: all 0.2s;
	transition: all 0.2s;
}
.active{
  background-color: rgb(45, 175, 115) !important;
}
.delmode{
  background-color: rgb(255, 30, 30) !important;
}

.panel-veil{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
@media (hover: hover) {
  .panel:hover .panel-veil{
    background-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }
}
</style>