<template>
  <el-menu>
    <el-menu-item @click="handleSendSalary">
      发送工资条
    </el-menu-item>
    <!-- 其他菜单项 -->
  </el-menu>
</template>

<script>
import { useRouter } from 'vue-router'

export default {
  setup() {
    const router = useRouter()

    const handleSendSalary = () => {
      // 使用命名路由导航到发送工资条页面
      router.push({ name: 'SendSalary' })
    }

    return {
      handleSendSalary
    }
  }
}
</script> 