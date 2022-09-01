<script lang="ts" setup>
import { computed } from 'vue'
import type{ PropType } from 'vue'
import { CategoryData } from './Category';
import { useTagStore } from '@/store/modules/category';

const props = defineProps({
	delmode: Boolean,
  category: {type: Object as PropType<CategoryData>, required:true}
});

const categories = useTagStore();
const classTxt = computed(() => {
  const base = "col-auto horizontal-list-item m-1 panel";
  return base
    + ( categories.selectedCategoryTag.id == props.category.id ? " active" : "" )
    + ( props.delmode ? " delmode" : "" ) ;
});
const emit = defineEmits(['categoryClicked']);
const categoryClicked = () => {
  categories.setSelectedCategoryTag(props.category);
  emit('categoryClicked');
}
</script>

<template>
  <div :class="classTxt">
    <div class="p-1">{{category.name}}</div>
    <div class="panel-veil" @click="categoryClicked"></div>
  </div>
</template>

<style scoped>
.panel{
  position: relative;
  user-select: none;
  background-color: rgb(126, 200, 166);
  font-weight: 600;
  color: white;
  border-radius: 0.25rem;
  overflow: hidden;
  text-align: center;
  
  -webkit-transition: all 0.2s;
  -moz-transition: all 0.2s;
  -ms-transition: all 0.2s;
  -o-transition: all 0.2s;
	transition: all 0.2s;
}
.active{
  background-color: rgb(45, 175, 115) !important;
}
.delmode{
  background-color: rgb(255, 30, 30) !important;
}

.panel-veil{
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  top: 0;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
@media (hover: hover) {
  .panel:hover .panel-veil{
    background-color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
  }
}
</style>