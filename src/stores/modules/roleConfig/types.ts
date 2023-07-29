export interface RoleChatConfig {
  greetings_text: string
  wait_text: string
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
  session_config: RoleChatConfig
}

export interface RoleConfigStore {
  role_list: {
    [role: string]: RoleConfig
  }
  preset_role: RoleConfig
  current_role_uuid: string
}
