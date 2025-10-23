<script lang="ts" setup>
import { ref, watch } from 'vue'
import type{ PropType } from 'vue'
import type { Work } from './Work';

const props = defineProps({
  img:  {type: Object as PropType<Work>},
  showCap: {type: Boolean , required:true}
});

defineEmits(['imgClicked' , 'imgHidden']);

const imgChangeing = ref(false);
const imageLoaded = ref(false);
const showImage = ref(false);

// 画像の変更を監視して、ロード状態をリセット
watch(() => props.img?.img_large, () => {
  imageLoaded.value = false;
  showImage.value = false;
});

// imgのshowプロパティを監視して、trueになったら画像ロード完了を待つ
watch(() => props.img?.show, (newShow) => {
  if (newShow && props.img?.img_large) {
    // 画像がすでにロード済みの場合はすぐに表示
    if (imageLoaded.value) {
      showImage.value = true;
    }
    // そうでなければ画像ロード完了を待つ（onImageLoadで処理）
  } else {
    showImage.value = false;
  }
});

const onImageLoad = () => {
  imageLoaded.value = true;
  // img.showがtrueの場合のみ表示
  if (props.img?.show) {
    showImage.value = true;
  }
};

const onImageError = () => {
  console.error('画像の読み込みに失敗しました');
  imageLoaded.value = false;
  showImage.value = false;
};
</script>

<template>
  <div class="content" @click="$emit('imgClicked')" v-if="img">
    <transition name="slide" mode="out-in">
      <div v-if="img.data.caption && img.img_large != '' && showCap && !imgChangeing"
        class="content-txt lead m-2 py-1 px-3">{{img.data.caption}}</div>
    </transition>
    <!-- モーダル画像ローディング表示 - 絶対配置で中央固定 -->
    <div v-if="!showImage && img.img_large" class="loading-overlay">
      <div class="spinner-border text-light" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <div class="mt-3 text-light">画像を読み込み中...</div>
    </div>

    <transition name="fade" mode="out-in" @after-enter="imgChangeing = false" @before-leave="imgChangeing = true" @after-leave="$emit('imgHidden')">
      <img v-show="showImage && img.img_large != ''"
        :src="img.img_large" 
        @load="onImageLoad"
        @error="onImageError"
        class="img-fluid content-img" 
        alt="work">
    </transition>
  </div>
</template>

<style scoped>
.content{
  z-index:10;
  cursor: pointer;
  /* transform は position:fixed の基準点を変えるため使用しない */
}
.content-img{
  user-select: none;
  transition-delay: 0.1s;
  max-height: 90vh;
  max-width: 95vw;
  width: auto;
  /* 画像のみに Safari レンダリング最適化を適用 */
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  -webkit-transform: translate3d(0, 0, 0);
  transform: translate3d(0, 0, 0);
}
.loading-overlay{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Safari 用の transform 最適化 */
  -webkit-transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  z-index: 15;
  pointer-events: none;
  /* position:fixed の基準点を維持 */
  will-change: opacity;
}
.content-txt{
  z-index:11;
  background-color: rgba(0, 0, 0, 0.3);
  user-select: none;
  /* transition-delay: 0.5s; */
  color: white;
  position: fixed;
  bottom:1rem;
  left:1rem;
  right: 1rem;
  border-radius: 0.5rem;
  /* position:fixed の基準点を維持 */
  will-change: opacity;
}

.slide-enter-active, .slide-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(50%);
}
</style>