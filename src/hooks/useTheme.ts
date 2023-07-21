import { computed } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
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

  const theme = computed(() => {
    const theme = getSettingsAttr('theme')
    if (theme === 'light') {
      return lightTheme
    }
    return darkTheme
  })

  return {
    theme,
    themeOverrides
  }
}
