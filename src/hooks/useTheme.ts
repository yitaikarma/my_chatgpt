import { darkTheme, useOsTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { useConfig } from '@/hooks/chat/useGlobalConfig'

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
  const { globalConfigStore } = useConfig()
  let osTheme = 'light'

  onBeforeMount(() => {
    osTheme = useOsTheme().value || 'light'
  })

  /**
   * 获取主题
   * @returns 主题
   */
  const theme = computed(() => {
    const theme = globalConfigStore.getConfigAttr('theme')
    // const osTheme = useOsTheme().value || 'light'

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
