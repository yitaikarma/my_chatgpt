import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: (): { config: Settings.Option } => ({
    config: {
      theme: 'auto',
      api_base_url: 'https://api.finalvk.com',
      api_path: '/v1/chat/completions',
      api_key: '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',
      model: 'gpt-3.5-turbo-16k',
      chat_theme: 'chat',
      user_nick: 'You',
      role_nick: 'ChatGPT',
      role_remarks: '小明是一个小学生',
      role_directive: `You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Use markdown code block format for keywords, English words, and phrases used in your Chinese sentences in the reply. Respond using markdown. All questions should be answered in Chinese, unless the user specifically states otherwise.`
    }
  }),
  getters: {
    getConfigAttr(state) {
      return (name: keyof Settings.Config) => {
        if (name === 'api_url') {
          return state.config.api_base_url + state.config.api_path
        }
        return state.config[name]
      }
    }
  },
  actions: {
    setConfig(config: Settings.Option) {
      this.config = config
    },
    setConfigAttr(name: keyof Settings.Option, value: keyof Settings.Option) {
      this.config[name] = value
    },
    setTheme(theme: string) {
      this.config.theme = theme
    },
    setApiBaseUrl(api_base_url: string) {
      this.config.api_base_url = api_base_url
    },
    setApiPath(api_path: string) {
      this.config.api_path = api_path
    },
    setApiKey(api_key: string) {
      this.config.api_key = api_key
    },
    setModel(model: string) {
      this.config.model = model
    },
    setChatTheme(chat_theme: string) {
      this.config.chat_theme = chat_theme
    },
    // 切换对话主题
    switchChatTheme() {
      if (this.config.chat_theme === 'chat') {
        this.config.chat_theme = 'Q&A'
      } else {
        this.config.chat_theme = 'chat'
      }
    },
    setUserNick(user_nick: string) {
      this.config.user_nick = user_nick
    },
    setRoleNick(role_nick: string) {
      this.config.role_nick = role_nick
    },
    setRoleRemarks(role_remarks: string) {
      this.config.role_remarks = role_remarks
    },
    setRoleDirective(role_directive: string) {
      this.config.role_directive = role_directive
    }
  },
  persist: {
    key: 'global_config',
    storage: localStorage,
    paths: [
      'config.theme',
      'config.api_base_url',
      'config.api_path',
      'config.api_key',
      'config.model',
      'config.chat_theme',
      'config.user_nick',
      'config.role_nick',
      'config.role_remarks',
      'config.role_directive'
    ]
  }
})
