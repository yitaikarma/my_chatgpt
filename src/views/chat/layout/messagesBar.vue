<script setup lang="ts">
import { ref, toRef, nextTick, watch, onBeforeMount } from 'vue'
import { NSpace, NTooltip, NButton, NIcon, useMessage } from 'naive-ui'
import { Delete24Regular } from '@vicons/fluent'
import { CopyOutline, RefreshOutline } from '@vicons/ionicons5'
import { useConfig } from '@/hooks/chat/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useSession } from '@/hooks/chat/useSession'
import { useChat } from '@/hooks/chat/useChat'
import { useClipboard } from '@/hooks/useClipoard'
import { useInitListAnimation } from '@/hooks/useAnimation'
import { useMarkdown } from '@/hooks/useMarkdown'
import type MarkdownIt from 'markdown-it'
import { scrollToBottom } from '@/utils/operationElement'
// import { debounce } from '@/utils/functions/debounce'

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { sessionStore, initSession, getFullMessageList } = useSession()
const { initChatStatus, sendMessage, abortMessage } = useChat()
const message = useMessage()

let md: MarkdownIt | null = null
const messageList = toRef(() => getFullMessageList())
const chatTheme = toRef(() => globalConfigStore.getConfigAttr('chat_theme'))
const userNick = toRef(() => roleConfigStore.getRoleConfigAttr('user_nick'))
const roleNick = toRef(() => roleConfigStore.getRoleConfigAttr('role_nick'))
const changeDirection = ref('down')
const clipboardStatus = ref('拷贝')

watch(
  () => roleConfigStore.current_role_uuid,
  (val, oldVal) => {
    initChatStatus()

    changeDirection.value =
      roleConfigStore.getRoleIndex(val) > roleConfigStore.getRoleIndex(oldVal) ? 'down' : 'up'

    sessionTransform()
  }
)

onBeforeMount(() => {
  init()
  // BUG: n-input的 autosize底层执行时机比较晚，或者是静态修改
  sessionTransform()

  // 关闭页面/刷新页面/跳转页面前，如果有正在进行的事务，处理数据后终止
  function beforeUnloadHandler() {
    sessionStore.getRequesting && abortMessage()
    window.removeEventListener('beforeunload', beforeUnloadHandler)
  }

  window.addEventListener('beforeunload', beforeUnloadHandler)
})

// 初始化
function init() {
  md = useMarkdown()
  initChatStatus()
  // 没有历史消息则初始化
  if (!sessionStore.getCurrentSessionAttr('title')) {
    initSession()
  }
}

// 会话过渡
function sessionTransform() {
  nextTick(() => {
    scrollToBottom('message_list', false)
    useInitListAnimation('message_list', changeDirection.value)
  })
}

// 拷贝消息
function copyMessage(event: MouseEvent, content: string) {
  // navigator.clipboard.writeText(content)
  const findButton = (element: HTMLElement): HTMLElement => {
    if (element.tagName === 'BUTTON') {
      return element
    }
    return findButton(element.parentElement as HTMLElement)
  }

  const buttonId = `copyButton${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`

  findButton(event.target as HTMLElement).setAttribute('id', buttonId)

  const clipboard = useClipboard(`#${buttonId}`, {
    text: () => content
  })

  // const debounceSetClipboard = debounce(() => {
  //   setTimeout(() => {
  //     clipboardStatus.value = '拷贝'
  //   }, 1000)
  // }, 1000)

  clipboard.on('success', () => {
    message.success('已拷贝到剪贴板', { duration: 1000 })
    // clipboardStatus.value = '已拷贝'
    // debounceSetClipboard()
  })
}

// 重发消息
function resendMessage(content: string) {
  if (!sessionStore.getRequesting) {
    sessionStore.setQuestionText(content)
    sendMessage()
  } else {
    message.warning('正在请求中，请稍后重试', { duration: 1000 })
  }
}

// 移除消息
function removeMessage(index: number) {
  if (!sessionStore.getRequesting) {
    sessionStore.deleteCurrentMessage(index)
    sessionStore.deleteCurrentRequestMessage(index)
  } else {
    message.warning('正在请求中，请稍后重试', { duration: 1000 })
  }
}

// 渲染markdown
function renderMarkdown(text: string) {
  return md && md.render(text)
}
</script>

<template>
  <div id="message_list" class="message_container scroll">
    <div
      id="message_item"
      class="message_item"
      :role="item.role"
      :chatTheme="chatTheme"
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
          <div class="message_header_left">
            <div class="message_role">{{ item.role === 'user' ? userNick : roleNick }}</div>
            <div class="message_time">{{ item.date }}</div>
          </div>
          <div :hidden="i === 0" class="message_control_list">
            <NSpace>
              <NTooltip trigger="hover" :delay="100">
                <template #trigger>
                  <NButton
                    tertiary
                    size="small"
                    type="default"
                    :focusable="false"
                    @click="removeMessage(i - 1)"
                  >
                    <template #icon>
                      <NIcon> <Delete24Regular /> </NIcon>
                    </template>
                  </NButton>
                </template>
                移除
              </NTooltip>
              <NTooltip v-if="item.role === 'user'" trigger="hover" :delay="100">
                <template #trigger>
                  <NButton
                    tertiary
                    size="small"
                    type="default"
                    :focusable="false"
                    @click="resendMessage(item.content)"
                  >
                    <template #icon>
                      <NIcon> <RefreshOutline /> </NIcon>
                    </template>
                  </NButton>
                </template>
                重新发送
              </NTooltip>
              <NTooltip trigger="hover" :delay="100">
                <template #trigger>
                  <NButton
                    tertiary
                    size="small"
                    type="default"
                    :focusable="false"
                    @click="copyMessage($event, item.content)"
                  >
                    <template #icon>
                      <NIcon> <CopyOutline /> </NIcon>
                    </template>
                  </NButton>
                </template>
                {{ clipboardStatus }}
              </NTooltip>
            </NSpace>
          </div>
        </div>
        <div class="message_content">
          <div v-if="item.role === 'user'" class="message_text">{{ item.content }}</div>
          <!-- BUG: 渲染HTML语言时，会被解析成html标签而不是字符串 -->
          <div v-else class="message_text" v-html="`${renderMarkdown(item.content)}`"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message_container {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 20px 0;
  border-radius: 6px;
  background-color: #232425;
  background-color: var(--color-bg);
  transition: background-color 0.5s;
}

.message_item {
  position: relative;
  // content-visibility: auto;
  display: grid;
  /* grid-template-columns: 60px 700px 60px; */
  grid-template-columns: 60px 1fr 60px;
  padding: 10px 20px;
  border-color: transparent;
  background-color: transparent;
  transition: border-color 0.5s, border-bottom-color 0.5s, background-color 0.5s, color 0.5s;
}

.avatar {
  user-select: none;
  width: 44px;
  height: 44px;
  position: sticky;
  top: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  border: 1px solid var(--color-msg-ctn-border-1);
  border-radius: 50%;
  background-color: #ffffff;
  transition: border-color 0.5s;
  img {
    width: 36px;
    height: 36px;
    border-radius: 50%;
  }

  .fake_avatar_img {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: var(--color-msg-ctn-bg-2);
    line-height: 1;
    font-size: 26px;
    transition: background-color 0.5s;
  }
}

.message {
  // width: 100%;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .message_header {
    width: 100%;
    min-height: 24px;
    display: flex;
    gap: 20px;

    .message_header_left {
      display: flex;
      align-items: baseline;
      justify-content: flex-start;
      // margin-bottom: 4px;
      margin-top: 5px;
      .message_role {
        margin: 0 6px;
        font-size: 14px;
        font-weight: 600;
        color: #fff;
        color: var(--color-text);
        transition: color 0.5s;
      }
      .message_time {
        margin: 0 6px;
        // letter-spacing: -1px;
        font-size: 12px;
        color: #b9b9b9;
        color: var(--color-text);
        transition: color 0.5s;
      }
    }
    .message_control_list {
      visibility: hidden;
      position: sticky;
      top: 10px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      margin-bottom: 2px;
    }
  }
  .message_content {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 8px 14px;
    max-width: 100%;
    border: 1px solid var(--color-msg-ctn-border-1);
    border-radius: 10px;
    background-color: #2c2c2c;
    background-color: var(--color-msg-ctn-bg-1);
    color: #b9b9b9;
    color: var(--color-text);
    box-shadow: 0 0 10px #0000001a;
    transition: border-color 0.5s, border-radius 0.5s, background-color 0.5s, color 0.5s;
    .message_text {
      width: 100%;
    }
  }
}
.message_item:hover {
  .message_control_list:not([hidden]) {
    visibility: initial;
  }
}

.message_item[role='user'] {
  justify-items: end;
  .avatar {
    grid-column: 3;
    margin-left: 20px;
    margin-right: 0;
    border: 1px solid var(--color-msg-ctn-border-2);
    .fake_avatar_img {
      background-color: var(--color-msg-ctn-bg-2);
    }
  }
  .message_header_left {
    order: 1;
  }
  .message {
    grid-row: 1;
    grid-column: 2;
    align-items: flex-end;
    .message_header {
      justify-content: flex-end;
      .message_role {
        order: 1;
      }
    }
  }
  .message_content {
    border: 1px solid var(--color-msg-ctn-border-2);
    background-color: var(--color-msg-ctn-bg-2);
  }
}

.message_item[chatTheme='Q&A'] {
  border-bottom: 1px solid var(--color-msg-ctn-border-1);
  .message_header {
    justify-content: space-between;
    .message_role {
      content-visibility: hidden;
    }
  }
  .message_content {
    transition: border-color 0.5s, border-radius 0.5s, background-color 0.5s, color 0.5s;
    border-color: transparent;
    border-radius: initial;
    background-color: transparent;
    box-shadow: none;
  }

  &[role='user'] {
    justify-items: initial;
    border-bottom: 1px solid var(--color-msg-ctn-border-1);
    background-color: var(--color-msg-ctn-bg-1);
    transition: border-color 0.5s, border-radius 0.5s, background-color 0.5s, color 0.5s;
    .avatar {
      grid-column: 1;
      margin-left: initial;
      margin-right: initial;
    }
    .message {
      grid-row: 1;
      grid-column: 2;
      align-items: initial;
      .message_header {
        justify-content: space-between;
        .message_role {
          order: initial;
        }
        .message_header_left {
          order: initial;
        }
      }

      .message_content {
        transition: color 0.5s, border-radius 0.5s;
        // border: initial;
        border-color: transparent;
        border-radius: initial;
        background-color: transparent;
        box-shadow: none;
      }
    }
  }
}
</style>
