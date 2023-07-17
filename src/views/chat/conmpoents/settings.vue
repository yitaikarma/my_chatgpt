<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NForm, NGrid, NInput, NModal, NSelect, useMessage } from 'naive-ui'
import type { FormRules, FormInst, SelectOption } from 'naive-ui'
import { useSettingsStore } from '@/stores/modules/settings'

const settingsStore = useSettingsStore()

const message = useMessage()

const formRef = ref<FormInst | null>()
const showModal = ref(false)
const model = ref<Settings.Option>({ ...settingsStore.config })

const rules: FormRules = {
  api_key: {
    required: true,
    trigger: ['blur', 'input'],
    message: '请输入 API 秘钥'
  }
}
const options: SelectOption[] = [
  {
    label: 'GPT-3.5-turbo-0613',
    value: 'GPT-3.5-turbo-0613'
    // disabled: true
  },
  {
    label: 'GPT-3.5-turbo-16k',
    value: 'GPT-3.5-turbo-16k'
  },
  {
    label: 'GPT-4',
    value: 'GPT-4'
  }
]

onMounted(() => {
  console.log('mounted')
})

defineExpose({
  openSettings,
  closeSettings
})

function openSettings() {
  showModal.value = true
  model.value = { ...settingsStore.config }
}

function closeSettings() {
  showModal.value = false
}

function submitCallback() {
  return formRef.value?.validate((errors) => {
    if (!errors) {
      model.value && settingsStore.setConfig(model.value)
      message.success('已保存')
    } else {
      console.log(errors)
      message.error('验证失败')
    }
  })
}

function cancelCallback() {
  closeSettings()
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
        :model="model"
        :rules="rules"
        label-width="auto"
        label-align="left"
        label-placement="left"
        require-mark-placement="right-hanging"
        style="margin-top: 40px"
      >
        <NGrid cols="24" y-gap="10">
          <NFormItemGridItem span="24" path="api_url" label="API地址">
            <NInput v-model:value="model.api_url" clearable placeholder="https://api.openai.com" />
          </NFormItemGridItem>
          <NFormItemGridItem span="24" path="api_key" label="API秘钥">
            <NInput v-model:value="model.api_key" clearable placeholder="必填" />
          </NFormItemGridItem>
          <NFormItemGridItem span="24" path="model" label="模型">
            <NSelect v-model:value="model.model" :options="options" clearable placeholder="必填" />
          </NFormItemGridItem>
          <NFormItemGridItem span="24" path="role_nick_name" label="角色昵称" :required="true">
            <NInput v-model:value="model.role_nick_name" clearable placeholder="必填" />
          </NFormItemGridItem>
          <NFormItemGridItem span="24" path="role_remarks" label="角色备注">
            <NInput v-model:value="model.role_remarks" clearable placeholder="必填" />
          </NFormItemGridItem>
          <NFormItemGridItem
            span="24"
            path="role_directive"
            label="角色指令"
            feedback="角色或指令需清晰易懂，明确且有逻辑。参考角色指令大全"
          >
            <NInput
              v-model:value="model.role_directive"
              type="textarea"
              clearable
              placeholder="必填"
            />
          </NFormItemGridItem>
        </NGrid>
      </NForm>
    </NModal>
  </div>
</template>

<style scoped lang="scss"></style>
