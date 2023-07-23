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
  // const darkThemeName = 'shallow_dark'
  const darkThemeName = 'blur_dark'
  // const darkThemeName = 'dark'

  /**
   * 获取主题
   * @returns 主题
   */
  const theme = computed(() => {
    const theme = getSettingsAttr('theme')
    const osTheme = useOsTheme().value

    switch (theme) {
      case 'light':
        document.body.classList.remove(darkThemeName)
        return null

      case 'dark':
        document.body.classList.add(darkThemeName)
        return darkTheme

      default:
        if (osTheme === 'dark') {
          document.body.classList.add(darkThemeName)
        } else {
          document.body.classList.remove(darkThemeName)
        }
        return osTheme === 'dark' ? darkTheme : null
    }
  })

  return {
    theme,
    themeOverrides
  }
}
