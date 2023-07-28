export interface RoleChatConfig {
  model: string
  chat_theme: string
  user_nick: string
  role_nick: string
  role_remarks: string
  role_directive: string
}

export interface RoleConfig {
  date: string
  uuid: string
  chat_config: RoleChatConfig
}

export interface RoleConfigStore {
  role_list: {
    [role: string]: RoleConfig
  }
  preset_role: RoleConfig
  current_role_name: string
}
