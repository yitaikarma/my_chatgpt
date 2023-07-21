<script setup lang="ts">
import MessagesBar from './conponents/messagesBar.vue'
import ControlBar from './conponents/controlBar.vue'
import InputBar from './conponents/inputBar.vue'
import SideBar from './conponents/sideBar.vue'
</script>

<template>
  <div class="chat_view">
    <SideBar></SideBar>
    <div class="chat_container">
      <MessagesBar></MessagesBar>
      <ControlBar></ControlBar>
      <InputBar></InputBar>
    </div>
  </div>
</template>

<style scoped lang="scss">
// @font-face {
//   font-family: 'FiraCode';
//   src: url('@/assets/fonts/FiraCode-VF.woff2'), url('@/assets/fonts/FiraCode-Light.woff2'),
//     url('@/assets/fonts/FiraCode-Bold.woff2'), url('@/assets/fonts/FiraCode-Medium.woff2'),
//     url('@/assets/fonts/FiraCode-Regular.woff2');
// }

// :deep(.scroll)::-webkit-scrollbar-thumb {
//   background: #555;
//   border: 6px solid #232425;
// }

// :deep(.scroll)::-webkit-scrollbar-track {
//   background: #232425;
// }

.chat_view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #232425;
}

.chat_container {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #232425;
  box-shadow: 0 0 10px #0000001a;
  // font-family: 'FiraCode';
}
</style>
