import { ref, toRef, watch } from 'vue'
import { useSessionStore } from '@/stores/modules/session'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'

export function useSession() {
  const roleConfigStore = useRoleConfigStore()
  const sessionStore = useSessionStore()

  /**
   * 初始化角色会话
   * @param role_uuid 角色uuid
   */
  const initRoleSession = (role_uuid: string) => {
    const greetingsMessage = {
      role: 'assistant',
      content: roleConfigStore.getRoleConfigAttr('greetings_text'),
      name: roleConfigStore.getRoleConfigAttr('role_nick'),
      date: new Date().toLocaleString()
    }
    const requestMessageList = {
      role: 'user',
      content: roleConfigStore.getRoleConfigAttr('role_directive')
    }

    // 更新角色当前会话
    sessionStore.updateCurrentRoleUUID(role_uuid)
    sessionStore.updateCurrentRole(role_uuid, {
      uuid: role_uuid,
      current: {
        uuid: generateUUIDUsingMathRandom(),
        title: greetingsMessage.content,
        date: new Date().toLocaleString(),
        message_list: [greetingsMessage],
        request_message_list: [requestMessageList],
        is_history: false
      },
      history_list: []
    })
  }

  return { sessionStore, initRoleSession }
}
