import { ref, toRef, watch } from 'vue'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'

export function useRoleConfig() {
  const roleConfigStore = useRoleConfigStore()

  /**
   * 添加新角色
   */
  const addNewRole = () => {
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

  return { roleConfigStore, addNewRole }
}
