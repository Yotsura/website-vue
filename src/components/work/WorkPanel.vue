<script setup lang="ts">
import type { PropType } from '@vue/runtime-core';
import { Work } from './Work';
import { projectFirestore } from '@/firebase/config'
const props = defineProps({
	delmode: Boolean,
    workDat:{type: Object as PropType<Work>, required:true}
});
const emit = defineEmits(['imgClicked']);
	
const openRecord = () => {
    // let temp = props.workDat;
    // temp.data.countUp();
    // projectFirestore.collection("works").doc(temp.id).update(temp.data.getDataObj());
    emit('imgClicked',props.workDat);
}

const delRecord = () => {
    if(props.workDat?.id && confirm('削除しますか？')){
        props.workDat.delImg().then(()=>{
            console.log('workファイル削除完了');
            let id = props.workDat?.id;
            projectFirestore.collection("works").doc(id).delete().then(() =>{
                console.log('storeレコード削除完了');
            });
        });
    }
}
</script>

<template>
    <div class="col-lg-2 col-md-3 col-4">
        <div class="border panel"
             :style="'background: url(\''+props.workDat?.img+'\') center/cover;'">
            <transition name="fade" mode="out-in">
                <div class="btn d-flex m-1 panel-btn text-center" v-if="delmode" @click="delRecord">DELETE</div>
            </transition>
            <div v-if="workDat.data.caption"
                v-text="workDat.data.caption"
                class="d-flex panel-txt m-2 p-1"></div>
            <div class="panel-veil" @click="openRecord"></div>
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
    left: 0;
    right: 0;
    z-index: 5;
	font-weight: 400;
	color: white;
	background-color: transparent;
	border: 1px solid white;
	padding: 0.375rem 0.5rem;
	border-radius: 0.25rem;
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

<style scoped>
.fade-enter-active, .fade-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}

.fade-enter-from, .fade-leave-to  {
  opacity: 0;
}
</style>