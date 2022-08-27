<script lang="ts" setup>
import { ref } from "vue";
import type { PropType } from "vue";
import { projectFirestore } from "@/firebase/config";
import { Work } from "@/components/work/Work";
import { EventData } from "./Events";
import EventUploadVue from "./EventUpload.vue";
import EventListVue from "./EventList.vue";
// const props = defineProps({
//   allEvents: { type: Array as PropType<EventData[]>, required: true },
// });
const props = defineProps({
  allWorks: {type: Array as PropType<Work[]> , required:true}
});

const selectedWorkMenu = ref(0);
</script>

<template>
  <div class="row">
    <div class="col-lg-2 col-6 offset-lg-0 offset-1 d-flex flex-column px-3">
      <input type="radio" id="option2-1" :value="1" v-model="selectedWorkMenu" class="d-none"/>
      <label for="option2-1" class="menulink px-2 pb-2 flex-xs-fill text-nowrap"
        :isChecked="selectedWorkMenu == 1" >-LIST</label>
      <input type="radio" id="option2-2" :value="2" v-model="selectedWorkMenu" class="d-none"/>
      <label for="option2-2" class="menulink px-2 pb-2 flex-xs-fill text-nowrap"
        :isChecked="selectedWorkMenu == 2" >-CREATE</label>
    </div>
    <div class="col-lg-10">
      <transition name="fade" mode="out-in">
        <div v-if="selectedWorkMenu == 1">
          <EventListVue :allWorks="allWorks" />
        </div>
        <div v-else-if="selectedWorkMenu == 2">
          <EventUploadVue />
        </div>
        <div v-else></div>
      </transition>
    </div>
  </div>
</template>

<style scoped>
</style>