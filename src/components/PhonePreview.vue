<template>
  <div class="phone-preview">
    <div class="phone-container">
      <!-- 手机状态栏 -->
      <div class="status-bar">
        <span class="time">{{ currentTime }}</span>
        <div class="right-icons">
          <i class="signal"></i>
          <i class="wifi"></i>
          <i class="battery"></i>
        </div>
      </div>

      <!-- 导航栏 -->
      <div class="nav-bar">
        <i class="back-icon">←</i>
        <span class="title">{{ month }}</span>
        <i class="more-icon">⋮</i>
      </div>

      <!-- 工资内容区域 -->
      <div class="salary-content">
        <!-- 温馨提示显示区域 -->
        <div class="tips-alert" v-if="remarks">
          <div class="tips-icon">
            <el-icon><Warning /></el-icon>
          </div>
          <div class="tips-content">{{ remarks }}</div>
        </div>

        <!-- 实发工资卡片 -->
        <div class="salary-card">
          <div class="label">实际发放（元）</div>
          <div class="amount">{{ formatAmount(salaryData?.['实发工资']) }}</div>
        </div>

        <!-- 员工信息区块 -->
        <div v-if="hasEmployeeInfo" class="info-section">
          <div class="section-title">员工信息</div>
          <div class="info-items">
            <div v-if="employeeInfo?.name" class="item">
              <span class="label">员工姓名</span>
              <span class="value">{{ salaryData?.name }}</span>
            </div>
            <div v-if="employeeInfo?.employeeId" class="item">
              <span class="label">工号</span>
              <span class="value">{{ salaryData?.employeeId }}</span>
            </div>
            <div v-if="employeeInfo?.department" class="item">
              <span class="label">所属部门</span>
              <span class="value">{{ salaryData?.department }}</span>
            </div>
            <div v-if="employeeInfo?.position" class="item">
              <span class="label">工作岗位</span>
              <span class="value">{{ salaryData?.position }}</span>
            </div>
            <div v-if="employeeInfo?.company" class="item">
              <span class="label">合同公司</span>
              <span class="value">{{ salaryData?.company }}</span>
            </div>
            <div v-if="employeeInfo?.companyName" class="item">
              <span class="label">企业名称</span>
              <span class="value">{{ salaryData?.companyName }}</span>
            </div>
          </div>
        </div>

        <!-- 工资明细区块 -->
        <div class="salary-details">
          <template v-for="category in props.categories" :key="category?.id">
            <div class="section" v-if="category && getCheckedItems(category).length > 0">
              <div class="section-title">{{ category.name }}</div>
              <div 
                v-for="item in getCheckedItems(category)" 
                :key="item?.id"
                class="item"
              >
                <div class="label-wrapper">
                  <span class="label">{{ item.name }}</span>
                  <el-tooltip 
                    v-if="item.help"
                    :content="item.help"
                    placement="top"
                    effect="light"
                  >
                    <el-icon class="help-icon"><QuestionFilled /></el-icon>
                  </el-tooltip>
                </div>
                <span class="value">{{ formatAmount(props.salaryData[item.name]) }}</span>
              </div>
            </div>
          </template>
        </div>

        <!-- 备注信息 -->
        <div class="remarks" v-if="remarks">
          <div class="section-title">备注</div>
          <div class="remarks-content">{{ remarks }}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- 帮助说明弹窗 -->
  <el-dialog
    v-model="helpDialogVisible"
    :title="currentItem?.name + '说明'"
    width="300px"
    align-center
  >
    <div class="help-content">{{ currentItem?.help }}</div>
    <template #footer>
      <el-button type="primary" @click="helpDialogVisible = false">我知道了</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Warning, QuestionFilled } from '@element-plus/icons-vue'

const props = defineProps({
  salaryData: {
    type: Object,
    default: () => ({})
  },
  remarks: {
    type: String,
    default: ''
  },
  employeeInfo: {
    type: Object,
    default: () => ({
      name: true,
      employeeId: true,
      department: true,
      position: true,
      company: false,
      companyName: false
    })
  },
  categories: {
    type: Array,
    default: () => []
  },
  payrollMonth: {
    type: String,
    default: ''
  }
})

// 当前时间
const currentTime = ref('18:54')

// 更新时间
const updateTime = () => {
  const now = new Date()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  currentTime.value = `${hours}:${minutes}`
}

// 月份显示
const month = computed(() => {
  if (!props.payrollMonth) return ''
  const year = props.payrollMonth.substring(0, 4)
  const month = props.payrollMonth.substring(4, 6)
  return `${year}年${month}月`
})

// 是否显示员工信息区块
const hasEmployeeInfo = computed(() => {
  return props.employeeInfo && Object.values(props.employeeInfo).some(value => value)
})

// 格式化金额
const formatAmount = (value) => {
  if (!value) return '0.00'
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 获取已勾选的工资项
const getCheckedItems = (category) => {
  if (!category || !category.items) return []
  return category.items.filter(item => 
    item && 
    item.name && 
    item.checked
  )
}

// 帮助说明弹窗
const helpDialogVisible = ref(false)
const currentItem = ref(null)

const showHelpDialog = (item) => {
  currentItem.value = item
  helpDialogVisible.value = true
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000)
})
</script>

<style lang="scss" scoped>
.phone-preview {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  .phone-container {
    width: 280px;
    height: 580px;
    background: #fff;
    border-radius: 40px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 0 10px #1a1a1a,
                0 0 0 11px #282828,
                10px 10px 30px rgba(0, 0, 0, 0.3);

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 50%;
      height: 30px;
      background: #1a1a1a;
      border-bottom-left-radius: 20px;
      border-bottom-right-radius: 20px;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 50%;
      transform: translateX(-50%);
      width: 40%;
      height: 4px;
      background: #1a1a1a;
      border-radius: 2px;
    }
  }

  .status-bar {
    height: 32px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fff;
    font-size: 14px;

    .right-icons {
      display: flex;
      gap: 4px;
    }
  }

  .nav-bar {
    height: 36px;
    padding: 0 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;

    .back-icon, .more-icon {
      font-size: 20px;
      color: #333;
    }

    .title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .salary-content {
    height: calc(100% - 68px);
    overflow-y: auto;
    background: #f5f5f5;
    padding: 16px;

    .salary-card {
      background: linear-gradient(135deg, #409EFF, #79bbff);
      padding: 20px;
      border-radius: 12px;
      color: #fff;
      margin-bottom: 16px;

      .label {
        font-size: 14px;
        opacity: 0.9;
      }

      .amount {
        font-size: 28px;
        font-weight: bold;
        margin-top: 8px;
      }
    }

    .salary-details {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;

      .section {
        padding: 16px;

        &:not(:last-child) {
          border-bottom: 1px solid #eee;
        }

        .section-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 12px;
          color: #333;
        }

        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          
          .label-wrapper {
            display: flex;
            align-items: center;
            gap: 4px;

            .help-icon {
              font-size: 14px;
              color: #909399;
              cursor: help;
              
              &:hover {
                color: var(--el-color-primary);
              }
            }
          }
        }
      }
    }

    .remarks {
      margin-top: 16px;
      background: #fff;
      border-radius: 12px;
      padding: 16px;

      .section-title {
        font-size: 16px;
        font-weight: 500;
        margin-bottom: 8px;
        color: #333;
      }

      .remarks-content {
        font-size: 14px;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}

.info-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;

  .section-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
  }

  .info-items {
    .item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 14px;

      .label {
        color: #666;
      }

      .value {
        color: #333;
      }
    }
  }
}

.tips-alert {
  background: #fff;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;

  .tips-icon {
    color: #E6A23C;
    margin-top: 2px;
  }

  .tips-content {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #666;
    white-space: pre-wrap;
  }
}
</style> 