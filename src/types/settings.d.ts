declare namespace Settings {
  type base_url = string
  interface Option {
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
  interface Config extends Option {
    api_url: string
  }
}
