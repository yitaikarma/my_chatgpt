import { ref, toRef, watch } from 'vue'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'
import { generateUUIDUsingMathRandom } from '@/utils/functions/crypto'

export function useRoleConfig() {
  const roleConfigStore = useRoleConfigStore()

  /**
   * 添加新角色
   */
  const addNewRole = () => {
    const uuid = generateUUIDUsingMathRandom()
    roleConfigStore.updatePresetRole({
      uuid: uuid,
      date: new Date().toLocaleString(),
      session_config: roleConfigStore.getPresetRole.session_config
    })
    roleConfigStore.addRole(uuid, roleConfigStore.getPresetRole)
  }

  return { roleConfigStore, addNewRole }
}
