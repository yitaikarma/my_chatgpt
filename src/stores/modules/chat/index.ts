import { defineStore } from 'pinia'
import type { ChatStore, ChatHistory } from './types'

export const useChatStore = defineStore('chat', {
  state: (): ChatStore => ({
    role_collection: {
      role: {
        current: {
          title: '',
          date: '',
          message_list: [],
          request_message_list: [],
          uuid: ''
        },
        history_list: [
          // {
          //   title: '',
          //   date: '',
          //   message_list: [],
          //   request_message_list: [],
          //   uuid: ''
          // }
        ]
      }
    },
    currentRole: 'role'
  }),
  getters: {
    getHistoryForAttr({ role_collection }) {
      return <T extends keyof ChatHistory>(role: string, index: number, prop: T) => {
        return role_collection[role].history_list[index][prop]
      }
    },
    getHistoryForRole({ role_collection }) {
      return (role: string, index: number) => {
        return role_collection[role].history_list[index]
      }
    },
    getHistoryList({ role_collection }) {
      return (role: string) => {
        return role_collection[role].history_list
      }
    },
    getCurrentForAttr({ role_collection }) {
      return <T extends keyof ChatHistory>(role: string, prop: T) => {
        return role_collection[role].current[prop]
      }
    },
    getCurrentForRole({ role_collection }) {
      return (role: string) => {
        return role_collection[role].current
      }
    }
  },
  actions: {
    // 设置历史的某个属性
    setHistoryForAttr<T extends keyof ChatHistory>(
      role: string,
      index: number,
      prop: T,
      data: ChatHistory[T]
    ) {
      this.role_collection[role].history_list[index][prop] = data
    },
    // 设置历史
    setHistoryForRole(role: string, index: number, history: ChatHistory) {
      this.role_collection[role].history_list[index] = history
    },
    // 增加历史
    pushHistoryForRole(role: string, history: ChatHistory) {
      this.role_collection[role].history_list.push(history)
    },
    // 删除历史
    deleteHistoryItem(role: string, uuid: string) {
      const index = this.role_collection[role].history_list.findIndex((item) => item.uuid === uuid)
      this.role_collection[role].history_list.splice(index, 1)
    },
    // 清空历史
    clearHistory(role: string) {
      this.role_collection[role].history_list = []
    },
    // 设置当前的某个属性
    setCurrentForAttr<T extends keyof ChatHistory>(
      role: string,
      prop: T,
      data: ChatHistory[T] | ChatHistory[T][]
    ) {
      if (Array.isArray(data)) {
        // this[role].current[prop].push(data)
        ;(this.role_collection[role].current[prop] as (Message | RequestMessage)[]).push(
          ...(data as (Message | RequestMessage)[])
        )
      } else {
        this.role_collection[role].current[prop] = data
      }
    },
    // 设置当前
    setCurrentForRole(role: string, role_chat: ChatHistory) {
      this.role_collection[role].current = role_chat
    },
    // 把当前对话增加到历史列表
    setCurrentToHistory(role: string) {
      this.role_collection[role].history_list.push({
        ...this.role_collection[role].current,
        // 以结束话题的时间作为日期
        date: new Date().toLocaleString()
      })
    }
  },
  persist: {
    key: 'chat_list',
    storage: localStorage
    // paths: ['history', 'current']
  }
})
