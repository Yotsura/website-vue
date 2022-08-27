<script setup lang="ts">
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';

defineProps({
  param: {type:String ,require:true},
  allWorks: {type: Array as PropType<Work[]> , required:true}
});
</script>

<template>
  <h1>EventView</h1>
  Eventid:{{param}}
</template>

<style scoped>

</style>