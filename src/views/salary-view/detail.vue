<!--
 * @Description: 工资历史明细页面
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->
<template>
  <div class="salary-detail">
    <!-- 头部 -->
    <div class="header">
      <div class="back" @click="router.back()">〈</div>
      <div class="title">工资条</div>
      <div class="placeholder"></div>
    </div>

    <!-- 年份选择器 -->
    <div class="year-selector">
      <div 
        v-for="year in years" 
        :key="year"
        :class="['year-item', { active: selectedYear === year }]"
        @click="selectedYear = year"
      >
        {{ year }}年
      </div>
    </div>

    <!-- 工资条列表 -->
    <div class="salary-list">
      <div 
        v-for="month in monthList" 
        :key="month.month"
        class="salary-item"
        @click="goToDetail(month)"
      >
        <div class="month">{{ month.month }}月</div>
        <div class="amount">
          <span class="label">实发工资</span>
          <span class="value">¥ {{ formatAmount(month.detail?.actualAmount) }}</span>
        </div>
        <div class="arrow">〉</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const selectedYear = ref(new Date().getFullYear())

// Mock数据
const mockData = {
  years: [2024, 2023],
  salaryData: {
    "2024": [
      {
        month: 3,
        detail: {
          actualAmount: 8500.00
        }
      },
      {
        month: 2,
        detail: {
          actualAmount: 8500.00
        }
      },
      {
        month: 1,
        detail: {
          actualAmount: 8500.00
        }
      }
    ],
    "2023": [
      {
        month: 12,
        detail: {
          actualAmount: 8000.00
        }
      },
      {
        month: 11,
        detail: {
          actualAmount: 8000.00
        }
      }
    ]
  }
}

// 获取年份列表
const years = computed(() => mockData.years)

// 获取当前年份的月度数据
const monthList = computed(() => {
  return mockData.salaryData[selectedYear.value] || []
})

// 格式化金额
const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '-'
  return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 跳转到月度详情
const goToDetail = (month) => {
  router.push({
    path: '/salary-view/month-detail',
    query: {
      year: selectedYear.value,
      month: month.month
    }
  })
}
</script>

<style lang="scss" scoped>
.salary-detail {
  min-height: 100vh;
  background: #f5f7fa;

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

  .year-selector {
    display: flex;
    padding: 12px 16px;
    background: #fff;
    overflow-x: auto;
    margin-bottom: 12px;

    .year-item {
      padding: 6px 16px;
      border-radius: 16px;
      font-size: 14px;
      color: #666;
      margin-right: 12px;
      cursor: pointer;

      &.active {
        background: #4171ff;
        color: #fff;
      }
    }
  }

  .salary-list {
    padding: 0 16px;

    .salary-item {
      background: #fff;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 12px;
      position: relative;
      cursor: pointer;

      &:active {
        opacity: 0.8;
      }

      .month {
        font-size: 16px;
        font-weight: 500;
        color: #333;
        margin-bottom: 12px;
      }

      .amount {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .label {
          font-size: 14px;
          color: #666;
        }

        .value {
          font-size: 16px;
          color: #333;
          font-weight: 500;
          padding-right: 24px; // 为箭头留出空间
        }
      }

      .arrow {
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: #999;
        font-size: 16px;
      }
    }
  }
}
</style> 