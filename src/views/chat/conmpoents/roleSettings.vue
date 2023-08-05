<script setup lang="ts">
import { ref, toRef, watchEffect } from 'vue'
import {
  NForm,
  NFormItemGi,
  NGrid,
  NInput,
  NInputNumber,
  NModal,
  NSelect,
  NSlider,
  NSwitch,
  useMessage
} from 'naive-ui'
import type { FormRules, FormInst } from 'naive-ui'
import { useRoleConfig } from '@/hooks/chat/useRoleConfig'
import { useConfig } from '@/hooks/chat/useGlobalConfig'

const { globalConfigStore } = useConfig()
const { roleConfigStore } = useRoleConfig()
const message = useMessage()

const formRef = ref<FormInst | null>()
const showModal = ref(false)
const userConfigForm = toRef({ ...roleConfigStore.getRoleAttr('session_config') })
const rules: FormRules = {}
const modelOptions = globalConfigStore.model_options

watchEffect(
  () => {
    userConfigForm.value = { ...roleConfigStore.getRoleAttr('session_config') }
  },
  { flush: 'post' }
)

defineExpose({ openSettings, closeSettings })

function openSettings() {
  showModal.value = true
}

function closeSettings() {
  showModal.value = false
  userConfigForm.value = { ...roleConfigStore.getRoleAttr('session_config') }
}

function cancelCallback() {
  closeSettings()
}

function submitCallback() {
  return formRef.value?.validate((errors) => {
    if (!errors) {
      roleConfigStore.updateRoleAttr('session_config', { ...userConfigForm.value })
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
      title="角色设置"
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
        :model="userConfigForm"
        :rules="rules"
        label-width="auto"
        label-align="left"
        label-placement="left"
        require-mark-placement="right-hanging"
        style="margin-top: 40px"
      >
        <NGrid cols="24" y-gap="10">
          <NFormItemGi span="24" path="model" label="模型">
            <NSelect v-model:value="userConfigForm.model" :options="modelOptions" />
          </NFormItemGi>
          <NFormItemGi span="24" path="user_nick" label="用户昵称">
            <NInput v-model:value="userConfigForm.user_nick" clearable placeholder="必填" />
          </NFormItemGi>
          <NFormItemGi span="24" path="role_nick" label="角色昵称">
            <NInput v-model:value="userConfigForm.role_nick" clearable placeholder="必填" />
          </NFormItemGi>
          <NFormItemGi span="24" path="role_remarks" label="角色备注">
            <NInput v-model:value="userConfigForm.role_remarks" clearable placeholder="必填" />
          </NFormItemGi>
          <NFormItemGi span="24" path="role_directive" label="角色指令">
            <NInput
              v-model:value="userConfigForm.role_directive"
              type="textarea"
              clearable
              placeholder="必填"
              :autosize="{ minRows: 4, maxRows: 8 }"
            />
          </NFormItemGi>
          <NFormItemGi
            span="24"
            path="stream"
            label="逐字回复"
            feedback="开启后，角色将逐字回复，关闭后，角色将一次性回复。"
          >
            <NSwitch v-model:value="userConfigForm.stream" />
          </NFormItemGi>
          <NFormItemGi span="24" path="request_message_length" label="最大上下文">
            <NSlider
              v-model:value="userConfigForm.request_message_length"
              :step="1"
              :min="1"
              :max="80"
            />
            <NInputNumber
              v-model:value="userConfigForm.request_message_length"
              size="small"
              :show-button="false"
              :min="1"
              :max="80"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="max_tokens" label="最大字符数">
            <NSlider v-model:value="userConfigForm.max_tokens" :step="10" :min="100" :max="2000" />
            <NInputNumber
              v-model:value="userConfigForm.max_tokens"
              size="small"
              :show-button="false"
              :min="100"
              :max="2000"
            />
          </NFormItemGi>
          <NFormItemGi span="24" path="temperature" label="随机性">
            <NSlider v-model:value="userConfigForm.temperature" :step="0.1" :min="0.1" :max="1" />
            <NInputNumber
              v-model:value="userConfigForm.temperature"
              size="small"
              :show-button="false"
              :min="0.1"
              :max="1"
            />
          </NFormItemGi>
        </NGrid>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped lang="scss">
:deep(.n-input-number) {
  width: 70px;
  margin-left: 10px;
}
</style>
