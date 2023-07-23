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
    const osTheme = useOsTheme().value || 'light'

    document.body.setAttribute('data-theme', theme === 'auto' ? osTheme : theme)
    switch (true) {
      case theme.includes('light'):
        return null

      case theme.includes('dark'):
        return darkTheme

      default:
        return osTheme === 'dark' ? darkTheme : null
    }
  })

  return {
    theme,
    themeOverrides
  }
}
