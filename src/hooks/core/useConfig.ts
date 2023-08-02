import { ref, toRef, watch } from 'vue'
import type { _DeepPartial } from 'pinia'
import { useSettingsStore } from '@/stores/modules/settings'
import type { GlobalConfigExtended } from '@/stores/modules/types'

export function useConfig() {
  const settingsStore = useSettingsStore()
  /**
   * 获取设置属性
   * @param name 属性名
   * @returns 属性值
   */
  const getSettingsAttr = (optionName: keyof GlobalConfigExtended) => {
    if (optionName === 'api_url') {
      return settingsStore.config.api_base_url + settingsStore.config.api_path
    }
    return settingsStore.config[optionName]
  }

  // BUG: 更新方法不生效
  /**
   * 更新设置属性
   * @param config 配置
   */
  const updateSettingsAttr = (config: _DeepPartial<{}> = { theme: 'dark' }) => {
    console.log(config)

    settingsStore.$patch(config)
  }
  // const updateSettingsAttr = (
  //   config: Record<string, keyof Settings.Option> = { theme: 'dark' }
  // ) => {
  //   settingsStore.$patch(config)
  // }

  return {
    getSettingsAttr,
    updateSettingsAttr
  }
}
