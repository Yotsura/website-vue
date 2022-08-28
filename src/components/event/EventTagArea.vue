<script lang="ts" setup>
import type { PropType } from "vue";
import { EventData } from "./Events";
import EventPanelVue from "./EventPanel.vue";
const props = defineProps({
	delmode: Boolean,
  allEvents: {type: Array as PropType<EventData[]> , required:true}
});
const emit = defineEmits(['selectTag','delTag']);

const newEvent = new EventData();
newEvent.name = "ALL";

const eventClicked = (event:EventData) => {
	emit('selectTag', event);
}
</script>

<template>
	<div class="row m-0">
		<EventPanelVue :event="newEvent" @eventClicked="eventClicked(newEvent)" />
    <transition-group name="list">
			<EventPanelVue v-for="event in allEvents" :key="event.id"
				:event="event" :delmode="delmode" @eventClicked="eventClicked(event)"/>
		</transition-group>
	</div>
</template>

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