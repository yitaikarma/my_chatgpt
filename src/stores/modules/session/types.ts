export interface RequestMessage {
  role: string
  content: string
}

export interface Message {
  uuid: string
  role: string
  name?: string
  content: string
  date?: string
}

export interface SessionHistory {
  title: string
  message_list: Message[]
  request_message_list?: RequestMessage[]
  date: string
  uuid: string
  is_history: boolean
}

export interface RoleSession {
  uuid: string
  current: SessionHistory
  history_list: SessionHistory[] | any[]
}

export interface SessionStore {
  role_collection: {
    [role: string]: RoleSession
  }
  preset_role: RoleSession
  current_role_uuid: string
}
