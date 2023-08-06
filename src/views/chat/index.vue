<script setup lang="ts">
import MessagesBar from './layout/messagesBar.vue'
import ControlBar from './layout/controlBar.vue'
import InputBar from './layout/inputBar.vue'
import SideBar from './layout/sideBar.vue'
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
.chat_view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #232425;
  background-color: var(--color-bg);
}

.chat_container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 6px;
  background-color: #232425;
  background-color: var(--color-bg);
  box-shadow: 0 0 10px #0000001a;
  // font-family: 'FiraCode';
  transition: background-color 0.5s;
}
</style>
