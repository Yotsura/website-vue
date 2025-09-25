<script lang="ts" setup>
import { computed } from "vue";
import { useWorkStore } from "@/store/modules/works";
import { useEnabledModesStore } from "@/store/modules/mode";
import WorkPanelListVue from "../work/WorkPanelList.vue";
import CategoryTagAreaVue from "./CategoryTagArea.vue";

const works = useWorkStore();
const modes = useEnabledModesStore();
const selectedCategoryURL = computed(() => {
	const head = window.location.href.split('//')[0]
	const base = window.location.href.split('//')[1]?.split('/')[0] || '';
	return `${head}//${base}${works.getURLParam}`;
});

const isDelMode =  computed(() => modes.deleteModeIsEnabled);
const isEditCaption = computed(() => modes.editCaptionIsEnabled);
const isEditCategory = computed(() => modes.editCategoryIsEnabled);
</script>

<template>
	<div class="my-3">
		<button v-if="isEditCategory" type="button" class="d-inline btn btn-danger"
			@click="modes.setEditCategoryFlg(false)">Tag:edit</button>
		<button v-else type="button" class="d-inline btn btn-outline-danger"
			@click="modes.setEditCategoryFlg(true)">Tag:disp</button>
		<button v-if="isEditCaption" type="button" class="d-inline btn btn-danger ms-1"
			@click="modes.setEditCaptionFlg(false)">Cap:edit</button>
		<button v-else type="button" class="d-inline btn btn-outline-danger ms-1"
			@click="modes.setEditCaptionFlg(true)">Cap:disp</button>
		<button v-if="isDelMode" type="button" class="d-inline btn btn-danger ms-3"
			@click="modes.setDeleteModeFlg(false)">Mode:del</button>
		<button v-else type="button" class="d-inline btn btn-outline-danger ms-3"
			@click="modes.setDeleteModeFlg(true)">Mode:disp</button>
	</div>
	<div class="mb-3"><a :href="selectedCategoryURL" target="_blank">AccessLink</a></div>
	<CategoryTagAreaVue />
	<WorkPanelListVue :adminmode="true" :showButton="true" />
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