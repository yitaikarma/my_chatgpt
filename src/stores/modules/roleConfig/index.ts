import { defineStore } from 'pinia'
import type { RoleConfigStore, RoleConfig, RoleChatConfig } from './types'

export const useRoleConfigStore = defineStore('role_config', {
  state: (): RoleConfigStore => ({
    role_list: [],
    preset_role: {
      sort: 0,
      prev_role_uuid: '',
      next_role_uuid: '',
      uuid: '',
      date: '',
      session_config: {
        greetings_text: '任何问题都可以问我，我会尽力回答的。',
        wait_text: '正在绞尽脑汁...',
        model: 'gpt-3.5-turbo-16k',
        chat_theme: 'card',
        user_nick: 'You',
        role_nick: 'ChatGPT',
        role_remarks: '小明是一个小学生',
        role_directive: `You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Use markdown code block format for keywords, English words, and phrases used in your Chinese sentences in the reply. Respond using markdown. All questions should be answered in Chinese, unless the user specifically states otherwise.`
      }
    },
    first_role_uuid: '',
    last_role_uuid: '',
    current_role_uuid: 'role'
  }),

  getters: {
    // 获取角色索引
    getRoleIndex({ role_list, current_role_uuid }) {
      return (uuid?: string) =>
        role_list.findIndex((role) => role.uuid === (uuid || current_role_uuid))
    },

    // 获取角色配置的某个属性
    getRoleConfigAttr({ role_list }) {
      return (configProp: keyof RoleChatConfig, uuid?: string) => {
        const index = this.getRoleIndex(uuid)
        return role_list[index].session_config[configProp]
      }
    },

    // 获取角色的某个属性
    getRoleAttr({ role_list }) {
      return <T extends keyof RoleConfig>(prop: T, uuid?: string): RoleConfig[T] => {
        const index = this.getRoleIndex(uuid)
        return role_list[index][prop]
      }
    },

    // 获取角色,默认当前角色
    getRole({ role_list }) {
      return (uuid?: string) => {
        const index = this.getRoleIndex(uuid)
        return role_list[index]
      }
    },

    // 获取角色列表
    getRoleList({ role_list }) {
      return role_list
    },

    // 获取预设角色
    getPresetRole({ preset_role }) {
      return preset_role
    }
  },

  actions: {
    // 更新角色配置的某个属性
    updateRoleConfigAttr<T extends keyof RoleChatConfig>(
      config_prop: T,
      value: RoleChatConfig[T],
      uuid?: string
    ) {
      const index = this.getRoleIndex(uuid)
      this.role_list[index].session_config[config_prop] = value
    },

    // 更新角色的某个属性
    updateRoleAttr<T extends keyof RoleConfig>(prop: T, data: RoleConfig[T], uuid?: string) {
      const index = this.getRoleIndex(uuid)
      this.role_list[index][prop] = data
    },

    // 更新角色上一个角色UUID
    updateRolePrevUUID(uuid: string, prev_uuid: string) {
      const index = this.getRoleIndex(uuid)
      this.role_list[index].prev_role_uuid = prev_uuid
    },

    // 更新角色下一个角色UUID
    updateRoleNextUUID(uuid: string, next_uuid: string) {
      const index = this.getRoleIndex(uuid)
      this.role_list[index].next_role_uuid = next_uuid
    },

    // 更新角色
    updateRole(config: RoleConfig, uuid?: string) {
      const index = this.getRoleIndex(uuid)
      this.role_list[index] = config
    },

    // 添加角色
    addRole(config: RoleConfig) {
      this.role_list.push(config)
    },

    // 删除角色
    deleteRole(uuid: string) {
      const index = this.getRoleIndex(uuid)
      // delete this.role_list[index]
      this.role_list.splice(index, 1)
    },

    // 更新预设角色
    updatePresetRole(config: RoleConfig) {
      this.preset_role = config
    },

    // 更新当前角色UUID
    updateCurrentRoleUUID(uuid: string) {
      this.current_role_uuid = uuid
    },

    // 更新全局属性
    updateGlobalAttr<T extends keyof RoleConfigStore>(prop: T, data: RoleConfigStore[T]) {
      ;(this as any)[prop] = data
    }
  },

  persist: {
    key: 'role_config',
    storage: localStorage
    // paths: ['chat']
  }
})
