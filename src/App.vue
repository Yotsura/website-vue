<script setup lang="ts">
import { ref ,onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { projectFirestore } from '@/firebase/config'
import { Work } from '@/components/work/Work';
import { CategoryData } from '@/components/category/Category';
import { useTagStore } from '@/store/modules/category';
import { useWorkStore } from '@/store/modules/works';
import CategoryViewVue from './views/CategoryView.vue';

const param = window.location.href.includes('/?id:')? (`/?id:` + window.location.href.split('/?id:')[1]) : "";

const categories = useTagStore();
const works = useWorkStore();
onMounted(() => {
	const error :any = ref(null);
	const load = async () => {
		try {
			projectFirestore.collection("categories").onSnapshot(
			(snap: any) => {
				categories.setCategoryTagList(snap.docs.map((doc: any) => new CategoryData().newCategory(doc)));
				error.value = null;
			},
			(err: any) => {
				console.log(err.message);
				error.value = 'could not fetch data';
			});
			projectFirestore.collection("works").onSnapshot(
			(snap: any) => {
				works.setWorks(snap.docs.map((doc: any) => new Work(doc)));
				works.loadThumbnails();
				
				error.value = null;
			},
			(err: any) => {
				console.log(err.message);
				error.value = 'could not fetch data';
			});
		} catch (err: any) {
			error.value = err.message;
			console.log(error.value);
			alert('取得失敗');
		}
	}
	load();
	return { error, load }
});
</script>

<template>
	<div id="wrapper" class="container" ontouchstart="">
    <div class="row">
      <h1>弓張月/<small>寄弦</small></h1>
			<CategoryViewVue v-if="param" />
      <RouterView v-else />
			<!-- <transition v-else name="fade" mode="out-in">
        <RouterView />
			</transition> -->
    </div>
  </div>
</template>

<style>
	html{
		scroll-behavior:auto !important;
	}

  .list-move, .list-enter-active, .list-leave-active {
      -webkit-transition: all 0.8s;
      -moz-transition: all 0.8s;
      -ms-transition: all 0.8s;
      -o-transition: all 0.8s;
    transition: all 0.8s;
  }
  .list-enter-from, .list-leave-to {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .list-item {
    display: inline-block;
    margin-right: 10px;
  }
  
  .list-leave-active {
    position: absolute;
  }

.fade-enter-active, .fade-leave-active {
    -webkit-transition: all 0.3s;
    -moz-transition: all 0.3s;
    -ms-transition: all 0.3s;
    -o-transition: all 0.3s;
	transition: all 0.3s;
}

.fade-enter-from, .fade-leave-to  {
  opacity: 0;
}

.btn-outline-danger:hover{
  background-color: #e78f91;
}
</style>
