import { defineStore } from 'pinia'
import type { SessionStore, SessionHistory, RoleSession, Message, RequestMessage } from './types'

export const useSessionStore = defineStore('session', {
  state: (): SessionStore => ({
    preset_role: {
      uuid: '',
      current: {
        title: '',
        message_list: [],
        request_message_list: [],
        uuid: '',
        date: '',
        is_history: false
      },
      history_list: []
    },
    role_collection: {},
    current_role_uuid: 'role',
    question_text: '',
    requesting: false
  }),

  getters: {
    // 获取请求状态
    getRequesting({ requesting }) {
      return requesting
    },

    // 获取输入框的问题文本
    getQuestionText({ question_text }) {
      return question_text
    },

    // 获取角色索引
    getSessionIndex({ role_collection, current_role_uuid }) {
      return (uuid: string) => {
        return role_collection[current_role_uuid].history_list.findIndex(
          (session) => session.uuid === uuid
        )
      }
    },

    // 获取历史的某个属性
    getHistoryAttr({ role_collection, current_role_uuid }) {
      return <T extends keyof SessionHistory>(index: number, prop: T, uuid?: string) => {
        return role_collection[uuid || current_role_uuid].history_list[index][prop]
      }
    },

    // 获取某个历史
    getHistory({ role_collection, current_role_uuid }) {
      return (index: number, uuid?: string) => {
        return role_collection[uuid || current_role_uuid].history_list[index]
      }
    },

    // 获取历史列表
    getHistoryList({ role_collection, current_role_uuid }) {
      return (uuid?: string) => role_collection[uuid || current_role_uuid].history_list
    },

    // 获取当前会话属性
    getCurrentSessionAttr({ role_collection, current_role_uuid }) {
      return <T extends keyof SessionHistory>(prop: T, uuid?: string) => {
        return role_collection[uuid || current_role_uuid].current[prop]
      }
    },

    // 获取当前角色的当前会话
    getCurrentSession({ role_collection, current_role_uuid }) {
      return role_collection[current_role_uuid].current
    },

    // 获取某个角色会话
    getRoleSession({ role_collection }) {
      return (role_uuid: string) => role_collection[role_uuid]
    }
  },

  actions: {
    // 设置请求状态
    setRequesting(requesting: boolean) {
      this.requesting = requesting
    },

    // 更新输入框的问题文本
    setQuestionText(text: string) {
      this.question_text = text
    },

    // 更新历史的属性
    updateHistoryAttr<T extends keyof SessionHistory>(
      index: number,
      prop: T,
      data: SessionHistory[T],
      uuid?: string
    ) {
      this.role_collection[uuid || this.current_role_uuid].history_list[index][prop] = data
    },

    // 更新历史
    updateHistory(index: number, history: SessionHistory, uuid?: string) {
      this.role_collection[uuid || this.current_role_uuid].history_list[index] = history
    },

    // 增加历史
    pushHistory(history: SessionHistory, uuid?: string) {
      this.role_collection[uuid || this.current_role_uuid].history_list.push(history)
    },

    // 删除历史
    deleteHistory(session_uuid: string, uuid?: string) {
      const index = this.role_collection[uuid || this.current_role_uuid].history_list.findIndex(
        (item) => item.uuid === session_uuid
      )

      this.role_collection[uuid || this.current_role_uuid].history_list.splice(index, 1)
    },

    // 清空角色的历史
    clearRoleHistory(uuid?: string) {
      this.role_collection[uuid || this.current_role_uuid].history_list = []
    },

    // 更新当前的某个属性
    updateCurrentSessionAttr<T extends keyof SessionHistory>(
      prop: T,
      data: SessionHistory[T] | SessionHistory[T][],
      uuid?: string
    ) {
      if (Array.isArray(data)) {
        // this[uuid].current[prop].push(data)
        ;(
          this.role_collection[uuid || this.current_role_uuid].current[prop] as (
            | Message
            | RequestMessage
          )[]
        ).push(...(data as (Message | RequestMessage)[]))
      } else {
        this.role_collection[uuid || this.current_role_uuid].current[prop] = data
      }
    },

    // 更新角色的当前会话
    updateCurrentRoleSession(session: SessionHistory, uuid?: string) {
      this.role_collection[uuid || this.current_role_uuid].current = session
    },

    // 把当前对话增加到历史列表
    updateCurrentSessionToHistory(uuid?: string) {
      const role_uuid = uuid || this.current_role_uuid
      this.role_collection[role_uuid].history_list.push({
        ...this.role_collection[role_uuid].current,
        title: this.role_collection[role_uuid].current.message_list[1].content,
        // 以结束话题的时间作为日期
        date: new Date().toLocaleString(),
        is_history: true
      })
    },

    // 更新当前角色UUID
    updateCurrentRoleUUID(uuid: string) {
      this.current_role_uuid = uuid
    },

    // 更新当前角色
    updateCurrentRole(uuid: string, role: RoleSession) {
      this.role_collection[this.current_role_uuid] = role
    },

    // 删除角色
    deleteRole(uuid?: string) {
      delete this.role_collection[uuid || this.current_role_uuid]
    },

    // 删除角色某条消息
    deleteCurrentMessage(index: number) {
      const current_session_uuid = this.role_collection[this.current_role_uuid].current.uuid

      // 删除当前会话的消息
      this.role_collection[this.current_role_uuid].current.message_list.splice(index, 1)
      this.role_collection[this.current_role_uuid].current.request_message_list?.splice(index, 1)

      // 删除历史会话的消息
      this.role_collection[this.current_role_uuid].history_list.forEach((item) => {
        if (item.uuid === current_session_uuid) {
          item.message_list.splice(index, 1)
          item.request_message_list?.splice(index, 1)
        }
      })
    }
  },

  persist: {
    key: 'session_list',
    storage: localStorage
    // paths: ['history', 'current']
  }
})
