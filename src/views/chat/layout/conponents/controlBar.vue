<script setup lang="ts">
import { useChat } from '@/views/chat/hooks/useChat'
import { NButton, NSpace } from 'naive-ui'

const { initMessage } = useChat()

// 清空历史消息
function handleClearMessage() {
  // FIXME 在一个消息请求正在进行时执行清空操作，请求未停止，请求结束后，会将最后一条消息添加到历史消息中
  initMessage()
}
</script>

<template>
  <div class="toolbar">
    <NSpace>
      <NButton ghost size="tiny" type="error" round @click="handleClearMessage"> 清空 </NButton>
      <!-- <NButton quaternary size="small" type="error" round>
        <template #icon>
          <n-icon><cash-icon /></n-icon>
        </template>
      </NButton> -->
    </NSpace>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  width: 100%;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 10px 10px 0;
  border-top: 1px solid #3c3f45;
}
</style>
