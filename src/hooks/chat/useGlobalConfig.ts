// import type { _DeepPartial } from 'pinia'
import { useGlobalConfig } from '@/stores/modules/globalConfig'

export function useConfig() {
  const globalConfigStore = useGlobalConfig()

  return {
    globalConfigStore
  }
}
