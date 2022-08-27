<script lang="ts" setup>
import { ref ,onMounted ,onUpdated ,computed } from 'vue'
import type{ PropType } from 'vue'
import { Work } from '@/components/work/Work';
import { EventData } from './Events';

const props = defineProps({
	delmode: Boolean,
  event: {type: Object as PropType<EventData>, required:true}
});

</script>

<template>
  <div class="container">
    <div class="row">
      <div class="col-3">{{event.id}}</div>
      <div class="col-3">{{event.name}}</div>
      <div class="col-3">CNT：{{event.works?.length ?? 0}}</div>
    </div>
  </div>
</template>

<style scoped>
</style>