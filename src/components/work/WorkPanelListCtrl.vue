<script lang="ts" setup>
import { ref ,onMounted ,onUpdated ,computed } from 'vue'
import type{ PropType } from 'vue'
import WorkPanel from './WorkPanel.vue';
import { Work } from './Work';
const props = defineProps({
	delmode: Boolean,
	alldata: {type: Array as PropType<Work[]> , required:true}
});

const sortedWorks = computed(() => props.alldata.slice().sort((a: Work, b: Work) => Number(a.id) < Number(b.id) ? 1 : -1 ));

const delData = () => {
  if(confirm('全作品を削除しますか？')){
      
    props.alldata.forEach(dat => {
      
      dat.delImg().then(()=>{
        console.log('workファイル削除完了');
        let id = dat.id;
        // projectFirestore.collection("works").doc(id).delete().then(() =>{
        //   console.log('storeレコード削除完了');
        // });
      });
    });
  }
}
</script>

<template>
  <div class="container">
    <div class="row g-lg-3 g-md-2 g-1">
      <transition-group name="list">
        <WorkPanel
          v-for="work in sortedWorks"
          :key="work.id" :workDat="work"
          :delmode="delmode" />
      </transition-group>
    </div>
  </div>
</template>

<style scoped>

.list-move,
.fade-enter-active, .fade-leave-active,
.list-enter-active, .list-leave-active {
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
    -ms-transition: all 0.5s;
    -o-transition: all 0.5s;
	transition: all 0.5s;
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