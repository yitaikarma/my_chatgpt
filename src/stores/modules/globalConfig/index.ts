import { defineStore } from 'pinia'
import type { GlobalState, GlobalConfig, GlobalConfigExtended } from './types'

export const useGlobalConfig = defineStore('globalConfig', {
  state: (): GlobalState => ({
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
    },
    theme_options: [
      { value: 'auto', label: '自动' },
      { value: 'light', label: '浅色' },
      { value: 'dark', label: '深色' },
      { value: 'shallow_dark', label: '深灰色' },
      { value: 'blue_dark', label: '深蓝色' }
    ],
    chat_theme_options: [
      { value: 'chat', label: '聊天' },
      { value: 'Q&A', label: '问答' }
    ],
    model_options: [
      { label: 'GPT-3.5', value: 'gpt-3.5' },
      { label: 'GPT-3.5-Turbo', value: 'gpt-3.5-turbo' },
      { label: 'GPT-3.5-Turbo-0613', value: 'gpt-3.5-turbo-0613' },
      { label: 'GPT-3.5-Turbo-16k', value: 'gpt-3.5-turbo-16k' },
      { label: 'GPT-3.5-Turbo-16k-0613', value: 'gpt-3.5-turbo-16k-0613' },
      { label: 'GPT-4', value: 'gpt-4', disabled: true },
      { label: 'GPT-4-0613', value: 'gpt-4-0613', disabled: true },
      { label: 'GPT-4-32k', value: 'gpt-4-32k', disabled: true },
      { label: 'GPT-4-32k-0613', value: 'gpt-4-32k-0613', disabled: true }
    ]
  }),

  getters: {
    // 获取全局配置的某个属性
    getConfigAttr({ config }) {
      return (name: keyof GlobalConfigExtended) => {
        if (name === 'api_url') {
          return config.api_base_url + config.api_path
        }
        return config[name]
      }
    }
  },

  actions: {
    // 更新全局配置
    updateConfig(config: GlobalConfig) {
      this.config = config
    },

    // 更新全局配置的某个属性
    updateConfigAttr<T extends keyof GlobalConfig>(name: T, value: GlobalConfig[T]) {
      this.config[name] = value
    },

    // 切换对话主题
    switchChatTheme() {
      if (this.config.chat_theme === 'chat') {
        this.config.chat_theme = 'Q&A'
      } else {
        this.config.chat_theme = 'chat'
      }
    }
  },

  persist: {
    key: 'global_config',
    storage: localStorage,
    paths: ['config']
  }
})
