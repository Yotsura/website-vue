<script lang="ts" setup>
import { ref } from 'vue'
import type{ PropType } from 'vue'
import { Work } from './Work';
defineProps({
  img:  {type: Object as PropType<Work>},
  showUI: {type: Boolean , required:true}
});
defineEmits(['imgClicked']);
const imgChangeing = ref(false);
</script>

<template>
  <div class="content" @click="$emit('imgClicked')" v-if="img">
    <transition name="fade" mode="out-in">
      <div v-if="img.data.caption && img.img_large != '' && showUI && !imgChangeing"
        class="content-txt lead m-2 py-1 px-3">{{img.data.caption}}</div>
    </transition>
    <transition name="fade" mode="out-in" @after-enter="imgChangeing = false" @before-leave="imgChangeing = true">
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
</style>