<script setup lang="ts">
import { toRef, onBeforeMount } from 'vue'
import { useSettings } from '@/views/chat/hooks/useSettingsStore'
import { useChat } from '@/views/chat/hooks/useChat'
import { useMarkdown } from '@/views/chat/hooks/useMarkdown'
import type MarkdownIt from 'markdown-it'

const { getSettingsAttr } = useSettings()
const { initMessage, messageList } = useChat()

const userNick = toRef(() => getSettingsAttr('user_nick'))
const roleNick = toRef(() => getSettingsAttr('role_nick'))

let md: MarkdownIt | null = null
const chatTheme = toRef(() => getSettingsAttr('chat_theme'))

onBeforeMount(() => {
  // createGPT()
  md = useMarkdown()
  initMessage()
})

// 渲染markdown
function renderMarkdown(text: string) {
  return md && md.render(text)
}
</script>

<template>
  <div id="message_list" class="chat_history_container scroll">
    <div
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
          <div class="message_time">{{ item.time }}</div>
        </div>
        <div class="message_content">
          <div v-if="item.role === 'user'" class="message_text">{{ item.content }}</div>
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
.scroll::-webkit-scrollbar {
  height: 16px;
}

.scroll::-webkit-scrollbar-thumb {
  border: 6px solid #232425;
  border-radius: 50px;
  background-color: #6d6d6d;
  transition: 1s ease-in-out;
}
// .scroll::-webkit-scrollbar-track {
//   background-color: #232425;
// }

.scroll::-webkit-scrollbar-thumb:hover {
  border: 4px solid #232425;
  background-color: #7b7b7b;
}

.chat_history_container {
  overflow-y: auto;
  padding: 20px 0;
  width: 100%;
  height: 100%;
  border-radius: 6px;
  background-color: #232425;
  background-color: var(--color-background);
  transition: background-color 0.5s;
}

.message_item {
  display: grid;
  /* grid-template-columns: 60px 700px 60px; */
  grid-template-columns: 60px 1fr 60px;
  margin-bottom: 20px;
  padding: 10px 20px;
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
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    margin-bottom: 4px;
    .message_role {
      margin: 0 6px;
      font-size: 14px;
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
    transition: background-color 0.5s, border-color 0.5s, color 0.5s, border-radius 0.5s;
    .message_text {
      width: 100%;
    }
  }
}

.message_item[role='user'] {
  justify-items: end;
  transition: background-color 0.5s, border-color 0.5s, color 0.5s;
  .avatar {
    grid-column: 3;
    margin-left: 20px;
    margin-right: 0;
    border: 1px solid var(--color-msg-ctn-border-2);
    // background-color: #2a2b78;
    .fake_avatar_img {
      // background-color: #2a2b78;
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
    // background-color: #275683;
    background-color: var(--color-msg-ctn-bg-2);
  }
}

.message_item[chatTheme='official'] {
  padding: 10px 20px;
  .message_role {
    display: none;
  }
  .message_content {
    transition: border-color 0.5s, color 0.5s, border-radius 0.5s;
    border: initial;
    border-radius: initial;
    background-color: initial;
    box-shadow: none;
  }
  &[role='user'] {
    justify-items: initial;
    border-top: 1px solid var(--color-msg-ctn-border-1);
    background-color: var(--color-msg-ctn-bg-1);
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
    }
  }
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
</style>
