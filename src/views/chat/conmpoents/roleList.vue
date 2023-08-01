<script setup lang="ts">
import { ref, toRef, nextTick, watch, onBeforeMount } from 'vue'
import { useMessage, NButton, NIcon, NSpace, NTooltip, NInput } from 'naive-ui'
import { AddCircle24Regular, DocumentEdit24Regular, Delete24Regular } from '@vicons/fluent'
import { useRoleConfig } from '@/hooks/chat/core/useRoleConfig'
import { useSession } from '@/hooks/chat/core/useSession'
import { useAnimation } from '@/hooks/useAnimation'

import { scrollToBottom } from '@/utils/operationElement'

const message = useMessage()
const { roleConfigStore, addNewRole } = useRoleConfig()
const { sessionStore, initRoleSession } = useSession()

const roleList = toRef(() =>
  Object.values(roleConfigStore.getRoleList).sort((a, b) => a.sort - b.sort)
)
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

const inputCallback = () => {
  if (editableIndex.value !== -1) {
    editableIndex.value = -1
  }
}

onBeforeMount(() => {
  if (roleList.value.length === 0) {
    initRoleList()
  }
})

// 初始化角色列表
function initRoleList() {
  addNewRole()
  initRoleSession(roleConfigStore.current_role_uuid)
  nextTick(() => {
    scrollToBottom('message_list', false)
  })
}

// 切换抽屉显示状态
function toggleActive(flag = false) {
  active.value = flag
}

// 添加新角色
function handleAddNewRole() {
  addNewRole()
  initRoleSession(roleConfigStore.current_role_uuid)
  nextTick(() => {
    let counter = -1

    const messageListEl = document.querySelectorAll('.message_item')

    const createAnimation = (element: HTMLElement, distance: number) => {
      counter++
      useAnimation(
        element,
        [
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 300, delay: counter * 20 },
        () => (element.style.opacity = '0'),
        () => (element.style.opacity = 'initial')
      )
    }

    const messageElementLength = messageListEl.length

    for (let i = 0; i < messageElementLength; i++) {
      const element = messageListEl[i]

      createAnimation(element as HTMLElement, 20)
    }
    scrollToBottom('message_list', false)
  })
}

// 切换角色
function handleChangeRole(uuid: string) {
  if (uuid === roleConfigStore.current_role_uuid) return
  sessionStore.updateCurrentRoleUUID(uuid)
  roleConfigStore.updateCurrentRoleUUID(uuid)

  nextTick(() => {
    let counter = -1

    const messageListEl = document.querySelectorAll('.message_item')

    const createAnimation = (element: HTMLElement, distance: number) => {
      counter++
      useAnimation(
        element,
        [
          { opacity: 0, transform: `translateY(${distance}px)` },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 300, delay: counter * 20 },
        () => (element.style.opacity = '0'),
        () => (element.style.opacity = 'initial')
      )
    }

    const messageElementLength = messageListEl.length

    for (let i = 0; i < messageElementLength; i++) {
      const element = messageListEl[i]

      createAnimation(element as HTMLElement, 20)
    }
    scrollToBottom('message_list', false)
  })
}

// 角色重命名
function handleRoleRename(index: number) {
  editableIndex.value = editableIndex.value === -1 ? index : -1
  message.warning('暂未开放')
}

// 删除角色
function handledeleteRole(target_uuid: string) {
  // TODO:排序问题
  if (roleList.value.length >= 2) {
    const { prev_role_uuid, next_role_uuid } = roleConfigStore.getRole(target_uuid)

    // 如果删除当前角色，需要切换到下一个角色，如果没有下一个角色，切换到上一个角色
    if (roleConfigStore.current_role_uuid === target_uuid) {
      const toRoleUuid = next_role_uuid ? next_role_uuid : prev_role_uuid
      handleChangeRole(toRoleUuid)
    }

    // 重新关联前后角色的uuid
    prev_role_uuid && roleConfigStore.updateRoleNextUUID(prev_role_uuid, next_role_uuid)
    next_role_uuid && roleConfigStore.updateRolePrevUUID(next_role_uuid, prev_role_uuid)
    // 更新第一个角色和最后一个角色的uuid
    prev_role_uuid || roleConfigStore.updateGlobalAttr('first_role_uuid', next_role_uuid)
    next_role_uuid || roleConfigStore.updateGlobalAttr('last_role_uuid', prev_role_uuid)

    roleConfigStore.deleteRole(target_uuid)
    sessionStore.deleteRole(target_uuid)
    message.success('删除成功')
  } else {
    message.warning('至少保留一个角色')
  }
}
</script>

<template>
  <div class="drawer_header">
    <div class="content">
      <div class="title">角色列表</div>
      <div class="desc">{{ `${roleList.length}个角色` }}</div>
    </div>
    <NButton size="small" type="default" secondary :focusable="false" @click="handleAddNewRole">
      <template #icon>
        <NIcon> <AddCircle24Regular /> </NIcon>
      </template>
      新角色
    </NButton>
  </div>
  <div class="history-message">
    <div class="list">
      <div
        class="list-item"
        :cureent_session="item.uuid === roleConfigStore.current_role_uuid"
        v-for="(item, i) in roleList"
        :key="i"
        @click="handleChangeRole(item.uuid)"
      >
        <div class="avatar">
          <img src="@/assets/svg/chatgpt.svg" alt="" />
        </div>
        <div class="content">
          <div class="title">
            <span v-show="i !== editableIndex"> {{ item.session_config.role_nick }} </span>
            <!-- FIXME:清空名字后，失去占位问题，应预设默认名字 -->
            <NInput
              v-if="i === editableIndex"
              size="small"
              type="text"
              autofocus
              placeholder="请输入话题标题"
              :value="item.session_config.role_nick"
              @update:value="roleConfigStore.updateRoleAttrAttr('role_nick', $event, item.uuid)"
              @blur="editableIndex = -1"
              @click.stop
            />
          </div>
          <div class="info">
            <div class="desc">
              <div class="history_total">
                {{
                  `${sessionStore.getRoleSession(item.uuid).history_list.length}个历史话题,
                  ${sessionStore.getRoleSession(item.uuid).current.message_list.length - 1}条会话`
                }}
              </div>
            </div>
            <div class="date">{{ item.date }}</div>
          </div>
        </div>
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
                  @click.stop="handleRoleRename(i)"
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
                  @click.stop="handledeleteRole(item.uuid)"
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
  margin-bottom: 10px;
  .content {
    display: flex;
    flex-direction: column;
    // gap: 5px;
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
    cursor: pointer;
    position: relative;
    display: flex;
    flex-direction: row;
    gap: 5px;
    padding: 10px;
    border-radius: 5px;
    & {
      --is-hide: initial;
    }
    &[cureent_session='true'] {
      outline: 2px solid var(--color-msg-ctn-border-1);
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
    }

    .content {
      width: 80%;
      display: flex;
      flex-direction: column;
      // gap: 5px;
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
      .info {
        position: relative;
        height: min-content;
        .desc {
          position: absolute;
          font-size: 12px;
          color: #999;
          transition: color 0.1s;
        }
        .date {
          // position: absolute;
          text-align: right;
          font-size: 12px;
          color: #9990;
          transition: color 0.1s;
        }
      }
    }

    .control {
      visibility: hidden;
      position: absolute;
      top: 0;
      right: 0;
      padding: 0 10px;
      border-radius: 100px;
    }

    &:hover {
      background-color: var(--color-bg-hover);
      .content .info {
        .desc {
          color: #9990;
        }
        .date {
          color: #999;
        }
      }
      .control {
        visibility: initial;
      }
    }
  }
}
</style>
