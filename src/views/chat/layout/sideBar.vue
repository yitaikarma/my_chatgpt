<script setup lang="ts">
import Settings from '@/views/chat/conmpoents/settings.vue'
import RoleList from '@/views/chat/conmpoents/roleList.vue'
import { Settings24Regular } from '@vicons/fluent'

const settingsRef = ref<InstanceType<typeof Settings> | null>(null)

// 设置
function handleChangeSettingsDisplay() {
  settingsRef.value?.openSettings()
}
</script>

<template>
  <div class="side_wrapper">
    <RoleList />
    <div class="utils_nav">
      <NTooltip trigger="hover" :delay="1000">
        <template #trigger>
          <NButton
            size="large"
            quaternary
            circle
            style="font-size: 28px"
            @click="handleChangeSettingsDisplay"
          >
            <NIcon> <Settings24Regular /> </NIcon>
          </NButton>
        </template>
        设置
      </NTooltip>
    </div>
  </div>
  <Settings ref="settingsRef" />
</template>

<style scoped lang="scss">
.side_wrapper {
  width: 300px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border-right: 1px solid #3c3f45;
  border-right: 1px solid var(--color-msg-ctn-border-1);
  background-color: #23252b;
  background-color: var(--color-bg);
  transition: background-color 0.5s;

  .utils_nav {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    padding: 10px;
    border-top: 1px solid #2e3035;
    border-top: 1px solid var(--color-msg-ctn-border-1);
    transition: border-color 0.5s;
  }
}
</style>
