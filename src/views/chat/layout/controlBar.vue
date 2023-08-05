<script setup lang="ts">
import RoleSettings from '@/views/chat/conmpoents/roleSettings.vue'
import HistoryMessage from '@/views/chat/conmpoents/historyMessage.vue'
import { ref, computed, nextTick } from 'vue'
import { NButton, NIcon, NSelect, NSpace, NTooltip } from 'naive-ui'
import {
  ChatSettings24Regular,
  StyleGuide24Regular,
  DarkTheme24Regular,
  DocumentBulletListClock24Regular,
  FormNew24Regular
} from '@vicons/fluent'
import { useConfig } from '@/hooks/chat/useGlobalConfig'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useChat } from '@/hooks/chat/useChat'
import { useSessionSwitchLayoutAnimation } from '@/hooks/useAnimation'

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const { initMessage, clearMessage, seveMessage } = useChat()

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
            @click="handleOpenHistoryMessage"
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
