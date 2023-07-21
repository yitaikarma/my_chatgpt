<script setup lang="ts">
import { useChat } from '@/views/chat/hooks/useChat'
import { useEventListener } from '@/views/chat/hooks/useEventListener'
import { NButton, NInput } from 'naive-ui'

const { sendMessage, requesting, questionText } = useChat()

useEventListener(document, 'keydown', handleEnter as EventListener)

const placeholder = `请入内容后，按Enter键发送`

// Enter键发送消息与换行
function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') {
    if (event.shiftKey) return // shift + enter 换行

    event.preventDefault()

    console.log('requesting.value', requesting)
    if (!requesting.value) sendMessage()
  }
}
</script>

<template>
  <div class="user_wrapper">
    <NInput
      type="textarea"
      v-model:value="questionText"
      show-count
      autofocus
      bordered
      :autosize="{ minRows: 4, maxRows: 6 }"
      :placeholder="placeholder"
    >
      <template #suffix>
        <!-- FIXME: 视觉待优化，用icon代替文本，加载和发送icon-->
        <NButton size="medium" type="primary" style="margin-bottom: 12px" @click="sendMessage">
          {{ requesting ? '发送中' : '发送' }}
        </NButton></template
      >
    </NInput>
  </div>
</template>

<style scoped lang="scss">
.user_wrapper {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  column-gap: 10px;
  padding: 14px;
}

:deep(.n-input__suffix) {
  align-items: flex-end;
}
:deep(.n-input) .n-input-word-count {
  bottom: 48px;
  margin-right: 6px;
}
</style>
