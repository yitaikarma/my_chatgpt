<script setup lang="ts">
import { ref, toRef, nextTick, watch } from 'vue'
import {
  useMessage,
  NButton,
  NDrawer,
  NDrawerContent,
  NIcon,
  NSpace,
  NTooltip,
  NInput
} from 'naive-ui'
import { DocumentEdit24Regular, Delete24Regular, Chat24Regular } from '@vicons/fluent'
import { useSession } from '@/hooks/chat/useSession'
import { useEachElement, useInitListAnimation } from '@/hooks/useAnimation'
import { scrollToBottom } from '@/utils/operationElement'

const message = useMessage()
const { sessionStore } = useSession()

const historyList = toRef(() => sessionStore.getHistoryList())
const active = ref(false)
const editableIndex = ref(-1)

defineExpose({ toggleActive })

watch(editableIndex, (value) => {
  if (value !== -1) {
    document.addEventListener('click', inputCallback as EventListener)
  } else {
    document.removeEventListener('click', inputCallback as EventListener)
  }
})

// 切换抽屉显示状态
function toggleActive(flag = false) {
  active.value = flag

  if (flag) {
    nextTick(() => {
      useEachElement('history_list', (child) => {
        child.style.opacity = '0'
      })
    })
  }
}

// 打开历史消息抽屉后
function handleAfterEnter() {
  nextTick(() => {
    useInitListAnimation('history_list')
  })
}

// 恢复历史话题
function handleRestoreTopic(index: number) {
  const messageList = sessionStore.getCurrentSessionAttr('message_list')
  const currentSession = sessionStore.getCurrentSession

  if (messageList.length > 2) {
    // 未进行过对话，不保存
    if (!currentSession.is_history) {
      sessionStore.updateCurrentSessionToHistory()
    }
  }

  const sessions = sessionStore.getHistory(index)
  sessionStore.updateCurrentRoleSession(sessions)

  const changeDirection = sessionStore.getSessionIndex(currentSession.uuid) > index ? 'up' : 'down'

  nextTick(() => {
    scrollToBottom('message_list', false)
    useInitListAnimation('message_list', changeDirection)
  })
}

// 点击输入框外，取消编辑状态
const inputCallback = () => {
  if (editableIndex.value !== -1) {
    editableIndex.value = -1
  }
}

// 编辑历史话题
function handleEditHistoryItem(index: number) {
  editableIndex.value = editableIndex.value === -1 ? index : -1
  // message.warning('暂未开放')
}

// 删除历史话题
function handledeleteHistory(uuid: string) {
  // FIXME: 删除当前话题的历史时，切换话题会把当前话题当做新话题保存到历史中
  sessionStore.deleteHistory(uuid)
  message.success('删除成功')
}

// 清空历史话题
function handleclearRoleHistory() {
  sessionStore.clearRoleHistory()
  message.success('清空成功')
}
</script>

<template>
  <NDrawer
    v-model:show="active"
    :width="400"
    :height="200"
    placement="right"
    :on-after-enter="handleAfterEnter"
  >
    <NDrawerContent title="历史话题" :native-scrollbar="false">
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
            @click.stop="handleclearRoleHistory()"
          >
            清空历史
          </NButton>
        </div>
      </template>
      <div id="history_list" class="history_list">
        <div
          class="history_item"
          v-for="(item, i) in historyList"
          :key="i"
          @click="handleRestoreTopic(i)"
        >
          <div class="content">
            <div class="title">
              <NIcon size="20"> <Chat24Regular /> </NIcon>
              <span v-show="i !== editableIndex"> {{ item.title }} </span>
              <NInput
                v-if="i === editableIndex"
                size="small"
                type="text"
                autofocus
                placeholder="请输入话题标题"
                :value="item.title"
                @update:value="sessionStore.updateHistoryAttr(i, 'title', $event)"
                @blur="editableIndex = -1"
                @click.stop
              />
            </div>
            <div class="date">{{ item.date }}</div>
          </div>
          <!-- TODO:调整为hover显示 -->
          <div class="control">
            <NSpace :size="4" :wrap="false">
              <NTooltip trigger="hover" :delay="1000">
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
                编辑标题
              </NTooltip>
              <NTooltip trigger="hover" :delay="1000">
                <template #trigger>
                  <NButton
                    size="small"
                    type="error"
                    quaternary
                    circle
                    :focusable="false"
                    @click.stop="handledeleteHistory(item.uuid)"
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

.history_list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.history_item {
  display: flex;
  flex-direction: row;
  gap: 5px;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: var(--color-bg-hover);
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
</style>
