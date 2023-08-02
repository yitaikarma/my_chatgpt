<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import {
  NForm,
  NFormItemGi,
  NGrid,
  NInput,
  NModal,
  NRadio,
  NRadioGroup,
  NSelect,
  NSpace,
  useMessage
} from 'naive-ui'
import type { FormRules, FormInst, SelectOption } from 'naive-ui'
import { useSettingsStore } from '@/stores/modules/settings'

const settingsStore = useSettingsStore()

const message = useMessage()

interface ThemeRadio {
  value: string
  label: string
}
const formRef = ref<FormInst | null>()
const showModal = ref(false)
const configForm = ref({ ...settingsStore.config })
const rules: FormRules = {
  api_key: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入 API 秘钥'
  }
}
const themeOptions: ThemeRadio[] = [
  {
    value: 'auto',
    label: '自动'
  },
  {
    value: 'light',
    label: '浅色'
  },
  {
    value: 'dark',
    label: '深色'
  },
  {
    value: 'shallow_dark',
    label: '深灰色'
  },
  {
    value: 'blue_dark',
    label: '深蓝色'
  }
]
const options: SelectOption[] = [
  {
    label: 'GPT-3.5',
    value: 'gpt-3.5'
  },
  {
    label: 'GPT-3.5-Turbo',
    value: 'gpt-3.5-turbo'
  },
  {
    label: 'GPT-3.5-Turbo-0613',
    value: 'gpt-3.5-turbo-0613'
  },
  {
    label: 'GPT-3.5-Turbo-16k',
    value: 'gpt-3.5-turbo-16k'
  },
  {
    label: 'GPT-3.5-Turbo-16k-0613',
    value: 'gpt-3.5-turbo-16k-0613'
  },
  {
    label: 'GPT-4',
    value: 'gpt-4',
    disabled: true
  },
  {
    label: 'GPT-4-0613',
    value: 'gpt-4-0613',
    disabled: true
  },
  {
    label: 'GPT-4-32k',
    value: 'gpt-4-32k',
    disabled: true
  },
  {
    label: 'GPT-4-32k-0613',
    value: 'gpt-4-32k-0613',
    disabled: true
  }
]

watchEffect(
  () => {
    configForm.value = { ...settingsStore.config }
  },
  { flush: 'post' }
)

defineExpose({ openSettings, closeSettings })

function openSettings() {
  showModal.value = true
  configForm.value = { ...settingsStore.config }
}

function closeSettings() {
  showModal.value = false
  configForm.value = { ...settingsStore.config }
}

function cancelCallback() {
  closeSettings()
}

function submitCallback() {
  return formRef.value?.validate((errors) => {
    if (!errors) {
      configForm.value && settingsStore.setConfig(configForm.value)
      message.success('已保存')
    } else {
      console.log(errors)
      message.error('验证失败')
    }
  })
}
</script>
<template>
  <div>
    <NModal
      v-model:show="showModal"
      preset="dialog"
      title="设置"
      :show-icon="false"
      bordered
      transform-origin="center"
      positive-text="保存"
      negative-text="取消"
      @positive-click="submitCallback"
      @negative-click="cancelCallback"
      style="width: 600px; border-radius: 6px"
    >
      <NForm
        ref="formRef"
        :model="configForm"
        :rules="rules"
        label-width="auto"
        label-align="left"
        label-placement="left"
        require-mark-placement="right-hanging"
        style="margin-top: 40px"
      >
        <NGrid cols="24" y-gap="10">
          <NFormItemGi span="24" path="theme" label="主题模式">
            <NRadioGroup v-model:value="configForm.theme" name="radiogroup">
              <NSpace>
                <NRadio v-for="theme in themeOptions" :key="theme.value" :value="theme.value">
                  {{ theme.label }}
                </NRadio>
              </NSpace>
            </NRadioGroup>
          </NFormItemGi>
          <NFormItemGi span="24" path="api_base_url" label="API地址">
            <NInput
              v-model:value="configForm.api_base_url"
              clearable
              placeholder="https://api.openai.com"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="api_path" label="API路径">
            <NInput
              v-model:value="configForm.api_path"
              clearable
              placeholder="/v1/chat/completions"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="api_key" label="API秘钥">
            <NInput
              type="password"
              v-model:value="configForm.api_key"
              clearable
              placeholder="必填"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="model" label="模型">
            <NSelect
              v-model:value="configForm.model"
              :options="options"
              clearable
              placeholder="必填"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="user_nick" label="用户昵称">
            <NInput v-model:value="configForm.user_nick" clearable placeholder="必填" />
          </NFormItemGi>
          <NFormItemGi span="24" path="role_nick" label="角色昵称">
            <NInput v-model:value="configForm.role_nick" clearable placeholder="必填" />
          </NFormItemGi>
          <NFormItemGi span="24" path="role_remarks" label="角色备注">
            <NInput v-model:value="configForm.role_remarks" clearable placeholder="必填" />
          </NFormItemGi>
          <!-- feedback="角色或指令需清晰易懂，明确且有逻辑。参考角色指令大全" -->
          <NFormItemGridItem span="24" path="role_directive" label="角色指令">
            <NInput
              v-model:value="configForm.role_directive"
              type="textarea"
              clearable
              placeholder="必填"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </NFormItemGridItem>
        </NGrid>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped lang="scss"></style>
