<script setup lang="ts">
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
import WorkPanelList from '@/components/work/WorkPanelList.vue'
import NavBarVue from '@/components/NavBar.vue';

defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});
</script>

<template>
  <NavBarVue />
  <h1>GalleryView</h1>
  <WorkPanelList v-if="allWorks" :delmode="false" :alldata="allWorks" />
</template>

<style scoped>

</style>