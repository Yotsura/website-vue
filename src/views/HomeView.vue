<script setup lang="ts">
import NavBarVue from '@/components/NavBar.vue';
import type { PropType } from 'vue'
import { Work } from '@/components/work/Work';
defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});
</script>

<template>
  <NavBarVue />
  <h1>Home</h1>
</template>
