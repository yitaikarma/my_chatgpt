<script setup lang="ts">
import { zhCN, dateZhCN } from 'naive-ui'
import { useTheme } from '@/hooks/useTheme'

const { theme, themeOverrides } = useTheme()
</script>

<template>
  <NConfigProvider
    :theme="theme"
    :locale="zhCN"
    :date-locale="dateZhCN"
    :theme-overrides="themeOverrides"
    inline-theme-disabled
  >
    <div class="mian">
      <!-- <div class="header"></div> -->
      <!-- <div class="side_nav">
        <nav>
          <div class="menu_nav">
            <RouterLink to="/">Chat</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </div>
          <div class="utils_nav">
            <div class="settings_btn">设置</div>
          </div>
        </nav>
      </div> -->
      <div class="view_content">
        <NMessageProvider>
          <RouterView />
        </NMessageProvider>
      </div>
    </div>
  </NConfigProvider>
</template>

<style scoped lang="scss">
.mian {
  height: 100vh;
  width: 100vw;
  display: grid;
  // grid-auto-columns: auto 1fr;
  // grid-auto-rows: 60px minmax(100px, auto);
  grid-auto-columns: auto;
  grid-auto-rows: minmax(100px, auto);

  .header {
    grid-column: 1/3;
    grid-row: 1/2;
    width: 100%;
    height: 60px;
    border-bottom: 1px solid #2e3035;
    background-color: #202124;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  }

  .side_nav {
    grid-column: 1/2;
    grid-row: 2/3;
    display: flex;
    align-items: center;
    border-right: 1px solid #2e3035;
    background-color: #fff;
    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
    transition: all 1s ease-in-out;

    nav {
      width: fit-content;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      padding: 10px;
      background-color: #202124;

      .menu_nav {
        width: 100%;
        display: flex;
        flex-direction: column;
        row-gap: 10px;

        a {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background-color: #353535;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          color: #c3c3c3;

          &:hover {
            color: #1890ff;
          }
        }
      }

      .utils_nav {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 10px 0;

        .settings_btn {
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
  }

  .view_content {
    // grid-column: 2/3;
    // grid-row: 2/3;
    flex: 1;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
