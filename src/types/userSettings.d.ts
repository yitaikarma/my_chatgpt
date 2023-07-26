declare interface RoleConfigOption {
  model: string
  chat_theme: string
  user_nick: string
  role_nick: string
  role_remarks: string
  role_directive: string
}
declare type RoleConfigOptionKey = keyof RoleConfigOption
declare type RoleConfigOptionValue = RoleConfigOption[RoleConfigOptionKey]

declare interface UserConfig {
  [key: string]: {
    [key: string]: RoleConfigOption
  }
}
