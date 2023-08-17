<script setup lang="ts">
import RoleSettings from '@/views/chat/conmpoents/roleSettings.vue'
import HistoryMessage from '@/views/chat/conmpoents/historyMessage.vue'
import {
  ChatSettings24Regular,
  StyleGuide24Regular,
  DarkTheme24Regular,
  DocumentBulletListClock24Regular,
  FormNew24Regular,
  Stop24Filled
} from '@vicons/fluent'
import { useConfig } from '@/hooks/chat/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useSession } from '@/hooks/chat/useSession'
import { useChat } from '@/hooks/chat/useChat'
import { useSessionSwitchLayoutAnimation } from '@/hooks/useAnimation'

const message = useMessage()
const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { sessionStore, initSession, seveSession } = useSession()
const { initChatStatus, abortMessage } = useChat()

const userSettingsModalRef = ref<InstanceType<typeof RoleSettings> | null>()
const historyMsgRef = ref<InstanceType<typeof HistoryMessage> | null>()

const modelOptions = globalConfigStore.model_options
const currentThemeName = computed(() => globalConfigStore.getOptionItem('theme')?.label)
const currentChatThemeName = computed(() => globalConfigStore.getOptionItem('chat_theme')?.label)
const sessionConfigModel = computed({
  get: () => roleConfigStore.getRoleConfigAttr('model'),
  set: (value) => roleConfigStore.updateRoleConfigAttr('model', value)
})

// 打开角色设置
function handleOpenRoleSettings() {
  userSettingsModalRef.value?.openSettings()
}

// 风格切换
function handleStyleChange() {
  // 全局切换
  globalConfigStore.switchChatTheme()

  nextTick(() => {
    useSessionSwitchLayoutAnimation()
  })
}

// 主题切换
function handleThemeChange() {
  const theme = globalConfigStore.getConfigAttr('theme')

  switch (theme) {
    case 'light':
      globalConfigStore.updateConfigAttr('theme', 'dark')
      break

    case 'dark':
      globalConfigStore.updateConfigAttr('theme', 'shallow_dark')
      break

    case 'shallow_dark':
      globalConfigStore.updateConfigAttr('theme', 'blue_dark')
      break

    case 'blue_dark':
      globalConfigStore.updateConfigAttr('theme', 'auto')
      break

    default:
      globalConfigStore.updateConfigAttr('theme', 'light')
      break
  }
}

// 历史话题
function handleOpenHistorySession() {
  historyMsgRef.value?.toggleActive(true)
}

// 新话题
function handleNewSession() {
  sessionStore.getRequesting && abortMessage()
  seveSession()
  initSession()
  initChatStatus()
}
// 终止正在进行的消息请求
function handleAbortMessage() {
  if (!sessionStore.getRequesting) {
    message.warning('当前没有正在进行的消息请求')
  } else {
    abortMessage()
  }
}
</script>

<template>
  <div class="toolbar">
    <NSpace>
      <NTooltip trigger="hover" :delay="1000">
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
      <NTooltip trigger="hover" :delay="1000">
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
        布局：{{ currentChatThemeName }}
      </NTooltip>
      <NTooltip trigger="hover" :delay="1000">
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
        主题：{{ currentThemeName }}
      </NTooltip>
      <NTooltip trigger="hover" :delay="1000">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="default"
            round
            :focusable="false"
            @click="handleOpenHistorySession"
          >
            <template #icon>
              <NIcon> <DocumentBulletListClock24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        历史话题
      </NTooltip>
      <NTooltip trigger="hover" :delay="1000">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="primary"
            round
            :focusable="false"
            @click="handleNewSession"
          >
            <template #icon>
              <NIcon> <FormNew24Regular /> </NIcon>
            </template>
          </NButton>
        </template>
        新话题
      </NTooltip>
      <NTooltip trigger="hover" :delay="1000">
        <template #trigger>
          <NButton
            ghost
            size="small"
            type="error"
            round
            :focusable="false"
            @click="handleAbortMessage"
          >
            <template #icon>
              <NIcon> <Stop24Filled /> </NIcon>
            </template>
          </NButton>
        </template>
        终止消息请求
      </NTooltip>
    </NSpace>
    <NSpace>
      <NTooltip trigger="hover" :delay="1000">
        <template #trigger>
          <NSelect
            size="small"
            v-model:value="sessionConfigModel"
            :options="modelOptions"
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
