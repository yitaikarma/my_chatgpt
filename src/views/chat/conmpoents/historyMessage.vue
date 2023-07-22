<script setup lang="ts">
import { DrawerPlacement, NDrawer, NDrawerContent } from 'naive-ui'
import { ref } from 'vue'
import { useChat } from '@/views/chat/hooks/useChat'

const { messageList, historyMessageList } = useChat()

const active = ref(false)
const placement = ref<DrawerPlacement>('right')

defineExpose({ toggleActive })

// 切换抽屉显示状态
function toggleActive(flag = false) {
  active.value = flag
}

// 恢复历史话题
function handleRestoreTopic(index: number) {
  messageList.value = historyMessageList.value[index].messageList
  active.value = false
}
</script>

<template>
  <NDrawer v-model:show="active" :width="400" :height="200" :placement="placement">
    <NDrawerContent title="历史话题">
      <div class="history-message">
        <div class="history-message__list">
          <div
            class="history-message__list-item"
            v-for="(item, i) in historyMessageList"
            :key="i"
            @click="handleRestoreTopic(i)"
          >
            <div class="history-message__list-item__title">{{ item.title }}</div>
            <div class="history-message__list-item__title">{{ item.date }}</div>
          </div>
        </div>
      </div>
    </NDrawerContent>
  </NDrawer>
</template>

<style lang="scss" scoped>
.history-message {
  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  &__list-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 10px;
    border-radius: 5px;
    cursor: pointer;
    &:hover {
      background-color: #515151;
    }
  }
  &__list-item__title {
    font-size: 14px;
    font-weight: 500;
  }
  &__list-item__date {
    font-size: 12px;
    color: #999;
  }
}
</style>
