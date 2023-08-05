<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NInput, useMessage } from 'naive-ui'
import { Send } from '@vicons/tabler'
import { useChat } from '@/hooks/chat/useChat'
import { useSession } from '@/hooks/chat/useSession'
import { useEventListener } from '@/hooks/useEventListener'
import { throttle } from '@/utils/functions/throttle'

const message = useMessage()
const { sendMessage } = useChat()
const { sessionStore } = useSession()

useEventListener(document, 'keydown', handleEnter as EventListener)

const questionText = computed({
  get: () => sessionStore.getQuestionText,
  set: (value) => sessionStore.setQuestionText(value)
})
const placeholder = `请入内容后，按Enter键发送`

// 发送消息
function handleSendMessage() {
  // 若用户未输入内容（包括换行和空格），则不发送请求
  if (!questionText.value.trim()) {
    message.warning('请输入内容或合法内容')
    return
  }
  sendMessage()
}

// 节流发送消息
const throttleSendMessage = throttle(handleSendMessage, 1000)

// Enter键发送消息与换行
function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') {
    // shift + enter 换行
    if (!event.shiftKey) {
      event.preventDefault()
      if (!sessionStore.getRequesting) throttleSendMessage()
    }
  }
}
</script>

<template>
  <div class="user_wrapper">
    <NInput
      type="textarea"
      v-model:value="questionText"
      show-count
      bordered
      :autosize="{ minRows: 4, maxRows: 6 }"
      :placeholder="placeholder"
    >
      <template #suffix>
        <NButton
          size="medium"
          type="primary"
          ghost
          :loading="sessionStore.getRequesting"
          style="margin-bottom: 12px"
          @click="throttleSendMessage"
        >
          <template #icon>
            <NIcon> <Send /> </NIcon>
          </template>
          发送
        </NButton>
      </template>
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
