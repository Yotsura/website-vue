<script lang="ts" setup>
import { RouterLink, RouterView } from 'vue-router'
// import getUser from '@/utils/getUser';
// const { user } = getUser()
// const props = defineProps({
// 	param:{ Type: String , required:true }
// });
// const link = `${props.param == "" ? "/" : props.param }`;
// const link_gallery = `/gallery${props?.param??"" == "" ? "" : props.param }`;
// const link_contact = `/contact${props?.param??"" == "" ? "" : props.param }`;
</script>

<template>
	<div class="col-12 text-center py-2 px-3 mb-3 d-flex border">
		<!-- <RouterLink class="menulink px-2 flex-fill" :to="link" exact active-class="link--active">Home</RouterLink>
		<RouterLink class="menulink px-2 flex-fill" :to="link_gallery" exact active-class="link--active">Gallery</RouterLink>
		<RouterLink class="menulink px-2 flex-fill" :to="link_contact" exact active-class="link--active">Contact</RouterLink> -->
		<RouterLink class="menulink px-2 flex-fill" to="/" exact active-class="link--active">Home</RouterLink>
		<RouterLink class="menulink px-2 flex-fill" to="/gallery" exact active-class="link--active">Gallery</RouterLink>
		<RouterLink class="menulink px-2 flex-fill" to="/contact" exact active-class="link--active">Contact</RouterLink>
		<!-- <RouterLink class="menulink px-2 flex-fill" to="/admin" exact active-class="link--active">*Admin</RouterLink> -->
	</div>
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