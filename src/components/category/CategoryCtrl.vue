<script lang="ts" setup>
import { ref } from "vue";
import CategoryUploadVue from "./CategoryUpload.vue";
import CategoryListVue from "./CategoryList.vue";
import WorkUploadVue from "../work/WorkUpload.vue";

const selectedWorkMenu = ref(1);
</script>

<template>
  <div class="col-lg-6 col-12 d-flex flex-row">
    <input type="radio" id="option2-1" :value="1" v-model="selectedWorkMenu" class="d-none"/>
    <label for="option2-1" class="menulink px-2 pb-2 flex-fill text-nowrap"
      :isChecked="selectedWorkMenu == 1" >-WorkList</label>
    <input type="radio" id="option2-2" :value="2" v-model="selectedWorkMenu" class="d-none"/>
    <label for="option2-2" class="menulink px-2 pb-2 flex-fill text-nowrap"
      :isChecked="selectedWorkMenu == 2" >-AddCategory</label>
    <input type="radio" id="option2-3" :value="3" v-model="selectedWorkMenu" class="d-none"/>
    <label for="option2-3" class="menulink px-2 pb-2 flex-fill text-nowrap"
      :isChecked="selectedWorkMenu == 3" >-Upload</label>
  </div>
  <transition name="fade" mode="out-in">
    <div v-if="selectedWorkMenu == 1">
      <CategoryListVue />
    </div>
    <div v-else-if="selectedWorkMenu == 2">
      <CategoryUploadVue />
    </div>
    <div v-else-if="selectedWorkMenu == 3">
      <WorkUploadVue :needCaption="true" :dirName="'works'"/>
    </div>
    <div v-else>
    </div>
  </transition>
</template>

<style scoped>
</style>