<script setup lang="ts">
import { ref, toRef, watch, onBeforeMount } from 'vue'
import { useMessage, NButton, NIcon, NSpace, NTooltip, NInput } from 'naive-ui'
import { AddCircle24Regular, DocumentEdit24Regular, Delete24Regular } from '@vicons/fluent'
import { useRoleConfig } from '@/hooks/chat/core/useRoleConfig'
import { useSession } from '@/hooks/chat/core/useSession'

const message = useMessage()
const { roleConfigStore, addRole, changeRole, deleteRole } = useRoleConfig()
const { sessionStore, initRoleSession } = useSession()

const roleList = toRef(() => roleConfigStore.getRoleList)
const active = ref(false)
const editableIndex = ref(-1)

watch(editableIndex, (value) => {
  if (value !== -1) {
    document.addEventListener('click', inputCallback as EventListener)
  } else {
    document.removeEventListener('click', inputCallback as EventListener)
  }
})

defineExpose({ toggleActive })

onBeforeMount(() => {
  initRoleList()
})

const inputCallback = () => {
  if (editableIndex.value !== -1) {
    editableIndex.value = -1
  }
}

// 初始化角色列表
function initRoleList() {
  if (roleList.value.length === 0) {
    addRole()
    initRoleSession(roleConfigStore.current_role_uuid)
  }
}

// 切换抽屉显示状态
function toggleActive(flag = false) {
  active.value = flag
}

// 添加新角色
function handleAddNewRole() {
  addRole()
  initRoleSession(roleConfigStore.current_role_uuid)
}

// 切换角色
function handleChangeRole(uuid: string) {
  changeRole(uuid)
}

// 编辑角色名称
function handleRoleRename(index: number) {
  editableIndex.value = editableIndex.value === -1 ? index : -1
}

// 删除角色
function handledeleteRole(target_uuid: string) {
  if (roleList.value.length >= 2) {
    deleteRole(target_uuid)
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
    <NButton size="small" ghost type="primary" :focusable="false" @click="handleAddNewRole">
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
              @update:value="roleConfigStore.updateRoleConfigAttr('role_nick', $event, item.uuid)"
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
