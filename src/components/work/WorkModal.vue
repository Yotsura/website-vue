<script lang="ts" setup>
import type{ PropType } from 'vue'
import { Work } from './Work';
defineProps({
    img:  {type: Object as PropType<Work>},
});
</script>

<template>
    <div class="content" v-if="img">
        <div class="content-txt lead">{{img.data.caption}}</div>
        <transition name="fade" mode="out-in">
            <img v-show="img.show && img.img_large != ''"
                :src="img.img_large"
                class="img-fluid content-img" alt="work">
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
    color: white;
    position: fixed;
    top:5vh;
    left:1rem;
}
</style>