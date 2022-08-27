<script lang="ts" setup>
import { ref , computed } from 'vue'
import type{ PropType } from 'vue'
import { Work } from './Work';
const props = defineProps({
    img:  {type: Object as PropType<Work>},
});
const emit = defineEmits(['leaved']);
const delayCnt = ref(0.3);
const ImgClicked = () => {
    delayCnt.value = 0;
}
const AfterLeave = () => {
    delayCnt.value = 0.3;
    emit('leaved');
}
</script>

<template>
    <div class="content" v-if="img">
        <!-- <div class="content-txt lead">{{img.data.caption}}</div> -->
        <transition name="fade" mode="out-in" @after-leave="AfterLeave">
            <img v-show="img.show && img.img_large != ''"
                @click="ImgClicked"
                :src="img.img_large"
                :style="{ 'transition-delay': `${delayCnt}s` }"
                class="img-fluid content-img" alt="work">
        </transition>
    </div>
</template>

<style scoped>
.content{
    z-index:10;
}

.content-img{
    max-height: 90vh;
    max-width: 95vw;
    width: auto;
}

.content-txt{
    color: white;
}

.fade-enter-active, .fade-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
    transition: all 0.3s;
}

.fade-enter-from, .fade-leave-to {
    opacity: 0;
}
</style>