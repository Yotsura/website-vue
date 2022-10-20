<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import { Work } from './Work';
import { useWorkStore } from '@/store/modules/works';
import { projectFirestore } from '@/firebase/config'
const props = defineProps({
  workDat:{type: Object as PropType<Work>, required:true}
});
const emit = defineEmits(['imgClicked']);

const works = useWorkStore();
const imgClicked = () => {
  // console.log("■workpanelClicked");
  emit('imgClicked',props.workDat);
}

const editCategory = () => {
  props.workDat.updateCategory( works.getSelectedCategoryID );
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
      <div v-if="workDat.data.caption && !works.editCaptionIsEnabled"
        v-text="workDat.data.caption"
        class="d-flex panel-txt m-2 p-1"></div>
      <transition name="fade" mode="out-in">
        <div v-if="works.editCategoryIsEnabled && !works.delModeIsEnabled && enableCategoryVeil"
          class="p-veil" @click="editCategory" ></div>
        <div v-else-if="works.editCategoryIsEnabled && !works.delModeIsEnabled && !enableCategoryVeil"
          class="p-veil p-veil-category" @click="editCategory" ></div>
        <div v-else-if="works.delModeIsEnabled && !works.editCategoryIsEnabled"
          class="p-veil p-veil-danger d-flex panel-btn" @click="delRecord" >DELETE</div>
        <textarea v-else-if="works.editCaptionIsEnabled" 
          placeholder="キャプション" v-model="workDat.data.caption"
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
  bottom: 0;
  font-weight: 600;
  max-height: 50%;
  color: #333;
  border-radius: 240px 15px 100px 15px / 15px 200px 15px 185px;
  background-color: rgba(255, 255, 255);
  overflow: hidden;
  /* border: 2px solid #333; */
  opacity: 0.7;
}
.panel-btn{
  position: absolute;
  text-align: center;
	font-weight: 400;
    font-size: 3rem;
	color: rgba(255, 255, 255, 0.8);
}
.p-veil{
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