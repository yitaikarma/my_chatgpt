import type { SelectOption } from 'naive-ui'

export interface GloablConfig {
  theme: string
  api_base_url: string
  api_path: string
  api_key: string
  model: string
  chat_theme: string
  user_nick: string
  role_nick: string
  role_remarks: string
  role_directive: string
}
export interface GlobalConfigExtended extends GloablConfig {
  api_url: string
}

export interface GloablState {
  config: GloablConfig
  theme_options: SelectOption[]
  chat_theme_options: SelectOption[]
  model_options: SelectOption[]
}
