import { defineStore } from 'pinia'
import type { SessionStore, SessionHistory, RoleSession } from './types'

export const useSessionStore = defineStore('session', {
  state: (): SessionStore => ({
    role_collection: {},
    preset_role: {
      uuid: '',
      current: {
        title: '',
        date: '',
        message_list: [],
        request_message_list: [],
        uuid: ''
      },
      history_list: []
    },
    current_role_uuid: 'role'
  }),

  getters: {
    // 获取历史的某个属性
    getHistoryAttr({ role_collection, current_role_uuid }) {
      return <T extends keyof SessionHistory>(index: number, prop: T) => {
        return role_collection[current_role_uuid].history_list[index][prop]
      }
    },

    // 获取某个历史
    getHistory({ role_collection, current_role_uuid }) {
      return (index: number) => {
        return role_collection[current_role_uuid].history_list[index]
      }
    },

    // 获取历史列表
    getHistoryList({ role_collection, current_role_uuid }) {
      return role_collection[current_role_uuid].history_list
    },

    // 获取当前会话属性
    getCurrentSessionAttr({ role_collection, current_role_uuid }) {
      return <T extends keyof SessionHistory>(prop: T) => {
        return role_collection[current_role_uuid].current[prop]
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
    // 更新历史的属性
    updateHistoryAttr<T extends keyof SessionHistory>(
      index: number,
      prop: T,
      data: SessionHistory[T]
    ) {
      this.role_collection[this.current_role_uuid].history_list[index][prop] = data
    },

    // 更新历史
    updateHistory(index: number, history: SessionHistory) {
      this.role_collection[this.current_role_uuid].history_list[index] = history
    },

    // 增加历史
    pushHistory(history: SessionHistory) {
      this.role_collection[this.current_role_uuid].history_list.push(history)
    },

    // 删除历史
    deleteHistory(session_uuid: string) {
      const index = this.role_collection[this.current_role_uuid].history_list.findIndex(
        (item) => item.uuid === session_uuid
      )

      this.role_collection[this.current_role_uuid].history_list.splice(index, 1)
    },

    // 清空角色的历史
    clearRoleHistory() {
      this.role_collection[this.current_role_uuid].history_list = []
    },

    // 更新当前的某个属性
    updateCurrentSessionAttr<T extends keyof SessionHistory>(
      prop: T,
      data: SessionHistory[T] | SessionHistory[T][]
    ) {
      if (Array.isArray(data)) {
        // this[uuid].current[prop].push(data)
        ;(
          this.role_collection[this.current_role_uuid].current[prop] as (Message | RequestMessage)[]
        ).push(...(data as (Message | RequestMessage)[]))
      } else {
        this.role_collection[this.current_role_uuid].current[prop] = data
      }
    },

    // 更新角色的当前会话
    updateCurrentRoleSession(session: SessionHistory) {
      this.role_collection[this.current_role_uuid].current = session
    },

    // 把当前对话增加到历史列表
    updateCurrentSessionToHistory() {
      this.role_collection[this.current_role_uuid].history_list.push({
        ...this.role_collection[this.current_role_uuid].current,
        // 以结束话题的时间作为日期
        date: new Date().toLocaleString()
      })
    },

    // 更新当前角色UUID
    updateCurrentRoleUUID(uuid: string) {
      this.current_role_uuid = uuid
    },

    // 更新当前角色
    updateCurrentRole(uuid: string, role: RoleSession) {
      this.updateCurrentRoleUUID(uuid)
      this.role_collection[this.current_role_uuid] = role
    }
  },

  persist: {
    key: 'session_list',
    storage: localStorage
    // paths: ['history', 'current']
  }
})
