import { useSessionStore } from '@/stores/modules/session'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'
import type { SessionHistory } from '@/stores/modules/session/types'

export function useSession() {
  const roleConfigStore = useRoleConfigStore()
  const sessionStore = useSessionStore()

  /**
   * 会话初始模板
   * @returns 会话模板
   */
  const sessionTemplate = () => {
    // 助理问候语
    const greetingsMessage = {
      uuid: generateUUIDUsingMathRandom(),
      role: 'assistant',
      content: roleConfigStore.getRoleConfigAttr('greetings_text'),
      name: roleConfigStore.getRoleConfigAttr('role_nick'),
      date: new Date().toLocaleString()
    }

    // 助理请求指令
    const requestMessageList = {
      role: 'user',
      content: roleConfigStore.getRoleConfigAttr('role_directive')
    }

    // 会话模板
    const session = {
      uuid: generateUUIDUsingMathRandom(),
      title: greetingsMessage.content,
      date: new Date().toLocaleString(),
      message_list: [greetingsMessage],
      request_message_list: [requestMessageList],
      is_history: false
    }

    return {
      greetingsMessage,
      requestMessageList,
      session
    }
  }

  /**
   * 初始化角色会话
   * @param role_uuid 角色uuid
   */
  const initRoleSession = (role_uuid: string) => {
    // 更新角色当前会话UUID
    sessionStore.updateCurrentRoleUUID(role_uuid)

    // 更新角色会话列表
    sessionStore.updateCurrentRole(role_uuid, {
      uuid: role_uuid,
      current: sessionTemplate().session,
      history_list: []
    })
  }

  /**
   * 初始化当前会话
   */
  const initSession = () => {
    // 更新角色当前会话
    sessionStore.updateCurrentRoleSession(sessionTemplate().session)
  }

  /**
   * 保存当前会话
   */
  const seveSession = () => {
    // FIXME: 当前历史删除后，又继续发送消息，需要再次保存为历史
    const messageList = sessionStore.getCurrentSessionAttr('message_list')
    // 未进行过对话，不保存
    if (messageList.length < 2) return

    const currentSession = sessionStore.getCurrentSession
    if (!currentSession.is_history) {
      sessionStore.updateCurrentSessionToHistory()
    }
  }

  return { sessionStore, initRoleSession, initSession, seveSession }
}
