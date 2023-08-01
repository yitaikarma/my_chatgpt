<script setup lang="ts">
import { ref } from 'vue'
import { NForm, NFormItemGi, NGrid, NInput, NModal, NSelect, useMessage } from 'naive-ui'
import type { FormRules, FormInst, SelectOption } from 'naive-ui'
import { useRoleConfigStore } from '@/stores/modules/roleConfig'

const roleConfigStore = useRoleConfigStore()
const { role_list, current_role_uuid } = roleConfigStore
const message = useMessage()

const formRef = ref<FormInst | null>()
const showModal = ref(false)
const userConfigForm = ref({ ...role_list[current_role_uuid].session_config })
const rules: FormRules = {}
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

defineExpose({ openSettings, closeSettings })

function openSettings() {
  showModal.value = true
}

function closeSettings() {
  showModal.value = false
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

function cancelCallback() {
  closeSettings()
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
            <NSelect
              v-model:value="userConfigForm.model"
              :options="options"
              clearable
              placeholder="必填"
            />
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
          <!-- <NFormItemGridItem
            feedback="角色或指令需清晰易懂，明确且有逻辑。参考角色指令大全"
          > -->
          <NFormItemGridItem span="24" path="role_directive" label="角色指令">
            <NInput
              v-model:value="userConfigForm.role_directive"
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
