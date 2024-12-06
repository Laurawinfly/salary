<!--
 * @Description: 工资条身份验证页面
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->
<template>
  <div class="verify-page">
    <!-- 头部 -->
    <div class="header">
      <div class="back" @click="handleBack">〈</div>
      <div class="title">{{ currentStep.title }}</div>
      <div class="placeholder"></div>
    </div>

    <!-- 验证步骤 -->
    <div class="verify-container">
      <!-- 手机号验证码步骤 -->
      <div v-if="step === 'sms'" class="step-container">
        <div class="form-title">输入手机号验证码</div>
        <div class="form-subtitle">
          请输入发送至 +86{{ maskPhone(phone) }} 的 6 位验证码，有效期 10 分钟
        </div>
        
        <div class="code-input">
          <div class="input-wrapper">
            <input 
              v-for="(digit, index) in 6" 
              :key="index"
              ref="codeInputs"
              v-model="smsCode[index]"
              type="tel"
              maxlength="1"
              @input="handleCodeInput(index)"
              @keydown.delete="handleDelete(index)"
            >
            <div class="code-dash"></div>
          </div>
        </div>

        <div class="countdown">
          {{ countdown > 0 ? `${countdown} 秒后可重新获取验证码` : '重新获取验证码' }}
        </div>
      </div>

      <!-- 设置密码步骤 -->
      <div v-if="step === 'setPassword'" class="step-container">
        <div class="form-subtitle">请输入四位阿拉伯数字密码 <span class="eye-icon">👁</span></div>
        
        <div class="password-dots">
          <div 
            v-for="(dot, index) in 4" 
            :key="index"
            :class="['dot', { active: password.length > index }]"
          ></div>
        </div>

        <div class="password-tip">
          安全密码是你在使用涉及到敏感操作和敏感数据的功能时用于进行身份确认的安全措施，请妥善保管该密码，切勿告知他人
        </div>
      </div>

      <!-- 确认密码步骤 -->
      <div v-if="step === 'confirmPassword'" class="step-container">
        <div class="form-subtitle">请输入四位阿拉伯数字密码</div>
        
        <div class="password-dots">
          <div 
            v-for="(dot, index) in 4" 
            :key="index"
            :class="['dot', { active: confirmPassword.length > index }]"
          ></div>
        </div>

        <div class="password-tip">
          安全密码是你在使用涉及到敏感操作和敏感数据的功能时用于进行身份确认的安全措施，请妥善保管该密码，切勿告知他人
        </div>
      </div>
    </div>

    <!-- 数字键盘 -->
    <div v-if="step !== 'sms'" class="number-keyboard">
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const step = ref('sms') // sms -> setPassword -> confirmPassword
const phone = ref('18512345678') // 从B端获取的手机号
const smsCode = ref(['', '', '', '', '', ''])
const password = ref('')
const confirmPassword = ref('')
const countdown = ref(0)
const codeInputs = ref([])

// 当前步骤的标题
const currentStep = computed(() => {
  const steps = {
    sms: { title: '身份验证' },
    setPassword: { title: '请设置新安全密码' },
    confirmPassword: { title: '再次输入安全密码' }
  }
  return steps[step.value]
})

// 手机号脱敏
const maskPhone = (phone) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

// 初始化时启动倒计时
onMounted(() => {
  sendCode()
})

// 发送验证码
const sendCode = () => {
  if (countdown.value > 0) return
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value === 0) {
      clearInterval(timer)
    }
  }, 1000)
}

// 处理验证码输入
const handleCodeInput = (index) => {
  if (smsCode.value[index] && index < 5) {
    codeInputs.value[index + 1]?.focus()
  }
  
  // 验证码输入完成
  if (smsCode.value.every(v => v)) {
    // TODO: 验证验证码
    setTimeout(() => {
      step.value = 'setPassword'
    }, 500)
  }
}

// 处理验证码删除
const handleDelete = (index) => {
  if (!smsCode.value[index] && index > 0) {
    smsCode.value[index - 1] = ''
    codeInputs.value[index - 1]?.focus()
  }
}

// 输入密码数字
const inputNumber = (num) => {
  if (step.value === 'setPassword' && password.value.length < 4) {
    password.value += num
    if (password.value.length === 4) {
      setTimeout(() => {
        step.value = 'confirmPassword'
      }, 500)
    }
  } else if (step.value === 'confirmPassword' && confirmPassword.value.length < 4) {
    confirmPassword.value += num
    if (confirmPassword.value.length === 4) {
      if (password.value === confirmPassword.value) {
        // 保存密码
        localStorage.setItem('salary_password', password.value)
        localStorage.setItem('salary_verified', 'true')
        // 返回首页
        router.push('/salary-view')
      } else {
        alert('两次输入的密码不一致')
        confirmPassword.value = ''
      }
    }
  }
}

// 删除密码数字
const deleteNumber = () => {
  if (step.value === 'setPassword') {
    password.value = password.value.slice(0, -1)
  } else if (step.value === 'confirmPassword') {
    confirmPassword.value = confirmPassword.value.slice(0, -1)
  }
}

// 返回处理
const handleBack = () => {
  if (step.value === 'confirmPassword') {
    step.value = 'setPassword'
    confirmPassword.value = ''
  } else if (step.value === 'setPassword') {
    step.value = 'sms'
    password.value = ''
  } else {
    router.back()
  }
}
</script>

<style lang="scss" scoped>
.verify-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;

  .header {
    height: 44px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    border-bottom: 1px solid #f0f0f0;

    .back {
      font-size: 18px;
      color: #333;
      cursor: pointer;
    }

    .title {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .placeholder {
      width: 20px;
    }
  }

  .verify-container {
    flex: 1;
    padding: 32px 20px;

    .step-container {
      .form-subtitle {
        font-size: 15px;
        color: #666;
        margin-bottom: 40px;
        text-align: center;
        padding-top: 40px;
      }
    }

    .code-input {
      padding: 0 20px;
      margin-bottom: 24px;

      .input-wrapper {
        max-width: 360px;
        min-width: 280px;
        margin: 0 auto;
        display: flex;
        justify-content: center;
        gap: 16px;
        position: relative;

        input {
          width: 40px;
          height: 44px;
          border: 1px solid #e0e0e0;
          border-radius: 4px;
          text-align: center;
          font-size: 24px;
          color: #333;
          outline: none;
          background: #fff;
          padding: 0;

          &:focus {
            border-color: #4171ff;
          }
        }

        input:nth-child(3) {
          margin-right: 32px;
        }

        input:nth-child(4) {
          margin-left: 0;
        }

        .code-dash {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 1px;
          background: #999;
        }
      }
    }

    .countdown {
      text-align: center;
      font-size: 14px;
      color: #999;
      margin-top: 24px;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }
    }

    .password-dots {
      display: flex;
      justify-content: center;
      gap: 24px;  // 调整点之间的间距
      margin-bottom: 60px;  // 增加与提示文字的间距

      .dot {
        width: 12px;  // 调整点的大小
        height: 12px;
        border-radius: 50%;
        background: #e0e0e0;

        &.active {
          background: #000;
        }
      }
    }

    .password-tip {
      font-size: 13px;
      color: #666;
      line-height: 1.8;
      text-align: center;
      padding: 0 40px;  // 增加两侧内边距
      word-break: break-all;  // 允许在任意字符间换行
      word-wrap: break-word;  // 允许长单词换行
      white-space: normal;    // 正常换行
      max-width: 100%;        // 确保不超出容器
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
        position: relative;  // 为字母定位

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

        // 移除字母相关样式
        &::after {
          display: none;
        }
      }
    }
  }
}
</style> 