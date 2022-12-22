<script setup lang="ts">
</script>

<template>
<ul class="m-1">
  <li>
    <a target="_blank" href="https://twitter.com/Yotsura"><img src="@/assets/imgs/logo_twitter_blk.png"/></a>
  </li>
  <li>
    <a target="_blank" href="https://www.pixiv.net/member.php?id=2148146"><img src="@/assets/imgs/logo_pixiv_blk.png"/></a>
  </li>
  <li>
    <a target="_blank" href="https://webcatalog-free.circle.ms/Circle/16801409"><img src="@/assets/imgs/logo_circlems_blk.png"/></a>
  </li>
  <li>
    <a target="_blank" href="https://www.melonbooks.co.jp/circle/index.php?circle_id=26137"><img src="@/assets/imgs/logo_melon_blk.png"/></a>
  </li>
</ul>
</template>

<style scoped>
img{
  height: 30px;
}
ul{
  display: flex; 
}
li{
  display:list-item;
  text-decoration: none;
  list-style: none;
  margin-right: 1rem;
}

@media (hover: hover) {
  li:hover{
    opacity: 0.5;
  }
}
</style>