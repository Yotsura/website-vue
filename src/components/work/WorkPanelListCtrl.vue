<script lang="ts" setup>
import { computed } from 'vue'
import type{ PropType } from 'vue'
import WorkPanel from './WorkPanel.vue';
import { Work } from './Work';
const props = defineProps({
	delmode: Boolean,
	alldata: {type: Array as PropType<Work[]> , required:true}
});

const sortedWorks = computed(() => props.alldata.slice().sort((a: Work, b: Work) => Number(a.id) < Number(b.id) ? 1 : -1 ));

const delData = () => {
  if(confirm('表示中の作品を削除しますか？')){
    props.alldata.forEach(dat => dat.delImg());
  }
}
</script>

<template>
  <div v-if="delmode" class="mb-3">
    <button @click="delData" type="button" class="btn btn-danger">DELETE ALL</button>
  </div>
  <div v-else class="mb-3">
    <button type="button" class="btn btn-outline-danger" disabled>DELETE ALL</button>
  </div>
  <div class="row g-lg-3 g-md-2 g-1">
    <transition-group name="list">
      <WorkPanel
        v-for="work in sortedWorks"
        :key="work.id" :workDat="work"
        :delmode="delmode" />
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