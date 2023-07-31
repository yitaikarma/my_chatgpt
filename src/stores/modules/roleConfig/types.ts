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
  sort: number
  prev_role_uuid: string
  next_role_uuid: string
  date: string
  uuid: string
  session_config: RoleChatConfig
}

export interface RoleConfigStore {
  role_list: {
    [uuid: string]: RoleConfig
  }
  preset_role: RoleConfig
  first_role_uuid: string
  last_role_uuid: string
  current_role_uuid: string
}

export interface RoleConfigStoreGetter {
  getRoleConfigAttr: (configProp: keyof RoleChatConfig, uuid?: string) => string
  getRoleAttr: (prop: keyof RoleConfig, uuid?: string) => string
  getRole: (uuid: string) => RoleConfig
  getCurrentRole: () => RoleConfig
  getRoleList: () => { [uuid: string]: RoleConfig }
  getPresetRole: () => RoleConfig
}

export interface RoleConfigStoreAction {
  addRole: (uuid: string, role: RoleConfig) => void
  updateRole: (uuid: string, role: RoleConfig) => void
  updateRoleAttr: (uuid: string, prop: keyof RoleConfig, value: string) => void
  updateRoleConfigAttr: (uuid: string, prop: keyof RoleChatConfig, value: string) => void
  updateRolePrevUUID: (uuid: string, prevUUID: string) => void
  updateRoleNextUUID: (uuid: string, nextUUID: string) => void
  updateCurrentRoleUUID: (uuid: string) => void
  deleteRole: (uuid: string) => void
  deleteAllRole: () => void
  deleteAllRoleExceptPresetRole: () => void
}
