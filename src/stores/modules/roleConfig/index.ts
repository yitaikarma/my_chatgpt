import { defineStore } from 'pinia'
import type { RoleConfigStore, RoleConfig, RoleChatConfig } from './types'

export const useRoleConfigStore = defineStore('role_config', {
  state: (): RoleConfigStore => ({
    role_list: {},
    preset_role: {
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
    current_role_uuid: 'role'
  }),

  getters: {
    // 获取角色配置的某个属性
    getRoleConfigAttr({ role_list, current_role_uuid }) {
      return (configProp: keyof RoleChatConfig, uuid?: string) => {
        return role_list[uuid || current_role_uuid].session_config[configProp]
      }
    },

    // 获取角色的某个属性
    getRoleAttr({ role_list, current_role_uuid }) {
      return (prop: keyof RoleConfig, uuid?: string) => {
        return role_list[uuid || current_role_uuid][prop]
      }
    },

    // 获取角色
    getRole({ role_list }) {
      return (uuid: string) => role_list[uuid]
    },

    // 获取当前角色
    getCurrentRole({ role_list, current_role_uuid }) {
      return role_list[current_role_uuid]
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
    updateRoleAttrAttr<T extends keyof RoleChatConfig>(
      config_prop: T,
      value: RoleChatConfig[T],
      uuid?: string
    ) {
      this.role_list[uuid || this.current_role_uuid].session_config[config_prop] = value
    },

    // 更新角色的某个属性
    updateRoleAttr<T extends keyof RoleConfig>(prop: T, data: RoleConfig[T], uuid?: string) {
      this.role_list[uuid || this.current_role_uuid][prop] = data
    },

    // 更新角色
    updateRole(config: RoleConfig, uuid?: string) {
      this.role_list[uuid || this.current_role_uuid] = config
    },

    // 添加角色
    addRole(role_name: string, config: RoleConfig) {
      this.updateCurrentRoleUUID(role_name)
      this.role_list[role_name] = config
    },

    // 删除角色
    deleteRole(role_name: string) {
      delete this.role_list[role_name]
    },

    // 更新预设角色
    updatePresetRole(config: RoleConfig) {
      this.preset_role = config
    },

    // 更新当前角色UUID
    updateCurrentRoleUUID(uuid: string) {
      this.current_role_uuid = uuid
    }
  },

  persist: {
    key: 'role_config',
    storage: localStorage
    // paths: ['chat']
  }
})
