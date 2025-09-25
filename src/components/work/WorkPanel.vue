<script setup lang="ts">
import { ref, computed } from 'vue';
import type { PropType } from 'vue';
import type { Work, WorkData } from './Work';
import { useWorkStore } from '@/store/modules/works';
import { useEnabledModesStore } from '@/store/modules/mode';
import { projectFirestore } from '@/firebase/config';
const props = defineProps({
  workDat:{type: Object as PropType<Work>, required:true}
});
const emit = defineEmits(['imgClicked']);

const modes = useEnabledModesStore();
const works = useWorkStore();
const imgClicked = () => {
  emit('imgClicked',props.workDat);
}

const editCategory = () => {
  props.workDat.updateCategory( works.getSelectedCategoryID );
}

const workCaption = ref(props.workDat.data.caption);
const UpdWorkCaption = () => {
  if ( props.workDat.data.caption != workCaption.value )
    props.workDat.updateCaption(workCaption.value);
}

const enableCategoryVeil = computed (() => works.getSelectedCategoryID == props.workDat.data.categoryID )

const delRecord = () => {
  if(props.workDat?.id && confirm('削除しますか？')){
    props.workDat.delImg().then(()=>{
      console.log('workファイル削除完了');
      const id = props.workDat?.id;
      projectFirestore.collection("works").doc(id).delete().then(() =>{
        console.log('storeレコード削除完了');
      });
    });
  }
}
</script>

<template>
  <div class="col-md-2 col-3">
    <div class="border panel" :style="'background: url(\''+props.workDat?.img+'\') center/cover;'">
      <div v-if="workDat.data.caption && !modes.editCaptionIsEnabled"
        v-text="workDat.data.caption"
        class="d-flex panel-txt"></div>
      <transition name="fade" mode="out-in">
        <div v-if="modes.editCategoryIsEnabled && !modes.deleteModeIsEnabled && enableCategoryVeil"
          class="p-veil" @click="editCategory" ></div>
        <div v-else-if="modes.editCategoryIsEnabled && !modes.deleteModeIsEnabled && !enableCategoryVeil"
          class="p-veil p-veil-category" @click="editCategory" ></div>
        <div v-else-if="modes.deleteModeIsEnabled && !modes.editCategoryIsEnabled"
          class="p-veil p-veil-danger d-flex panel-btn" @click="delRecord" >DELETE</div>
        <textarea v-else-if="modes.editCaptionIsEnabled" 
          placeholder="キャプション" v-model="workCaption"
          @blur="UpdWorkCaption"
          style="background-color:rgba(255, 255, 255, 0.7); height: 100%;"
          class="form-control mb-2" type="text"></textarea>
        <div v-else class="p-veil" @click="imgClicked"></div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
img {
  cursor: pointer;
}

@media screen and (min-width: 576px) {
    /* sm */
  .panel {
    height:15rem;
  }
}
@media screen and (min-width: 768px) {
    /* md */
  .panel {
    height:17rem;
  }
}
@media screen and (min-width: 992px) {
    /* lg */
  .panel {
    height:17rem;
  }
}
@media screen and (min-width: 1200px) {
    /* lg */
  .panel {
    height:20rem;
  }
}
.panel{
  position: relative;
  height:13rem;
  user-select: none;
  border-radius: 0.5rem;
  background-color: white;
}
.panel-txt{
  position: absolute;
  bottom: 0.1rem;
  margin: 0.2rem;
  padding: 0.2rem;
  font-weight: 600;
  font-size: 0.7rem;
  max-height: 27%;
  color: #333;
  border-radius: 240px 15px 100px 15px / 15px 200px 15px 185px;
  background-color: rgba(255, 255, 255);
  overflow: hidden;
  /* border: 2px solid #333; */
  opacity: 0.6;
}
.panel-btn{
  position: absolute;
  text-align: center;
	font-weight: 400;
    font-size: 3rem;
	color: rgba(255, 255, 255, 0.8);
}
.p-veil{
  cursor: pointer;
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

.p-veil-category{
  background-color: rgba(0, 0, 0, 0.6) !important;
}
.p-veil-danger{
  background-color: rgba(175, 45, 45, 0.4) !important;
}

@media (hover: hover) {
  .panel:hover .p-veil{
    background-color: rgba(255, 255, 255, 0.5);
  }
  .panel:hover .p-veil-category{
    background-color: rgba(0, 0, 0, 0.4) !important;
  }
  .panel:hover .p-veil-danger{
    background-color: rgba(175, 45, 45, 0.8) !important;
  }
  .panel-btn:hover{
    background-color:  rgba(255, 0, 0, 0.8);
  }
}
</style>