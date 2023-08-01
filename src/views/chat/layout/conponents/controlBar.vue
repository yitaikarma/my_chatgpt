<script setup lang="ts">
import RoleSettings from '@/views/chat/conmpoents/roleSettings.vue'
import HistoryMessage from '@/views/chat/conmpoents/historyMessage.vue'
import { nextTick, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/modules/settings'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { useConfig } from '@/hooks/core/useConfig'
import { useChat } from '@/views/chat/hooks/useChat'
import { useAnimation } from '@/hooks/useAnimation'
import { NButton, NIcon, NSelect, NSpace, NTooltip } from 'naive-ui'
import type { SelectOption } from 'naive-ui'
import {
  ChatSettings24Regular,
  StyleGuide24Regular,
  DarkTheme24Regular,
  DocumentBulletListClock24Regular,
  FormNew24Regular
} from '@vicons/fluent'

const { getSettingsAttr } = useConfig()
const { initMessage, clearMessage, seveMessage } = useChat()

const settingsStore = useSettingsStore()

const roleConfigStore = useRoleConfigStore()
const { role_list, current_role_uuid } = storeToRefs(roleConfigStore)

const userSettingsModalRef = ref<InstanceType<typeof RoleSettings> | null>()
const historyMsgRef = ref<InstanceType<typeof HistoryMessage> | null>()

const options: SelectOption[] = [
  {
    label: 'GPT-3.5',
    value: 'gpt-3.5'
  },
  {
    label: 'GPT-3.5-Turbo',
    value: 'gpt-3.5-turbo'
  },
  {
    label: 'GPT-3.5-Turbo-0613',
    value: 'gpt-3.5-turbo-0613'
  },
  {
    label: 'GPT-3.5-Turbo-16k',
    value: 'gpt-3.5-turbo-16k'
  },
  {
    label: 'GPT-3.5-Turbo-16k-0613',
    value: 'gpt-3.5-turbo-16k-0613'
  },
  {
    label: 'GPT-4',
    value: 'gpt-4',
    disabled: true
  },
  {
    label: 'GPT-4-0613',
    value: 'gpt-4-0613',
    disabled: true
  },
  {
    label: 'GPT-4-32k',
    value: 'gpt-4-32k',
    disabled: true
  },
  {
    label: 'GPT-4-32k-0613',
    value: 'gpt-4-32k-0613',
    disabled: true
  }
]

// 打开角色设置
function handleOpenRoleSettings() {
  userSettingsModalRef.value?.openSettings()
}

// 风格切换
function handleStyleChange() {
  // 角色切换
  // userSettingsStore.setConfigForAttr(
  //   'a',
  //   'chat_theme',
  //   chat.value.a.chat_theme === 'chat' ? 'Q&A' : 'chat'
  // )
  // 全局切换
  settingsStore.switchChatTheme()

  nextTick(() => {
    const messageListEl = document.querySelectorAll('.message_item[role="user"]')
    for (let i = 0; i < messageListEl.length; i++) {
      const element = messageListEl[i]
      if (element.getAttribute('chatTheme') === 'Q&A') {
        useAnimation(
          element as HTMLElement,
          [
            { opacity: 0, transform: 'translateX(10px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ],
          300
        )
      } else {
        useAnimation(
          element as HTMLElement,
          [
            { opacity: 0, transform: 'translateX(-10px)' },
            { opacity: 1, transform: 'translateX(0)' }
          ],
          300
        )
      }
    }
  })
}

// 主题切换
function handleThemeChange() {
  const theme = getSettingsAttr('theme')

  switch (theme) {
    case 'light':
      settingsStore.setTheme('dark')
      break

    case 'dark':
      settingsStore.setTheme('shallow_dark')
      break

    case 'shallow_dark':
      settingsStore.setTheme('blue_dark')
      break

    case 'blue_dark':
      settingsStore.setTheme('auto')
      break

    default:
      settingsStore.setTheme('light')
      break
  }
}

// 历史话题
function handleOpenHistoryMessage() {
  historyMsgRef.value?.toggleActive(true)
}

// 新话题
function handleNewMessage() {
  seveMessage()
  // FIXME 在一个消息请求正在进行时执行清空操作，请求未停止，请求结束后，会将最后一条消息添加到历史消息中
  initMessage()
  clearMessage()
}
</script>

<template>
  <div class="toolbar">
    <NSpace>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="default"
            round
            :focusable="false"
            @click="handleOpenRoleSettings"
          >
            <template #icon>
              <NIcon> <ChatSettings24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        角色设置
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="default"
            round
            :focusable="false"
            @click="handleStyleChange"
          >
            <template #icon>
              <NIcon> <StyleGuide24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        风格
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="default"
            round
            :focusable="false"
            @click="handleThemeChange"
          >
            <template #icon>
              <NIcon> <DarkTheme24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        主题：{{ getSettingsAttr('theme').toLocaleUpperCase() }}
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="default"
            round
            :focusable="false"
            @click="handleOpenHistoryMessage"
          >
            <template #icon>
              <NIcon> <DocumentBulletListClock24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        历史话题
      </NTooltip>
      <NTooltip trigger="hover">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="primary"
            round
            :focusable="false"
            @click="handleNewMessage"
          >
            <template #icon>
              <NIcon> <FormNew24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        新话题
      </NTooltip>
    </NSpace>
    <NSpace>
      <NTooltip trigger="hover">
        <template #trigger>
          <NSelect
            size="small"
            v-model:value="role_list[current_role_uuid].session_config.model"
            :options="options"
            :consistent-menu-width="false"
            style="border-radius: 100px"
          />
        </template>
        模型
      </NTooltip>
    </NSpace>
  </div>
  <HistoryMessage ref="historyMsgRef" />
  <RoleSettings ref="userSettingsModalRef" />
</template>

<style scoped lang="scss">
.toolbar {
  width: 100%;
  // min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 14px 0;
  border-top: 1px solid #3c3f45;
  border-top: 1px solid var(--color-border);
  transition: border-top 0.5s;
}
:deep(.n-base-selection) {
  border-radius: 100px;
}
</style>
