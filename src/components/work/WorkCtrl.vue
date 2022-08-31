<script lang="ts" setup>
import { ref } from 'vue'
import type { PropType } from 'vue'
import { projectFirestore } from '@/firebase/config'
import { Work } from '@/components/work/Work';
import WorkUpload from './WorkUpload.vue';
import WorkPanelList from './WorkPanelList.vue';
const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const selectedWorkMenu = ref(0);
const isDelMode = ref(false);

const delData = () => {
  if(confirm('全作品を削除しますか？')){
    props.allWorks.forEach(dat => {
      dat.delImg().then(()=>{
        console.log('workファイル削除完了');
        const id = dat.id;
        projectFirestore.collection("works").doc(id).delete().then(() =>{
          console.log('storeレコード削除完了');
        });
      });
    });
  }
}
</script>

<template>
  <div class="row">
    <div class="col-lg-2 col-6 offset-lg-0  offset-1 d-flex flex-column px-3">
      <input type="radio" id="option2-1" :value="1" v-model="selectedWorkMenu" class="d-none" />
      <label for="option2-1" class="menulink px-2 pb-2 flex-xs-fill text-nowrap" :isChecked="selectedWorkMenu==1">-LIST</label>
      <input type="radio" id="option2-2" :value="2" v-model="selectedWorkMenu" class="d-none" />
      <label for="option2-2" class="menulink px-2 pb-2 flex-xs-fill text-nowrap" :isChecked="selectedWorkMenu==2">-UPLOAD</label>
    </div>
    <div class="col-lg-10">
      <transition name="fade" mode="out-in">
        <div v-if="selectedWorkMenu==1">
          <input class="mb-3" type="checkbox" id="checkbox" v-model="isDelMode">
          <label for="checkbox">delMode</label>
          <div v-if="isDelMode" class="mb-3">
            <button @click="delData" type="button" class="btn btn-danger">DELETE ALL</button>
          </div>
          <div v-else class="mb-3">
            <button type="button" class="btn btn-danger" disabled>DELETE ALL</button>
          </div>
          <WorkPanelList :delmode="isDelMode" :alldata="allWorks"/>
        </div>
        <div v-else-if="selectedWorkMenu==2"><WorkUpload :needCaption="true" :dirName="'works'" /></div>
        <div v-else></div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
</style>