export interface ChatHistory {
  title: string
  date: string
  message_list: Message[]
  request_message_list?: RequestMessage[]
  uuid: string
}

export interface RoleOptions {
  current: ChatHistory
  history_list: ChatHistory[] | any[]
}

export interface ChatStore {
  role_collection: {
    [role: string]: RoleOptions
  }
  currentRole: string
}
