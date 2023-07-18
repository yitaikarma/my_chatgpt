import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: (): { config: Settings.Option } => ({
    config: {
      theme: 'auto',
      api_base_url: 'https://api.finalvk.com',
      api_path: '/v1/chat/completions',
      api_key: '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',
      model: 'gpt-3.5-turbo-16k',
      user_nick_name: 'You',
      role_nick_name: 'ChatGPT',
      role_remarks: '小明是一个小学生',
      role_directive: `You are ChatGPT, a large language model trained by OpenAI. Follow the user's instructions carefully. Respond using markdown. All questions should be answered in Chinese, unless the user specifically states otherwise.`
    }
  }),
  actions: {
    setConfig(config: Settings.Option) {
      this.config = config
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
    setUserNickName(user_nick_name: string) {
      this.config.user_nick_name = user_nick_name
    },
    setRoleNickName(role_nick_name: string) {
      this.config.role_nick_name = role_nick_name
    },
    setRoleRemarks(role_remarks: string) {
      this.config.role_remarks = role_remarks
    },
    setRoleDirective(role_directive: string) {
      this.config.role_directive = role_directive
    }
  }
})
