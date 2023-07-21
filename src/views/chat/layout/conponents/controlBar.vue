<script setup lang="ts">
import { useChat } from '@/views/chat/hooks/useChat'

const { initMessage } = useChat()

// 清空历史消息
function handleClearMessage() {
  // FIXME 在一个消息请求正在进行时执行清空操作，请求未停止，请求结束后，会将最后一条消息添加到历史消息中
  initMessage()
}
</script>

<template>
  <div class="toolbar">
    <div class="clear_msg" @click="handleClearMessage">
      <span>重新开始</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'FiraCode';
  src: url('@/assets/fonts/FiraCode-VF.woff2'), url('@/assets/fonts/FiraCode-Light.woff2'),
    url('@/assets/fonts/FiraCode-Bold.woff2'), url('@/assets/fonts/FiraCode-Medium.woff2'),
    url('@/assets/fonts/FiraCode-Regular.woff2');
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  min-height: 30px;
  background-color: #2c2c2c;
}

.clear_msg {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 20px;
  height: 30px;
  border-radius: 50%;
  background-color: #2c2c2c;
  color: #dd5050;
  cursor: pointer;
}
</style>
