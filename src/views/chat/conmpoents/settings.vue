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
import type { FormRules, FormInst } from 'naive-ui'
import { useConfig } from '@/hooks/chat/useGlobalConfig'

const { globalConfigStore } = useConfig()
const message = useMessage()

const formRef = ref<FormInst | null>()
const showModal = ref(false)
const configForm = ref({ ...globalConfigStore.config })
const rules: FormRules = {
  api_key: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入 API 秘钥'
  }
}
const themeOptions = globalConfigStore.theme_options
const chatThemeOptions = globalConfigStore.chat_theme_options
const modelOptions = globalConfigStore.model_options

watchEffect(
  () => {
    configForm.value = { ...globalConfigStore.config }
  },
  { flush: 'post' }
)

defineExpose({ openSettings, closeSettings })

function openSettings() {
  showModal.value = true
  configForm.value = { ...globalConfigStore.config }
}

function closeSettings() {
  showModal.value = false
  configForm.value = { ...globalConfigStore.config }
}

function cancelCallback() {
  closeSettings()
}

function submitCallback() {
  return formRef.value?.validate((errors) => {
    if (!errors) {
      configForm.value && globalConfigStore.updateConfig(configForm.value)
      message.success('已保存')
    } else {
      console.log(errors)
      message.error('验证失败')
    }
  })
}

// 重置缓存
function resetCache() {
  window.localStorage.clear()
  window.location.reload()
}
</script>
<template>
  <div>
    <NModal
      v-model:show="showModal"
      preset="dialog"
      title="全局设置"
      :show-icon="false"
      bordered
      transform-origin="center"
      positive-text="保存"
      negative-text="取消"
      @positive-click="submitCallback"
      @negative-click="cancelCallback"
      style="width: 800px; border-radius: 6px"
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
          <NFormItemGi span="24" path="chat_theme" label="对话布局">
            <NRadioGroup v-model:value="configForm.chat_theme" name="radiogroup">
              <NSpace>
                <NRadio v-for="theme in chatThemeOptions" :key="theme.value" :value="theme.value">
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
              aria-autocomplete="new-password"
            />
            <input type="password" autocomplete="new-password" style="display: none" />
          </NFormItemGi>
          <NFormItemGi span="24" path="model" label="模型">
            <NSelect v-model:value="configForm.model" :options="modelOptions" />
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
          <NFormItemGi span="24" path="role_directive" label="角色指令">
            <NInput
              v-model:value="configForm.role_directive"
              type="textarea"
              clearable
              placeholder="必填"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </NFormItemGi>
          <NFormItemGi
            span="24"
            path="role_remarks"
            label="清空缓存"
            feedback="重置所有设置和记录，会刷新页面"
          >
            <n-popconfirm @positive-click="resetCache">
              <template #trigger> <NButton type="error" ghost> 重置 </NButton> </template>
              确认清空所有设置、角色、聊天记录吗？
            </n-popconfirm>
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped lang="scss"></style>
