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
		<EventPanelVue v-for="event in allEvents" :key="event.id"
			:event="event" :delmode="delmode" @eventClicked="eventClicked(event)"/>
	</div>
</template>