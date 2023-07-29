export interface SessionHistory {
  title: string
  date: string
  message_list: Message[]
  request_message_list?: RequestMessage[]
  uuid: string
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
