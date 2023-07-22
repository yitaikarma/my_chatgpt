import { computed } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useConfig } from '@/hooks/core/useConfig'

// 自定义 NaiveUI 主题
const themeOverrides: GlobalThemeOverrides = {
  common: {
    borderRadius: '10px'
  },
  Button: {
    borderRadiusSmall: '6px'
  },
  Select: {
    peers: {
      InternalSelection: {
        // textColor: '#FF0000'
      }
    }
  }
}

export function useTheme() {
  const { getSettingsAttr } = useConfig()

  /**
   * 获取主题
   * @returns 主题
   */
  const theme = computed(() => {
    const theme = getSettingsAttr('theme')
    switch (theme) {
      case 'light':
        return null
      case 'dark':
        return darkTheme
      default:
        return useOsTheme().value === 'dark' ? darkTheme : null
    }
  })

  return {
    theme,
    themeOverrides
  }
}
