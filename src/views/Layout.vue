<template>
  <div class="layout">
    <!-- 顶部栏 -->
    <div class="header">
      <div class="logo">
        <img src="@/assets/logo.png" alt="logo">
        <span>工资管理系统</span>
      </div>
    </div>
    
    <div class="main">
      <!-- 左侧菜单 -->
      <div class="sidebar">
        <el-menu
          :router="true"
          :default-active="$route.path"
          class="menu"
          background-color="#001529"
          text-color="#fff"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/salary/send">
            <el-icon><Document /></el-icon>
            <span>发送工资条</span>
          </el-menu-item>
          <el-menu-item index="/salary/records">
            <el-icon><List /></el-icon>
            <span>发送记录</span>
          </el-menu-item>
          <el-menu-item index="/salary/statistics">
            <el-icon><PieChart /></el-icon>
            <span>统计分析</span>
          </el-menu-item>
          <el-menu-item index="/salary/operations">
            <el-icon><Operation /></el-icon>
            <span>操作记录</span>
          </el-menu-item>
        </el-menu>
      </div>
      
      <!-- 右侧内容区 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
import { Document, List, PieChart, Operation } from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    Document,
    List,
    PieChart,
    Operation
  }
}
</script>

<style lang="scss" scoped>
.layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  
  .header {
    height: 64px;
    background: #001529;
    padding: 0 24px;
    display: flex;
    align-items: center;
    
    .logo {
      display: flex;
      align-items: center;
      color: #fff;
      font-size: 18px;
      
      img {
        height: 32px;
        margin-right: 12px;
      }
    }
  }
  
  .main {
    flex: 1;
    display: flex;
    background: #f5f7f9;
    
    .sidebar {
      width: 200px;
      background: #001529;
      
      .menu {
        height: 100%;
        border-right: none;
      }
    }
    
    .content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
  }
}
</style> 