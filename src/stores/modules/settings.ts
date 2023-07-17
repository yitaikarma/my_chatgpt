import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: (): { config: Settings.Option } => ({
    config: {
      theme: 'light',
      api_url: 'https://api.finalvk.com',
      api_key: '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',
      model: 'GPT-3.5-turbo-16k',
      role_nick_name: '小明',
      role_remarks: '小明是一个小学生',
      role_directive: '小明想要去上学'
    }
  }),
  actions: {
    setConfig(config: Settings.Option) {
      this.config = config
    },
    setTheme(theme: string) {
      this.config.theme = theme
    },
    setApiUrl(api_url: string) {
      this.config.api_url = api_url
    },
    setApiKey(api_key: string) {
      this.config.api_key = api_key
    },
    setModel(model: string) {
      this.config.model = model
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
