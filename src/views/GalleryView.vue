<script setup lang="ts">
import { computed } from 'vue'
import { EventData } from '@/components/event/Events';
import { useWorkStore } from '@/store/modules/works';
import WorkPanelListCtrlVue from '@/components/work/WorkPanelListCtrl.vue';
import NavBarVue from '@/components/NavBar.vue';
import EventTagAreaVue from "@/components/event/EventTagArea.vue";

const works = useWorkStore()
const allWorks = computed(() => works.getFilteredWorks)
const eventClicked = (event:EventData) => {
  works.setEventTag(event);
}
const workTagList = computed(() => works.getEventIDs);
</script>

<template>
  <NavBarVue />
	<EventTagAreaVue :delmode="false" :selectIDs="workTagList" @selectTag="eventClicked" />
  <WorkPanelListCtrlVue v-if="allWorks" :delmode="false" :alldata="allWorks" />
</template>

<style scoped>

</style>