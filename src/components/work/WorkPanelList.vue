<script lang="ts" setup>
import { ref, computed , onMounted } from 'vue'
import WorkPanel from './WorkPanel.vue';
import WorkModal from './WorkModal.vue';
import { Work } from './Work';
import { backfaceFixed } from '@/utils/backforceFixed';
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from "@/store/modules/works";
import { useEnabledModesStore } from '@/store/modules/mode';

const props = defineProps({
  adminmode: Boolean,
  showButton: Boolean
});

const mounted = ref(false);
onMounted(() =>{
  // console.log("■onMounted:workPanelList");
  mounted.value = true;
});

const mode = useEnabledModesStore();
const works = useWorkStore();
const alldata = computed(() => works.getFilteredWorks);
//mount時にアニメーションさせたいのでそこで切り替え
const sortedWorks = computed(() => !mounted.value ? new Array<Work>() : (alldata.value));
const delData = () => {
  if(confirm(`【${useTagStore().selectedCategoryTag?.name??""}】表示中の作品を削除しますか？`)){
    alldata.value.forEach(dat => dat.delImg());
  }
}

const disableModal = computed(() =>
  props.adminmode ||
  mode.deleteModeIsEnabled ||
  mode.editCategoryIsEnabled ||
  mode.editCaptionIsEnabled
)

const loadImg = async (img:Work) => {
  if(!img.img_large) await img.loadLargeImg();
  targetImg.value = new Work(img);
}
const showContent = ref(false);
const targetImg = ref<Work>();
const prevImg = computed(()=>{
  const temp = works.getPrevWork(targetImg.value);
  return temp;
});
const nextImg = computed(()=>{
  const temp = works.getNextWork(targetImg.value);
  return temp;
});

const showUI = ref(true);
const changeShowUI = () => showUI.value = !showUI.value;

const ShowModal = (img :Work) => {
  if(disableModal.value) return;
	if(!img) return;
  showUI.value = true;
  // console.log("■showModal："+img?.img_large);
	loadImg(img).then(()=>{
    // console.log('画像をモーダルに設定完了');
    showContent.value = true;
    backfaceFixed(true);
  });
}
const HideModal = () => {
  // console.log("■hideModal");
  works.setHideAllWorks();
	showContent.value = false;
	backfaceFixed(false);
}

const ShowModalImg = () => {
  // console.log("■showModalImg");
	targetImg.value?.showImg();
}

const afterFirstLoad = () => {
  // console.log ("afterAnimate");
  works.completeFirstLoad();
}

const hidemode = ref(0);
const showCap = computed(() => showUI.value && hidemode.value == 0)
const PrevImg = async() =>{
  hidemode.value = 1;
  targetImg.value?.hideImg();
}
const NextImg = () =>{
  hidemode.value = 2;
  targetImg.value?.hideImg();
}
const ChangeImg = () =>{
  if(hidemode.value == 0) return;
  targetImg.value?.DisposeLargeImg();
  if(hidemode.value == 2 && nextImg.value){
    loadImg(nextImg.value).then(() => targetImg.value?.showImg());
  } else if(hidemode.value == 1 && prevImg.value){
    loadImg(prevImg.value).then(() => targetImg.value?.showImg());
  }
  hidemode.value = 0;
}
</script>

<template>
  <div v-if="showButton">
    <div v-if="mode.deleteModeIsEnabled && !mode.editCategoryIsEnabled" class="mb-3">
      <button @click="delData" type="button" class="btn btn-danger">DELETE ALL</button>
    </div>
    <div v-else class="mb-3">
      <button type="button" class="btn btn-outline-danger" disabled>DELETE ALL</button>
    </div>
  </div>
  <div class="row g-lg-3 g-md-2 g-1">
    <transition-group name="list" @after-enter="afterFirstLoad">
      <WorkPanel
        v-for="( work , index ) in sortedWorks"
        :key="work.id" :workDat="work"
        :style="{ 'transition-delay': `${works.isFirstLoaded? 0 : (0.5 + index * 0.3)}s` }"
        @imgClicked="ShowModal" />
    </transition-group>
  </div>
	<transition name="fade" mode="out-in" @after-enter="ShowModalImg">
		<div class="container-fluid overlay" v-if="showContent">
      <transition name="fade" mode="out-in">
        <div class="UIarea" v-if="showUI">
          <div style="position:absolute;" >
            <a href="#" class="cross_btn" @click="HideModal"></a>
            <a href="#" class="btnbase arrow_left" v-if="nextImg" @click="NextImg"></a>
            <a href="#" class="btnbase arrow_right" v-if="prevImg" @click="PrevImg"></a>
          </div>
        </div>
      </transition>
      <WorkModal style="position:relative;"
        :img="targetImg" :showCap="showCap" @imgClicked="changeShowUI" @imgHidden="ChangeImg"/>
      <div class="clickArea" @click="HideModal"></div>
		</div>
	</transition>
</template>

<style scoped>
.overlay{
  z-index:1;
  position:fixed;
  top:0;
  left:0;
  width:100vw;
  height:100%;
  background-color:rgba(0,0,0,0.7);

  display: flex;
  align-items: center;
  justify-content: center;
}
.clickArea{
  z-index:2;
  position:fixed;
  width:100vw;
  height:100%;
}

a{
  opacity: 0.9;
}

.UIarea{
  z-index: 20;
}
.btnbase{
  position: relative;
  vertical-align: middle;
  text-decoration: none;
  font-size: 15px;
}
.btnbase::before,
.btnbase::after{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  margin: auto;
  content: "";
  vertical-align: middle;
}
.btnbase::before{
  box-sizing: border-box;
  width: 50px;
  height: 50px;
  border: 2px solid white;
  -webkit-border-radius: 25%;
  border-radius: 25%;
  background-color: rgba(0, 0, 0, 0.1);
  
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
@media (hover: hover) {
  .btnbase:hover::before{
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0.5;
  }
}
.arrow_right{
  position:fixed;
  top:50%;
  right: calc(1rem + 50px);
}
.arrow_left{
  position:fixed;
  top:50%;
  left: 1rem;
}
.arrow_right::after{
    left: 14px;
    width: 15px;
    height: 15px;
    border-top: 3px solid white;
    border-right: 3px solid white;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}
.arrow_left::after{
    left: 20px;
    width: 15px;
    height: 15px;
    border-bottom: 3px solid white;
    border-left: 3px solid white;
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
}

.cross_btn {
  position:fixed;
  top: 1rem;
  right: 1rem;
  
  width: 30px;
  height: 30px;
  border: 2px solid white;
  border-radius: 25%;
  background-color: rgba(0, 0, 0, 0.1);
  
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
.cross_btn::before, .cross_btn::after{
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 3px;
  height: 27px;
  background: white;
}
.cross_btn::before {
  transform: translate(-50%,-50%) rotate(45deg);
}
 
.cross_btn::after {
  transform: translate(-50%,-50%) rotate(-45deg);
}
@media (hover: hover) {
  .cross_btn:hover{
    background-color: rgba(0, 0, 0, 0.3);
    opacity: 0.5;
  }
}
</style>