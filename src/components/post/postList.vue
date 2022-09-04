<script lang="ts" setup>
import { ref,onMounted,computed } from 'vue'
import { projectFirestore } from '@/firebase/config'
import { PostData } from './Post'
import { CategoryData } from "@/components/category/Category";
import { useWorkStore } from '@/store/modules/works';
import postPanelVue from './postPanel.vue';
import CategoryTagAreaVue from "@/components/category/CategoryTagArea.vue";

const categoryTags = computed(() =>  Array.from(new Set( allposts.value.map(x=> x.qr)) ));

const allposts = ref([] as Array<PostData>);
onMounted(() => {
  const error :any = ref(null);
  const load = async () => {
    try {
      const collectionRef = projectFirestore.collection("posts");
      collectionRef.onSnapshot(
      snap => {
        allposts.value = [];
        snap.docs.forEach(doc => {
          const dat = new PostData().newPost(doc);
          allposts.value.push(dat);
        })
        error.value = null;
      },
      err => {
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

const isDelMode = ref(false);
const selectedCategoryID = computed(() => useWorkStore().getSelectedCategoryID);
const indicatePosts = computed(() =>
	allposts.value.filter(post => selectedCategoryID.value == "" ? true :
  (selectedCategoryID.value == post.qr)));
const sortedAllposts = computed(() => indicatePosts.value.slice().sort((a: any, b: any) => a.date < b.date? 1 : -1 ));
</script>

<template>
  <div class="my-3">
		<button v-if="isDelMode" @click="isDelMode=false" type="button" class="d-inline btn btn-danger ms-1">delmode:on</button>
		<button v-else @click="isDelMode=true" type="button" class="d-inline btn btn-outline-danger ms-1">delmode:off</button>
  </div>
  <CategoryTagAreaVue :delmode="false" :selectIDs="categoryTags" />
	<div class="row g-2">
    <transition-group name="list">
      <postPanelVue v-for="post in sortedAllposts" :key="post.date?.toString()" :delmode="isDelMode" :post="post" />
    </transition-group>
	</div>
</template>