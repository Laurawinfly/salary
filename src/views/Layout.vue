<template>
  <el-container class="layout-container">
    <el-aside width="200px">
      <div class="system-title">
        <div class="logo">工</div>
        <h1>工资条管理</h1>
      </div>
      <el-menu
        :router="true"
        :default-active="activeMenu"
        class="menu-container"
      >
        <el-menu-item index="/salary/send">
          <el-icon><Message /></el-icon>
          <span>发送工资条</span>
        </el-menu-item>
        <el-menu-item index="/salary/records">
          <el-icon><List /></el-icon>
          <span>发送记录</span>
        </el-menu-item>
        <el-menu-item index="/salary/analysis">
          <el-icon><TrendCharts /></el-icon>
          <span>统计分析</span>
        </el-menu-item>
        <el-menu-item index="/salary/operation-logs">
          <el-icon><Operation /></el-icon>
          <span>操作记录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Upload, Message, List, TrendCharts, Operation } from '@element-plus/icons-vue'

export default {
  components: {
    Upload,
    Message,
    List,
    TrendCharts,
    Operation
  },
  setup() {
    const route = useRoute()
    const activeMenu = computed(() => route.path)
    
    return {
      activeMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.layout-container {
  height: 100vh;
  
  .el-aside {
    background-color: #001529;
    
    .system-title {
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      gap: 8px;
      
      .logo {
        width: 32px;
        height: 32px;
        background: var(--el-color-primary);
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 20px;
        font-weight: bold;
      }
      
      h1 {
        color: #fff;
        font-size: 18px;
        margin: 0;
        font-weight: 500;
      }
    }
    
    .menu-container {
      height: calc(100% - 60px);
      border-right: none;
      background-color: #001529;
      
      :deep(.el-menu-item) {
        color: #fff;
        
        &:hover, &.is-active {
          background-color: var(--el-color-primary);
        }
        
        .el-icon {
          color: inherit;
        }
      }
    }
  }
  
  .el-main {
    background-color: #f0f2f5;
    padding: 20px;
  }
}
</style> 