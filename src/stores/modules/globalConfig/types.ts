// import type { SelectOption } from 'naive-ui'

export interface GlobalConfig {
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

export interface SelectOptionCopy {
  label: string
  value: string
  disabled?: boolean
}

export interface GlobalConfigExtended extends GlobalConfig {
  api_url: string
}

export interface SelectOptionCopyState {
  theme_options: SelectOptionCopy[]
  chat_theme_options: SelectOptionCopy[]
  model_options: SelectOptionCopy[]
}

export interface GlobalState extends SelectOptionCopyState {
  config: GlobalConfig
}
