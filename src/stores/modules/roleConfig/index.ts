import { defineStore } from 'pinia'
import type { RoleConfigStore, RoleConfig, RoleChatConfig } from './types'

export const useRoleConfigStore = defineStore('role_config', {
  state: (): RoleConfigStore => ({
    role_list: {
      role: {
        date: '',
        uuid: '',
        chat_config: {
          model: 'gpt-3.5-turbo-16k',
          chat_theme: 'card',
          user_nick: 'You',
          role_nick: 'ChatGPT',
          role_remarks: '小明是一个小学生',
          role_directive: `You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Use markdown code block format for keywords, English words, and phrases used in your Chinese sentences in the reply. Respond using markdown. All questions should be answered in Chinese, unless the user specifically states otherwise.`
        }
      }
    },
    current_role: 'role'
  }),

  getters: {
    // 获取角色的某个属性
    getRoleConfigForAttr({ role_list, current_role }) {
      return (configProp: keyof RoleChatConfig) => {
        return role_list[current_role].chat_config[configProp]
      }
    },
    // 获取角色配置
    getRoleForAttr({ role_list, current_role }) {
      return (prop: keyof RoleConfig) => {
        return role_list[current_role][prop]
      }
    },
    // 获取角色
    getRole({ role_list, current_role }) {
      return role_list[current_role]
    },
    // 获取角色列表
    getRoleList({ role_list }) {
      return role_list
    }
  },

  actions: {
    // 更新角色配置的某个属性
    updateRoleConfigForAttr<T extends keyof RoleChatConfig>(
      config_prop: T,
      value: RoleChatConfig[T]
    ) {
      this.role_list[this.current_role].chat_config[config_prop] = value
    },
    // 更新角色配置的某个属性
    updateRoleConfig<T extends keyof RoleConfig>(prop: T, data: RoleConfig[T]) {
      this.role_list[this.current_role][prop] = data
    },
    // 更新角色
    updateRole(config: RoleConfig) {
      this.role_list[this.current_role] = config
    },
    // 添加角色
    addRole(role_name: string, config: RoleConfig) {
      this.role_list[role_name] = config
    }
  },
  persist: {
    key: 'role_config',
    storage: localStorage
    // paths: ['chat']
  }
})
