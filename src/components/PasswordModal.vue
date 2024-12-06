<template>
  <div class="password-modal">
    <div class="modal-content">
      <div class="modal-header">
        <div class="title">输入安全密码</div>
        <div class="close" @click="$emit('close')">×</div>
      </div>

      <div class="password-dots">
        <div 
          v-for="(dot, index) in 4" 
          :key="index"
          :class="['dot', { active: password.length > index }]"
        ></div>
      </div>

      <div class="forgot-password" @click="handleForgotPassword">
        忘记安全密码？
      </div>

      <!-- 数字键盘 -->
      <div class="number-keyboard">
        <div class="keyboard-row">
          <div class="key" @click="inputNumber(1)">1</div>
          <div class="key" @click="inputNumber(2)">2</div>
          <div class="key" @click="inputNumber(3)">3</div>
        </div>
        <div class="keyboard-row">
          <div class="key" @click="inputNumber(4)">4</div>
          <div class="key" @click="inputNumber(5)">5</div>
          <div class="key" @click="inputNumber(6)">6</div>
        </div>
        <div class="keyboard-row">
          <div class="key" @click="inputNumber(7)">7</div>
          <div class="key" @click="inputNumber(8)">8</div>
          <div class="key" @click="inputNumber(9)">9</div>
        </div>
        <div class="keyboard-row">
          <div class="key empty"></div>
          <div class="key" @click="inputNumber(0)">0</div>
          <div class="key delete" @click="deleteNumber">×</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const props = defineProps({
  onSuccess: Function
})

const emit = defineEmits(['close'])
const password = ref('')

const inputNumber = (num) => {
  if (password.value.length < 4) {
    password.value += num
    if (password.value.length === 4) {
      // 验证密码
      const savedPassword = localStorage.getItem('salary_password')
      if (password.value === savedPassword) {
        localStorage.setItem('salary_verified', 'true')
        props.onSuccess?.()
      } else {
        alert('密码错误')
        password.value = ''
      }
    }
  }
}

const deleteNumber = () => {
  password.value = password.value.slice(0, -1)
}

// 处理忘记密码
const handleForgotPassword = () => {
  // 清除已保存的密码和验证状态
  localStorage.removeItem('salary_password')
  localStorage.removeItem('salary_verified')
  
  // 关闭弹窗
  emit('close')
  
  // 跳转到验证页面
  router.push('/salary-view/verify')
}
</script>

<style lang="scss" scoped>
.password-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;

  .modal-content {
    width: 100%;
    background: #fff;
    border-radius: 16px 16px 0 0;
    padding-top: 16px;

    .modal-header {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 16px;
      margin-bottom: 32px;
      position: relative;

      .title {
        font-size: 17px;
        font-weight: 500;
        color: #000;
      }

      .close {
        position: absolute;
        right: 16px;
        font-size: 24px;
        color: #999;
        cursor: pointer;
      }
    }

    .password-dots {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 24px;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: #e0e0e0;

        &.active {
          background: #000;
        }
      }
    }

    .forgot-password {
      text-align: center;
      font-size: 14px;
      color: #4171ff;
      margin-bottom: 24px;
      cursor: pointer;
      user-select: none;  // 防止文字被选中

      &:active {
        opacity: 0.8;  // 点击效果
      }
    }

    .number-keyboard {
      background: #f5f7fa;
      padding: 8px 8px 32px;

      .keyboard-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;

        .key {
          flex: 1;
          height: 52px;
          background: #fff;
          border-radius: 8px;
          margin: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: 500;
          color: #333;
          position: relative;

          &:active {
            background: #f0f0f0;
          }

          &.empty {
            background: transparent;
            pointer-events: none;
          }

          &.delete {
            font-size: 24px;
            color: #666;
          }

          &::after {
            display: none;
          }
        }
      }
    }
  }
}
</style> 