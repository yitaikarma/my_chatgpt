<script setup lang="ts">
import Settings from '@/views/chat/conmpoents/settings.vue'
import { ref } from 'vue'
// import { ref, toRef } from 'vue'
// import { useSettings } from '@/views/chat/hooks/useSettingsStore'

// const { getSettingsAttr } = useSettings()

// const roleNick = toRef(() => getSettingsAttr('role_nick'))

const settingsRef = ref<InstanceType<typeof Settings> | null>(null)

// 设置
function handleChangeSettingsDisplay() {
  settingsRef.value?.openSettings()
}
</script>

<template>
  <div class="chat_list_wrapper">
    <div class="chat_list"></div>
    <div class="utils_nav">
      <div class="settings_btn" @click="handleChangeSettingsDisplay">设置</div>
    </div>
  </div>
  <Settings ref="settingsRef" />
</template>

<style scoped lang="scss">
.chat_list_wrapper {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid #3c3f45;
  background-color: #23252b;

  .chat_list {
    width: 300px;
    height: 100%;
    padding: 20px;
  }

  .utils_nav {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid #2e3035;

    .settings_btn {
      cursor: pointer;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: #353535;
      text-decoration: none;
      font-weight: 600;
      font-size: 12px;
      color: #c3c3c3;

      &:hover {
        color: #1890ff;
      }
    }
  }
}
</style>
