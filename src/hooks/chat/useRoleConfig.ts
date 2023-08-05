import { ref, toRef, watch } from 'vue'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { useSessionStore } from '@/stores/modules/session'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'

export function useRoleConfig() {
  const roleConfigStore = useRoleConfigStore()
  const sessionStore = useSessionStore()

  /**
   * 添加角色
   */
  const addRole = () => {
    const newUuid = generateUUIDUsingMathRandom()
    const newRole = {
      uuid: newUuid,
      prev_role_uuid: '',
      next_role_uuid: '',
      sort: roleConfigStore.role_list.length + 1,
      date: new Date().toLocaleString(),
      session_config: roleConfigStore.getPresetRole.session_config
    }

    roleConfigStore.updateCurrentRoleUUID(newUuid)
    roleConfigStore.addRole(newRole)

    // 关联前后角色的UUID
    if (roleConfigStore.role_list.length >= 2) {
      const { uuid } = roleConfigStore.getRole(roleConfigStore.last_role_uuid)
      roleConfigStore.updateRoleNextUUID(uuid, newUuid)
      roleConfigStore.updateRolePrevUUID(newUuid, uuid)
    }

    // 如果没有第一个角色，或者只有一个角色，那么新角色就是第一个角色. 否则，新角色就是最后一个角色
    if (!roleConfigStore.first_role_uuid && roleConfigStore.role_list.length <= 1) {
      roleConfigStore.updateGlobalAttr('first_role_uuid', newUuid)
    }
    roleConfigStore.updateGlobalAttr('last_role_uuid', newUuid)
  }

  /**
   * 切换角色
   * @param uuid 要切换到的角色的uuid
   */
  const changeRole = (to_uuid: string) => {
    if (to_uuid === roleConfigStore.current_role_uuid) return
    sessionStore.updateCurrentRoleUUID(to_uuid)
    roleConfigStore.updateCurrentRoleUUID(to_uuid)
  }

  /**
   * 删除角色
   * @param target_uuid 要删除的角色的uuid
   */
  const deleteRole = (target_uuid: string) => {
    const { prev_role_uuid, next_role_uuid } = roleConfigStore.getRole(target_uuid)

    // 重新关联前后角色的uuid
    prev_role_uuid && roleConfigStore.updateRoleNextUUID(prev_role_uuid, next_role_uuid)
    next_role_uuid && roleConfigStore.updateRolePrevUUID(next_role_uuid, prev_role_uuid)
    // 更新第一个角色和最后一个角色的uuid
    prev_role_uuid || roleConfigStore.updateGlobalAttr('first_role_uuid', next_role_uuid)
    next_role_uuid || roleConfigStore.updateGlobalAttr('last_role_uuid', prev_role_uuid)

    // 如果删除当前角色，需要切换到下一个角色，如果没有下一个角色，切换到上一个角色
    if (roleConfigStore.current_role_uuid === target_uuid) {
      const toRoleUuid = next_role_uuid ? next_role_uuid : prev_role_uuid
      changeRole(toRoleUuid)
    }

    roleConfigStore.deleteRole(target_uuid)
    sessionStore.deleteRole(target_uuid)
  }

  return { roleConfigStore, addRole, changeRole, deleteRole }
}
