<script setup lang="ts">
import { toRef, nextTick, watch, onBeforeMount } from 'vue'
import { useConfig } from '@/hooks/chat/core/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/core/useRoleConfig'
import { useSession } from '@/hooks/chat/core/useSession'
import { useChat } from '@/views/chat/hooks/useChat'
import { useInitListAnimation } from '@/hooks/useAnimation'
import { scrollToBottom } from '@/utils/operationElement'
import { useMarkdown } from '@/views/chat/hooks/useMarkdown'
import type MarkdownIt from 'markdown-it'

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { sessionStore } = useSession()
const { initMessage } = useChat()

let md: MarkdownIt | null = null
const messageList = toRef(() => sessionStore.getCurrentSession.message_list)
const chatTheme = toRef(() => globalConfigStore.getConfigAttr('chat_theme'))
const userNick = toRef(() => roleConfigStore.getRoleConfigAttr('user_nick'))
const roleNick = toRef(() => roleConfigStore.getRoleConfigAttr('role_nick'))

watch(
  () => roleConfigStore.current_role_uuid,
  () => {
    sessionTransform()
  }
)

onBeforeMount(() => {
  initSession()
  sessionTransform()
})

// 初始化会话
function initSession() {
  // createGPT()
  md = useMarkdown()
  initMessage()
}

// 会话过渡
function sessionTransform() {
  nextTick(() => {
    scrollToBottom('message_list', false)
    useInitListAnimation('message_list')
  })
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
          <div class="message_role">{{ item.role === 'user' ? userNick : roleNick }}</div>
          <div class="message_time">{{ item.date }}</div>
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
@font-face {
  font-family: 'FiraCode';
  src: url('@/assets/fonts/FiraCode-VF.woff2'), url('@/assets/fonts/FiraCode-Light.woff2'),
    url('@/assets/fonts/FiraCode-Bold.woff2'), url('@/assets/fonts/FiraCode-Medium.woff2'),
    url('@/assets/fonts/FiraCode-Regular.woff2');
}
// FIXME: 对话容器滚动条样式，主题切换的过渡效果无法实现
.scroll::-webkit-scrollbar {
  height: 16px;
}

.scroll::-webkit-scrollbar-thumb {
  border: 6px solid var(--color-bg);
  border-radius: 50px;
  background-color: var(--color-scroll-thumb-bg);
  // transition: border-color 0.5s ease-out, background-color 0.5s ease-out;
}

.scroll::-webkit-scrollbar-corner {
  background-color: var(--color-bg);
}
// .scroll::-webkit-scrollbar-track {
//   background-color: #232425;
// }

.scroll::-webkit-scrollbar-thumb:hover {
  border: 4px solid var(--color-bg);
  background-color: var(--color-scroll-thumb-bg);
}

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
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  .message_header {
    width: 100%;
    min-height: 24px;
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    margin-bottom: 4px;
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
  .message_role {
    content-visibility: hidden;
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
        justify-content: initial;
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

:deep(.code-block) {
  overflow: hidden;
  margin: 1rem 0;
  border-radius: 6px;
  .code-block-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 14px;
    color: #6565ff;
    font-size: 0.75rem;
    background-color: var(--color-code-bg-header);
    transition: background-color 0.5s ease-out;
  }
  .code_scroll::-webkit-scrollbar {
    height: 16px;
  }

  .code_scroll::-webkit-scrollbar-thumb {
    background: #29356f;
    border: 6px solid #1d2636;
  }

  .code_scroll::-webkit-scrollbar-track {
    background: #1d2636;
  }
  .hljs {
    font-family: 'FiraCode';
  }

  /* Copy */
  .copy-button {
    margin-left: 10px;
    padding: 2px 6px;
    border: none;
    border-radius: 4px;
    background-color: #6565ff;
    color: #fff;
    cursor: pointer;
  }
}

:deep(.code_inline) {
  margin: 0.1em;
  // border-radius: 4px;
  // background: #262631;
  white-space: nowrap;
  color: #8f68cd;
}
</style>
