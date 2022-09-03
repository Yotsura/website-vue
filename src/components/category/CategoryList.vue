<script lang="ts" setup>
import { ref , computed } from "vue";
import { CategoryData } from "./Category";
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListVue from "../work/WorkPanelList.vue";
import CategoryTagAreaVue from "./CategoryTagArea.vue";

const works = useWorkStore()
const selectedCategoryURL = computed(() => {
	const head = window.location.href.split('//')[0]
	const base = window.location.href.split('//')[1].split('/')[0];
	return `${head}//${base}${works.getURLParam}`;
});
const categoryClicked = (category:CategoryData) => {
	if ( isDelMode.value){
		if(category.name != "ALL")
			if(confirm(`カテゴリーを削除しますか？：${category.name}`))
				category.deleteData();	
	} else if ( isEditEditCategory.value ){
		works.setCategoryTag(category);
		

	} else {
		works.setCategoryTag(category);

	}
}

const isDelMode = ref(false);
const isEditEditCategory = computed(() => works.getEditCategory);
const EnableEditEditCategory = () => {
	works.enableEditCategory();
}
const DisableEditCategory = () => {
	works.disableEditCategory();
}
</script>

<template>
	<div class="row my-3">
    <div v-if="isEditEditCategory" class="col-auto">
      <button @click="DisableEditCategory" type="button" class="btn btn-danger">editEditCategory:on</button>
    </div>
    <div v-else class="col-auto">
      <button @click="EnableEditEditCategory" type="button" class="btn btn-outline-danger">editEditCategory:off</button>
    </div>
    <div v-if="isDelMode" class="col-auto">
      <button @click="isDelMode=false" type="button" class="btn btn-danger">delmode:on</button>
    </div>
    <div v-else class="col-auto">
      <button @click="isDelMode=true" type="button" class="btn btn-outline-danger">delmode:off</button>
    </div>
	</div>
	<div class="mb-3"><a :href="selectedCategoryURL" target="_blank">AccessLink</a></div>
	<CategoryTagAreaVue :delmode="isDelMode" @selectTag="categoryClicked" />
	<WorkPanelListVue :adminmode="true" :delmode="isDelMode" :showButton="true" />
</template>


<style scoped>
.link--active {
	color: rgba(0, 0, 0, 1) !important;
}
.menulink{
	user-select: none; /* CSS3 */
    -moz-user-select: none; /* Firefox */
    -webkit-user-select: none; /* Safari、Chromeなど */
	position: relative;
	color: rgba(0, 0, 0, 0.3);
	text-decoration: none;
	font-weight: 500;
	font-size: 1.3rem;
	-webkit-transition: all 0.3s;
	-moz-transition: all 0.3s;
	-ms-transition: all 0.3s;
	-o-transition: all 0.3s;
	transition: all 0.3s;
}
.menulink::after{
	position: absolute;
	left: 0;
	content: '';
	width: 100%;
	height: 2px;
	background: #000000;
	bottom: -1px !important;
	transform: scale(0, 1);
	transform-origin: center top !important;
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}

@media (hover: hover) {
	.menulink:hover {
		cursor: pointer;
	}
	.menulink:hover::after {
		transform: scale(0.8, 1);
	}
}

@media (hover: none) {
	.menulink:active {
		cursor: pointer;
	}
	.menulink:active::after {
		transform: scale(0.8, 1);
	}
}
</style>