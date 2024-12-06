<!--
 * @Description: 工资条查看首页
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->
<template>
  <div class="salary-view-home">
    <div class="header">
      <div class="title">小鹅工资条</div>
    </div>

    <!-- 安全提示卡片 -->
    <div class="security-card">
      <div class="icon-wrapper">
        <div class="check-icon">✓</div>
      </div>
      <div class="text">
        <div class="main">薪资安全</div>
        <div class="main">双向保障</div>
      </div>
    </div>

    <!-- 安全提示图标 -->
    <div class="lock-container">
      <div class="lock-icon">
        <i class="icon-lock">🔒</i>
      </div>
    </div>

    <!-- 提示文本 -->
    <div class="tip-text">
      <div class="line">工资信息属于个人隐私密信，须进行身份验证</div>
      <div class="line">才可以进入工资单小程序</div>
    </div>

    <!-- 验证按钮 -->
    <div class="verify-btn" @click="handleVerify">
      进行身份验证
    </div>

    <!-- 密码弹窗 -->
    <password-modal 
      v-if="showPasswordModal"
      @close="showPasswordModal = false"
      :onSuccess="handlePasswordSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PasswordModal from '@/components/PasswordModal.vue'

const router = useRouter()
const showPasswordModal = ref(false)

const handleVerify = () => {
  const hasPassword = localStorage.getItem('salary_password')
  if (hasPassword) {
    // 已设置过密码，显示密码弹窗
    showPasswordModal.value = true
  } else {
    // 首次使用，跳转到验证页面
    router.push('/salary-view/verify')
  }
}

const handlePasswordSuccess = () => {
  showPasswordModal.value = false
  router.push('/salary-view/detail')
}
</script>

<style lang="scss" scoped>
.salary-view-home {
  min-height: 100vh;
  background: #fff;
  padding: 0 20px;

  .header {
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;

    .title {
      font-size: 18px;
      font-weight: 600;
      color: #000;
    }
  }

  .security-card {
    height: 140px;
    background: linear-gradient(135deg, #4171ff, #6c8dff);
    border-radius: 16px;
    margin-top: 12px;
    padding: 24px;
    display: flex;
    align-items: flex-start;
    box-shadow: 0 4px 12px rgba(65, 113, 255, 0.15);

    .icon-wrapper {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      backdrop-filter: blur(4px);

      .check-icon {
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: #fff;
      }
    }

    .text {
      color: #fff;
      
      .main {
        font-size: 28px;
        font-weight: 600;
        line-height: 44px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    }
  }

  .lock-container {
    margin-top: 100px;
    display: flex;
    justify-content: center;

    .lock-icon {
      width: 80px;
      height: 80px;
      background: #f0f7ff;
      border-radius: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 24px rgba(65, 113, 255, 0.15);

      .icon-lock {
        font-size: 40px;
        color: #4171ff;
      }
    }
  }

  .tip-text {
    margin-top: 32px;
    text-align: center;
    color: #333;
    
    .line {
      font-size: 15px;
      line-height: 24px;
      
      &:first-child {
        margin-bottom: 4px;
      }
    }
  }

  .verify-btn {
    margin-top: 60px;
    height: 48px;
    background: linear-gradient(90deg, #4171ff, #6c8dff);
    border-radius: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(65, 113, 255, 0.2);
    transition: all 0.3s ease;

    &:active {
      transform: scale(0.98);
      box-shadow: 0 2px 8px rgba(65, 113, 255, 0.15);
    }
  }
}
</style> 