import { ref, toRef, watch } from 'vue'
import { useSettingsStore } from '@/stores/modules/settings'

export function useSettings() {
  const settingsStore = useSettingsStore()

  // watch(
  //   () => settingsStore.config,
  //   (value, oldValue) => {
  //     console.log(value, oldValue)
  //     console.log('settingsStore.config changed')
  //   }
  // )

  /**
   * 获取设置属性
   * @param name 属性名
   * @returns 属性值
   */
  const getSettingsAttr = (optionName: keyof Settings.Config) => {
    if (optionName === 'api_url') {
      return settingsStore.config.api_base_url + settingsStore.config.api_path
    }
    return settingsStore.config[optionName]
  }

  /**
   * 更新设置属性
   * @param config 配置
   */
  const updateSettingsAttr = (config: Record<string, keyof Settings.Option>) => {
    settingsStore.$patch(config)
  }

  return {
    getSettingsAttr,
    updateSettingsAttr
  }
}
