<script lang="ts" setup>
import { ref , computed } from "vue";
import { useWorkStore } from "@/store/modules/works";
import WorkPanelListVue from "../work/WorkPanelList.vue";
import CategoryTagAreaVue from "./CategoryTagArea.vue";

const works = useWorkStore()
const selectedCategoryURL = computed(() => {
	const head = window.location.href.split('//')[0]
	const base = window.location.href.split('//')[1].split('/')[0];
	return `${head}//${base}${works.getURLParam}`;
});

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
	<div class="my-3">
		<button v-if="isEditEditCategory" @click="DisableEditCategory" type="button" class="d-inline btn btn-danger">editEditCategory:on</button>
		<button v-else @click="EnableEditEditCategory" type="button" class="d-inline btn btn-outline-danger">editEditCategory:off</button>
		<button v-if="isDelMode" @click="isDelMode=false" type="button" class="d-inline btn btn-danger ms-1">delmode:on</button>
		<button v-else @click="isDelMode=true" type="button" class="d-inline btn btn-outline-danger ms-1">delmode:off</button>
	</div>
	<div class="mb-3"><a :href="selectedCategoryURL" target="_blank">AccessLink</a></div>
	<CategoryTagAreaVue :delmode="isDelMode" />
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