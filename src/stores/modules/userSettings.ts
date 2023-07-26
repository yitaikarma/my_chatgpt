import { defineStore } from 'pinia'

export const useUserSettingsStore = defineStore('userSettings', {
  state: (): UserConfig => ({
    chat: {
      a: {
        model: 'gpt-3.5-turbo-16k',
        chat_theme: 'card',
        user_nick: 'You',
        role_nick: 'ChatGPT',
        role_remarks: '小明是一个小学生',
        role_directive: `You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Use markdown code block format for keywords, English words, and phrases used in your Chinese sentences in the reply. Respond using markdown. All questions should be answered in Chinese, unless the user specifically states otherwise.`
      }
    }
  }),
  getters: {
    getConfig(state) {
      return (index: string, name: keyof typeof state.chat.a) => {
        return state.chat[index][name]
      }
    }
  },
  actions: {
    setConfigForAttr(index: string, name: RoleConfigOptionKey, value: RoleConfigOptionValue) {
      this.chat[index][name] = value
    },
    setConfigForRole(index: string, role_config: RoleConfigOption) {
      this.chat[index] = role_config
    }
  },
  persist: {
    key: 'user-settings',
    storage: localStorage
    // paths: ['configure.model']
  }
})
