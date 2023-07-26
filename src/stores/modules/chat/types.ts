export interface ChatHistory {
  title: string
  date: string
  message_list: Message[]
  request_message_list?: RequestMessage[]
}

export interface RoleOptions {
  current: ChatHistory
  history_list: ChatHistory[]
}

export interface ChatStore {
  role_collection: {
    [role: string]: RoleOptions
  }
  currentRole: string
}
