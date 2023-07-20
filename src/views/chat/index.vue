<script setup lang="ts">
import Settings from './conmpoents/settings.vue'
import { ref, toRef, onBeforeMount } from 'vue'
import { useSettings } from './hooks/useSettingsStore'
import { useChat } from './hooks/useChat'
import { useEventListener } from './hooks/useEventListener'
import { useMarkdown } from './hooks/useMarkdown'
import type MarkdownIt from 'markdown-it'

const { getSettingsAttr } = useSettings()
const { initMessage, sendMessage, requesting, questionText, messageList } = useChat()

const userNick = toRef(() => getSettingsAttr('user_nick'))
const roleNick = toRef(() => getSettingsAttr('role_nick'))

const settingsRef = ref<InstanceType<typeof Settings> | null>(null)
let md: MarkdownIt | null = null

useEventListener(document, 'keydown', handleEnter as EventListener)

onBeforeMount(() => {
  // createGPT()
  md = useMarkdown()
  initMessage()
})

// 渲染markdown
function renderMarkdown(text: string) {
  return md && md.render(text)
}

// Enter键发送消息与换行
function handleEnter(event: KeyboardEvent) {
  if (event.code === 'Enter') {
    if (event.shiftKey) return // shift + enter 换行
    event.preventDefault()
    if (!requesting.value) sendMessage()
    // console.log('enter', event);
  }
}

// 清空历史消息
function handleClearMessage() {
  // FIXME 在一个消息请求正在进行时执行清空操作，请求未停止，请求结束后，会将最后一条消息添加到历史消息中
  initMessage()
}

// 设置
function handleChangeSettingsDisplay() {
  settingsRef.value?.openSettings()
}
</script>

<template>
  <div class="chat_view">
    <div class="chat_list_wrapper">
      <div class="chat_list"></div>
      <div class="utils_nav">
        <div class="settings_btn" @click="handleChangeSettingsDisplay">设置</div>
      </div>
    </div>
    <div class="chat_container">
      <div id="message_list" class="chat_history_container scroll">
        <div
          class="message_item"
          :user="item.role === 'user'"
          v-for="(item, i) in messageList"
          :key="i"
        >
          <div class="avatar">
            <img v-if="item.role === 'assistant'" src="@/assets/svg/chatgpt.svg" alt="" />
            <div v-if="item.role === 'user'" class="fake_avatar_img">
              {{ item.role.slice(0, 1).toLocaleUpperCase() }}
            </div>
          </div>
          <div class="message" :user="item.role === 'user'">
            <div class="message_header">
              <div class="message_role">{{ item.role === 'user' ? userNick : roleNick }}</div>
              <div class="message_time">{{ item.time }}</div>
            </div>
            <div class="message_content">
              <div v-if="item.role === 'user'" class="message_text">{{ item.content }}</div>
              <div v-else class="message_text" v-html="`${renderMarkdown(item.content)}`"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="toolbar">
        <div class="clear_msg" @click="handleClearMessage">
          <span>重新开始</span>
        </div>
      </div>
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
    </div>
    <settings ref="settingsRef" />
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

.chat_view {
  display: flex;
  flex-direction: row;
  width: 100%;
  height: 100%;
  background-color: #232425;
}

.chat_list_wrapper {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid #3c3f45;
  background-color: #23252b;

  .chat_list {
    width: 300px;
    height: 100%;
    padding: 20px;
  }

  .utils_nav {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid #2e3035;

    .settings_btn {
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #353535;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      color: #c3c3c3;

      &:hover {
        color: #1890ff;
      }
    }
  }
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
  font-family: 'FiraCode';
}

.chat_history_container {
  overflow-y: auto;
  padding: 20px;
  width: 100%;
  /* height: 500px; */
  height: 100%;
  border-radius: 6px;
  background-color: #232425;
}

.message_item {
  display: grid;
  /* grid-template-columns: 60px 700px 60px; */
  grid-template-columns: 60px 1fr 60px;
  margin-bottom: 20px;
}

.avatar {
  user-select: none;
  position: sticky;
  top: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #ffffff;
  margin-right: 10px;
}

.avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.fake_avatar_img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #16a160;
  line-height: 1;
  font-size: 26px;
}

.message {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.message_header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 4px;
}

.message_role {
  margin: 0 6px;
  font-size: 14px;
  color: #fff;
}
.message_time {
  margin: 0 6px;
  letter-spacing: -1px;
  font-size: 12px;
  color: #b9b9b9;
}

.message_content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 20px;
  max-width: 100%;
  border-radius: 10px;
  background: #2c2c2c;
  color: #b9b9b9;
  box-shadow: 0 0 10px #0000001a;
}

.message_text {
  width: 100%;
}
// FIXME: 优化CSS格式
.message_item[user='true'] {
  justify-items: end;
}

.message_item[user='true'] .avatar {
  grid-column: 3;
  margin-left: 20px;
  margin-right: 0;
  background-color: #2a2b78;
}

.message_item[user='true'] .fake_avatar_img {
  background-color: #2a2b78;
}

.message_item[user='true'] .message {
  grid-row: 1;
  grid-column: 2;
  align-items: flex-end;
}

.message_item[user='true'] .message_header {
  justify-content: flex-end;
}

.message_item[user='true'] .message_content {
  background-color: #2a2b78;
}
.message_item[user='true'] .message_role {
  order: 1;
}

.assistant {
  overflow-y: auto;
  width: 100%;
  width: 600px;
  min-height: 100px;
  max-height: 400px;
  padding: 10px 20px;
  border-radius: 10px;
  background: #2c2c2c;
  color: #b9b9b9;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
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

:deep(.code-block) {
  overflow: hidden;
  margin: 1rem 0;
  border-radius: 6px;
}

:deep(.code-block-info) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 14px;
  color: #6565ff;
  font-size: 0.75rem;
  background-color: #1d2636;
}

:deep(.hljs) {
  font-family: 'FiraCode';
}

:deep(.code_scroll)::-webkit-scrollbar {
  height: 16px;
}

:deep(.code_scroll)::-webkit-scrollbar-thumb {
  background: #29356f;
  border: 6px solid #1d2636;
}

:deep(.code_scroll)::-webkit-scrollbar-track {
  background: #1d2636;
}

:deep(.code_inline) {
  /* padding: .1em .2em; */
  margin: 0.2em;
  border-radius: 4px;
  // background: #262631;
  font-family: 'FiraCode';
  color: #8f68cd;
  white-space: nowrap;
}

/* Copy */
:deep(.copy-button) {
  margin-left: 10px;
  padding: 2px 6px;
  border: none;
  border-radius: 4px;
  background-color: #6565ff;
  color: #fff;
  cursor: pointer;
}

/* :depp(.hljs-keyword,
  .hljs-selector-tag,
  .hljs-built_in,
  .hljs-name) {
  font-weight: bold;
}

:deep(.hljs-string,
  .hljs-title,
  .hljs-section,
  .hljs-attribute,
  .hljs-literal,
  .hljs-symbol,
  .hljs-bullet,
  .hljs-addition,
  .hljs-regexp,
  .hljs-link) {
  color: #2b91af;
}

:deep(.hljs-comment,
  .hljs-quote,
  .hljs-meta) {
  color: #a0a1a7;
  font-style: italic;
}

:deep(.hljs-deletion) {
  background-color: #fdd;
} */
</style>
