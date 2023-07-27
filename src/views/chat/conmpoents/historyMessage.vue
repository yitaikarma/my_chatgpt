<script setup lang="ts">
import { ref, toRef, nextTick } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage, NButton, NDrawer, NDrawerContent, NIcon, NSpace, NTooltip } from 'naive-ui'
import type { DrawerPlacement } from 'naive-ui'
import { DocumentEdit24Regular, Delete24Regular, Chat24Regular } from '@vicons/fluent'
import { useChatStore } from '@/stores/modules/chat'
import { scrollToBottom } from '@/utils/operationElement'

const message = useMessage()
const chatStore = useChatStore()
const { currentRole } = storeToRefs(chatStore)

const historyList = toRef(() => chatStore.getHistoryList(currentRole.value))
const active = ref(false)
const placement = ref<DrawerPlacement>('right')

defineExpose({ toggleActive })

// 切换抽屉显示状态
function toggleActive(flag = false) {
  active.value = flag
}

// 恢复历史话题
function handleRestoreTopic(index: number) {
  const messageList = chatStore.getHistoryForRole(currentRole.value, index)
  chatStore.setCurrentForRole(currentRole.value, messageList)
  active.value = false
  nextTick(() => {
    scrollToBottom('message_list', false)
  })
}

// 编辑历史话题
function handleEditHistoryItem(index: number) {
  // TODO: 编辑历史话题
  console.log('编辑历史话题', index)
  message.warning('暂未开放')
}

// 删除历史话题
function handleDeleteHistoryItem(uuid: string) {
  chatStore.deleteHistoryItem(currentRole.value, uuid)
  message.success('删除成功')
}

// 清空历史话题
function handleClearHistory() {
  chatStore.clearHistory(currentRole.value)
  message.success('清空成功')
}
</script>

<template>
  <NDrawer v-model:show="active" :width="400" :height="200" :placement="placement">
    <NDrawerContent title="历史话题">
      <template #header>
        <div class="drawer_header">
          <div class="content">
            <div class="title">历史话题</div>
            <div class="desc">{{ `chatGPT-${historyList.length}条话题` }}</div>
          </div>
          <NButton
            size="small"
            type="default"
            secondary
            round
            :focusable="false"
            @click.stop="handleClearHistory()"
          >
            清空历史
          </NButton>
        </div>
      </template>
      <div class="history-message">
        <div class="list">
          <div
            class="list-item"
            v-for="(item, i) in historyList"
            :key="i"
            @click="handleRestoreTopic(i)"
          >
            <div class="content">
              <div class="title">
                <NIcon size="20"> <Chat24Regular /> </NIcon>
                <span> {{ item.title }} </span>
              </div>
              <div class="date">{{ item.date }}</div>
            </div>
            <!-- TODO:调整为hover显示 -->
            <div class="control">
              <NSpace :size="4">
                <NTooltip trigger="hover">
                  <template #trigger>
                    <NButton
                      size="small"
                      type="default"
                      quaternary
                      circle
                      :focusable="false"
                      @click.stop="handleEditHistoryItem(i)"
                    >
                      <template #icon>
                        <NIcon> <DocumentEdit24Regular /> </NIcon>
                      </template>
                    </NButton>
                  </template>
                  编辑
                </NTooltip>
                <NTooltip trigger="hover">
                  <template #trigger>
                    <NButton
                      size="small"
                      type="error"
                      quaternary
                      circle
                      :focusable="false"
                      @click.stop="handleDeleteHistoryItem(item.uuid)"
                    >
                      <template #icon>
                        <NIcon> <Delete24Regular /> </NIcon>
                      </template>
                    </NButton>
                  </template>
                  删除
                </NTooltip>
              </NSpace>
            </div>
          </div>
        </div>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<style lang="scss" scoped>
:deep(.n-drawer-header__main) {
  width: 100%;
}
.drawer_header {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  .content {
    display: flex;
    flex-direction: column;
    gap: 5px;
    .title {
      font-size: 16px;
      font-weight: 600;
    }
    .desc {
      font-size: 12px;
      color: #999;
    }
  }
}
.history-message {
  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .list-item {
    display: flex;
    flex-direction: row;
    gap: 5px;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: #3d3d50;
    }
    .content {
      width: 80%;
      display: flex;
      flex-direction: column;
      gap: 5px;
      .title {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
        font-size: 16px;
        font-weight: 600;
        span {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
      .date {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
