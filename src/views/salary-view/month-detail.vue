<!--
 * @Description: 月度工资明细页面
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->
<template>
  <div class="month-detail">
    <!-- 头部 -->
    <div class="header">
      <div class="back" @click="router.back()">〈</div>
      <div class="title">{{ year }}年{{ month }}月明细</div>
      <div class="placeholder"></div>
    </div>

    <!-- 实发工资卡片 -->
    <div class="salary-card">
      <div class="status">{{ detail?.signed ? '已签收' : '待签收' }}</div>
      <div class="label">实际发放(元)</div>
      <div class="amount">{{ formatAmount(detail?.actualAmount) }}</div>
    </div>

    <!-- 员工信息 -->
    <div class="info-section">
      <div class="section-title">员工信息</div>
      <div class="info-list">
        <div class="info-item">
          <span class="label">员工姓名</span>
          <span class="value">{{ detail?.employee?.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">工号</span>
          <span class="value">{{ detail?.employee?.id }}</span>
        </div>
      </div>
    </div>

    <!-- 基本项目 -->
    <div class="info-section">
      <div class="section-title">基本项目</div>
      <div class="info-list">
        <div class="info-item">
          <span class="label">应发工资</span>
          <span class="value">{{ formatAmount(detail?.basic?.totalSalary) }}</span>
        </div>
        <div class="info-item">
          <span class="label">个人所得税</span>
          <span class="value">{{ formatAmount(detail?.basic?.tax) }}</span>
        </div>
        <div class="info-item">
          <span class="label">实发工资</span>
          <span class="value">{{ formatAmount(detail?.basic?.actualSalary) }}</span>
        </div>
      </div>
    </div>

    <!-- 其他明细 -->
    <div class="info-section">
      <div class="section-title">其他明细</div>
      <div class="info-list">
        <div class="info-item">
          <span class="label">基本工资</span>
          <span class="value">{{ formatAmount(detail?.others?.baseSalary) }}</span>
        </div>
        <div class="info-item">
          <span class="label">岗位工资</span>
          <span class="value">{{ formatAmount(detail?.others?.positionSalary) }}</span>
        </div>
        <div class="info-item">
          <span class="label">绩效工资</span>
          <span class="value">{{ formatAmount(detail?.others?.performanceSalary) }}</span>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="bottom-buttons" v-if="!detail?.signed">
      <div 
        class="confirm-btn"
        @click="handleConfirm"
      >
        签收确认
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMockData } from '@/api/salary-view'

const route = useRoute()
const router = useRouter()
const detail = ref({
  actualAmount: 3000.00,
  signed: false,  // 添加签收状态
  employee: {
    name: '张示例',
    id: '1002'
  },
  basic: {
    totalSalary: 3300.00,
    tax: 100.00,
    actualSalary: 3000.00
  },
  others: {
    baseSalary: 1000.00,
    positionSalary: 1000.00,
    performanceSalary: 1000.00
  }
})
const year = ref('')
const month = ref('')

// 格式化金额
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '-'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 初始化数据
onMounted(() => {
  // 从路由参数获取年月
  year.value = route.query.year
  month.value = route.query.month

  // 获取详情数据
  const { history } = getMockData()
  
  // 查找对应年份的公司数据
  const yearData = history[year.value] || []
  
  // 查找月份数据
  for (const company of yearData) {
    const monthData = company.months.find(m => m.month === Number(month.value))
    if (monthData) {
      detail.value = monthData.detail
      break
    }
  }
})

// 处理签收确认
const handleConfirm = () => {
  if (detail.value.signed) return
  detail.value.signed = true
  // TODO: 调用签收API
}
</script>

<style lang="scss" scoped>
.month-detail {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 0 16px 80px;  // 增加底部内边距，为按钮留空间

  .header {
    height: 44px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 16px;
    background: #fff;
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

  .salary-card {
    background: linear-gradient(90deg, #4171ff, #6c8dff);
    margin-top: 16px;
    padding: 24px;
    color: #fff;
    border-radius: 12px;
    text-align: center;
    position: relative;  // 为状态标签定位

    .status {
      position: absolute;
      top: 16px;
      right: 16px;
      background: rgba(255, 255, 255, 0.2);
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
    }

    .label {
      font-size: 14px;
      margin-bottom: 8px;
      opacity: 0.9;
    }

    .amount {
      font-size: 32px;
      font-weight: 500;
    }
  }

  .info-section {
    margin-top: 16px;  // 统一间距
    border-radius: 12px;  // 统一圆角
    background: #fff;
    overflow: hidden;

    .section-title {
      padding: 12px 16px;
      color: #666;
      font-size: 14px;
      background: #fafafa;
    }

    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 16px;
        font-size: 14px;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .label {
          color: #666;
        }

        .value {
          color: #333;
        }
      }
    }
  }

  .bottom-buttons {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 16px;
    background: #fff;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    .confirm-btn {
      height: 44px;
      background: #4171ff;
      border-radius: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 16px;
      margin: 0 16px;

      &:active {
        opacity: 0.8;
      }
    }
  }
}
</style> 