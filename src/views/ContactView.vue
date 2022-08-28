<script setup lang="ts">
import NavBarVue from '@/components/NavBar.vue';
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
import PostVue from '@/components/post/postForm.vue'

defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});
</script>

<template>
  <NavBarVue />
  <h1>ContactView</h1>
  <PostVue />
</template>

<style scoped>

</style>