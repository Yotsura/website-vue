<script setup lang="ts">
import type { PropType } from "vue";
import { projectFirestore } from '@/firebase/config'
import type { PostData } from './Post'
const props = defineProps({
	delmode: Boolean,
    post: Object as PropType<PostData>,
});

const delRecord = () => {
	if(confirm(props.post?.dateStr+'の投稿を削除しますか？')){
		const id = props.post?.id;
		projectFirestore.collection("posts").doc(id).delete();
	}
}

const lockRecord = (lock:boolean) => {
    if(!lock && !confirm(props.post?.dateStr+'の投稿のロックを解除しますか？')){
        return;
    }
    const id = props.post?.id;
    if(id) props.post?.updateLock(id,lock);
}
</script>

<template>
	<div class="col-lg-4 col-md-6 col-12">
        <div class="p-2 panel">
            <div v-if="!delmode" class="lockBtn">
                <img v-if="post?.locked" src="@/assets/imgs/key_locked.png"  @click="lockRecord(false)" />
                <img v-else src="@/assets/imgs/key_unlocked.png" @click="lockRecord(true)"/>
            </div>
            <div class="text-break panel-txt m-1 p-1">{{post?.dateStr}}</div>
            <div class="text-break panel-txt m-1 p-1">{{post?.name==''? '名無しさん' : post?.name?? '名無しさん'}}</div>
            <div class="text-break panel-txt m-1 p-1" style="white-space: pre-wrap;" v-text="(post?.message??'').replace(/\\n/g,'\n')"></div>
            <div v-if="post?.qr" class="text-break panel-txt m-1 p-1">{{post?.qr}}</div>
            
            <div class="btn btn-danger d-flex justify-content-center" v-if="delmode && !post?.locked" @click="delRecord">DELETE</div>
		</div>
	</div>
</template>

<style scoped>
.lockBtn img{
    height: 2rem;
    float: right;
    cursor: pointer;
}
@media (hover: hover) {
    .lockBtn img:hover{
    opacity: 0.7;
  }
}
.panel{
    background-color: rgb(225, 225, 225);
    /* border-radius: 240px 15px 100px 15px / 15px 200px 15px 185px; */
    border-radius: 7rem 0.5rem 4rem 0.5rem / 0.7rem 5rem 0.5rem 4rem;
}
.panel-txt{
    background-color: white;
    /* border-radius: 240px 15px 100px 15px / 15px 200px 15px 185px; */
    border-radius: 7rem 0.5rem 5rem 0.5rem / 0.7rem 5rem 0.5rem 4rem;
}
</style>