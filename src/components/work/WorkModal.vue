<script lang="ts" setup>
import { ref } from 'vue'
import type{ PropType } from 'vue'
import { Work } from './Work';
defineProps({
  img:  {type: Object as PropType<Work>},
  showCap: {type: Boolean , required:true}
});
defineEmits(['imgClicked' , 'imgHidden']);
const imgChangeing = ref(false);
</script>

<template>
  <div class="content" @click="$emit('imgClicked')" v-if="img">
    <transition name="slide" mode="out-in">
      <div v-if="img.data.caption && img.img_large != '' && showCap && !imgChangeing"
        class="content-txt lead m-2 py-1 px-3">{{img.data.caption}}</div>
    </transition>
    <transition name="fade" mode="out-in" @after-enter="imgChangeing = false" @before-leave="imgChangeing = true" @after-leave="$emit('imgHidden')">
      <img v-show="img.show && img.img_large != ''"
        :src="img.img_large" class="img-fluid content-img" alt="work">
    </transition>
  </div>
</template>

<style scoped>
.content{
  z-index:10;
}
.content-img{
  user-select: none;
  transition-delay: 0.1s;
  max-height: 90vh;
  max-width: 95vw;
  width: auto;
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