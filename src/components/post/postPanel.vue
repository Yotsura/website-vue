<script setup lang="ts">
import type { PropType } from "vue";
import { ref, computed } from "vue";
import { projectFirestore } from '@/firebase/config'
import type { PostData } from './Post'

const props = defineProps({
	delmode: Boolean,
    post: Object as PropType<PostData>,
});

const isExpanded = ref(false);

const processedMessage = computed(() => {
    return (props.post?.message ?? '').replace(/\\n/g, '\n');
});

const shouldShowToggle = computed(() => {
    // メッセージが5行以上または200文字以上の場合に折りたたみ機能を表示
    const lines = processedMessage.value.split('\n').length;
    const length = processedMessage.value.length;
    return lines > 5 || length > 200;
});

const toggleExpand = () => {
    isExpanded.value = !isExpanded.value;
};

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
            <div class="message-container">
                <div class="text-break panel-txt m-1 p-1 message-content" 
                    :class="{ 'collapsed': !isExpanded && shouldShowToggle, 'clickable': shouldShowToggle }"
                    style="white-space: pre-wrap;" 
                    v-text="processedMessage"
                    @click="shouldShowToggle ? toggleExpand() : null"></div>
            </div>
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

.message-container {
    position: relative;
}

.message-content {
    transition: max-height 0.4s ease-in-out;
    position: relative;
    overflow: hidden;
}

.message-content.collapsed {
    max-height: 200px;
}

.message-content:not(.collapsed) {
    max-height: 2000px; /* 十分に大きな値でアニメーション可能 */
}

.message-content.collapsed::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
    background: linear-gradient(rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    pointer-events: none;
}

.message-content.clickable {
    cursor: pointer;
}

@media (hover: hover) {
    .message-content.clickable:hover {
        background-color: rgba(255, 255, 255, 0.5);
    }
}
</style>