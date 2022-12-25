<script lang="ts" setup>
import type{ PropType } from 'vue'
import { Work } from './Work';
defineProps({
  img:  {type: Object as PropType<Work>},
});
</script>

<template>
  <div class="content" v-if="img">
    <transition name="fade" mode="out-in">
      <div v-show="img.show && img.img_large != ''">
        <div v-if="img.data.caption" class="content-txt lead m-2 py-1 px-3">{{img.data.caption}}</div>
        <img :src="img.img_large" class="img-fluid content-img" alt="work">
      </div>
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
  background-color: rgba(0, 0, 0, 0.3);
  user-select: none;
  transition-delay: 0.1s;
  color: white;
  position: fixed;
  bottom:1rem;
  left:1rem;
  right: 1rem;
  border-radius: 0.5rem;
}
</style>