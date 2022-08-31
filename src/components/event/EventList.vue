<script lang="ts" setup>
import { ref , computed } from "vue";
import type { PropType } from "vue";
import { Work } from "@/components/work/Work";
import { EventData } from "./Events";
import WorkPanelListCtrlVue from "../work/WorkPanelListCtrl.vue";
import EventTagAreaVue from "./EventTagArea.vue";
const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true},
  allEvents: {type: Array as PropType<EventData[]> , required:true}
});

const indicateWorks = computed(() =>
	props.allWorks.filter(work => selectedEvent.value.id == "" ? true :
		(selectedEvent.value.id == work.data.eventID)));
const selectedEvent = ref(new EventData);
const selectedEventURL = computed(() => {
	const head = window.location.href.split('//')[0]
	const base = window.location.href.split('//')[1].split('/')[0];
	const para = selectedEvent.value.id == "" ? `` : `/?id:${selectedEvent.value.id}`;
	return `${head}//${base}${para}`;
});
const eventClicked = (event:EventData) => {
	if( isDelMode.value){
		if(event.name != "ALL")
			if(confirm(`タグを削除しますか？：${event.name}`))
				event.deleteData();	
	}else{
		selectedEvent.value = event;
	}
}

const isDelMode = ref(false);

const newEvent = new EventData();
newEvent.name = "ALL";
</script>

<template>
  <input class="mb-3" type="checkbox" id="checkbox" v-model="isDelMode" />
  <label for="checkbox">delMode</label>
	<div><a :href="selectedEventURL" target="_blank">AccessLink</a></div>
	<EventTagAreaVue :delmode="isDelMode" :allEvents="allEvents" @selectTag="eventClicked" />
	<WorkPanelListCtrlVue :delmode="isDelMode" :alldata="indicateWorks" />
</template>


<style scoped>
.link--active {
	color: rgba(0, 0, 0, 1) !important;
}
.menulink{
	user-select: none; /* CSS3 */
    -moz-user-select: none; /* Firefox */
    -webkit-user-select: none; /* Safari、Chromeなど */
	position: relative;
	color: rgba(0, 0, 0, 0.3);
	text-decoration: none;
	font-weight: 500;
	font-size: 1.3rem;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
.menulink::after{
	position: absolute;
	left: 0;
	content: '';
	width: 100%;
	height: 2px;
	background: #000000;
	bottom: -1px !important;
	transform: scale(0, 1);
	transform-origin: center top !important;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}

@media (hover: hover) {
	.menulink:hover {
		cursor: pointer;
	}
	.menulink:hover::after {
		transform: scale(0.8, 1);
	}
}

@media (hover: none) {
	.menulink:active {
		cursor: pointer;
	}
	.menulink:active::after {
		transform: scale(0.8, 1);
	}
}
</style>