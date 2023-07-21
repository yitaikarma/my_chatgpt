<script setup lang="ts">
import { useChat } from '@/views/chat/hooks/useChat'
import { useEventListener } from '@/views/chat/hooks/useEventListener'

const { sendMessage, requesting, questionText } = useChat()

useEventListener(document, 'keydown', handleEnter as EventListener)

// Enter键发送消息与换行
function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') {
    if (event.shiftKey) return // shift + enter 换行
    event.preventDefault()
    if (!requesting.value) sendMessage()
    // console.log('enter', event);
  }
}
</script>

<template>
  <div class="user_wrapper">
    <textarea
      name="user"
      id="user"
      class="scroll textarea_scroll"
      v-model="questionText"
      cols="60"
      placeholder="请入内容后，按Enter键发送"
      rows="3"
    ></textarea>
    <button v-show="!requesting" @click="sendMessage">send</button>
    <button v-show="requesting">sending</button>
  </div>
</template>

<style scoped lang="scss">
@font-face {
  font-family: 'FiraCode';
  src: url('@/assets/fonts/FiraCode-VF.woff2'), url('@/assets/fonts/FiraCode-Light.woff2'),
    url('@/assets/fonts/FiraCode-Bold.woff2'), url('@/assets/fonts/FiraCode-Medium.woff2'),
    url('@/assets/fonts/FiraCode-Regular.woff2');
}

:deep(.scroll)::-webkit-scrollbar-thumb {
  background: #555;
  border: 6px solid #232425;
}

:deep(.scroll)::-webkit-scrollbar-track {
  background: #232425;
}

.user_wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  width: 100%;
}

textarea {
  position: relative;
  width: 100%;
  height: 100px;
  resize: none;
  border: none;
  outline: none;
  background: #2c2c2c00;
  padding: 20px 20px;
  font-size: 16px;
  line-height: 1.5;
  color: #b9b9b9;
}

:deep(.textarea_scroll)::-webkit-scrollbar-thumb {
  background: #555;
  border: 6px solid #2c2c2c;
}

:deep(.textarea_scroll)::-webkit-scrollbar-track {
  background: #2c2c2c;
}

textarea::placeholder {
  /* font-style: italic; */
  font-size: 14px;
  color: #555;
}

// textarea:focus {
//   /* box-shadow: 0 0 10px rgba(0, 0, 0, 0.2); */
// }

button {
  /* position: absolute; */
  /* bottom: 10px; */
  right: 10px;
  margin: 10px;
  padding: 6px 14px;
  border: none;
  outline: none;
  background: #3e3e3e;
  border-radius: 10px;
  color: #b9b9b9;
  font-size: 16px;
  line-height: 1.5;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}
</style>
