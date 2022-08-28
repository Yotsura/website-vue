<script lang="ts" setup>
import { ref ,onMounted ,onUpdated ,computed } from 'vue'
import type{ PropType } from 'vue'
import { Work } from '@/components/work/Work';
import { EventData } from './Events';

const props = defineProps({
	delmode: Boolean,
  event: {type: Object as PropType<EventData>, required:true}
});

const styleTxt = computed(() => `col-auto horizontal-list-item m-1 panel ${props.delmode?"delmode":""}`);

const emit = defineEmits(['eventClicked']);
const eventClicked = () => {
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
  background-color: rgb(255, 150, 150);
  font-weight: 600;
  color: white;
  border-radius: 240px 15px 100px 15px / 15px 200px 15px 185px;
  overflow: hidden;
  text-align: center;
  
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -ms-transition: all 0.2s;
  -o-transition: all 0.2s;
	transition: all 0.2s;
}
.delmode{
  background-color: rgb(255, 30, 30);
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
        background-color: rgba(255, 255, 255, 0.8);
        cursor: pointer;
    }
    .panel-btn:hover{
        background-color:  rgba(255, 0, 0, 0.8);
    }
}
</style>