<template>
  <div class="salary-push">
    <!-- 向导步骤 -->
    <el-steps :active="2" finish-status="success">
      <el-step title="核对人员工资" />
      <el-step title="选择工资条显示" />
      <el-step title="发送工资条" />
    </el-steps>

    <div class="push-content">
      <!-- 发送方式提示 -->
      <div class="send-tips">
        <el-alert type="info" :closable="false" show-icon>
          <template #title>
            发送方式：优先发送微信通知，无微信发送短信通知（预计发送
            <span class="highlight">{{ smsCount }}</span>条短信通知），员工查看工资条后，若未确认，
            <span class="highlight">3</span>天后系统自动确认。
            <el-button type="primary" link @click="handleModify">修改</el-button>
          </template>
        </el-alert>
      </div>

      <!-- 员工列表 -->
      <div class="employee-list">
        <div class="list-header">
          <div class="selected-count">
            已选择<span>{{ selectedCount }}</span>人
          </div>
          <div class="actions">
            <el-button type="primary" plain @click="handleRefresh">
              <el-icon><Refresh /></el-icon>
              刷新
            </el-button>
            <el-button type="primary" plain @click="handleSync">
              <el-icon><Connection /></el-icon>
              同步员工信息
            </el-button>
            <el-button type="primary" plain @click="handleViewScope">
              <el-icon><View /></el-icon>
              查看可用额度
            </el-button>
          </div>
        </div>

        <!-- 搜索栏 -->
        <div class="search-bar">
          <el-input
            v-model="searchKeyword"
            placeholder="姓名/工号"
            prefix-icon="Search"
            clearable
          />
        </div>

        <!-- 员工表格 -->
        <el-table
          :data="filteredEmployees"
          border
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="50" />
          <el-table-column label="姓名" prop="name" min-width="100" />
          <el-table-column label="工号" prop="employeeId" min-width="100" />
          <el-table-column label="部门" prop="department" min-width="120" />
          <el-table-column label="岗位" prop="position" min-width="120" />
          <el-table-column label="手机号" prop="phone" min-width="120" />
          <el-table-column label="发送状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.sent ? 'success' : 'info'">
                {{ row.sent ? '已发送' : '未发送' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="确认状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.confirmed ? 'success' : row.sent ? 'warning' : 'info'">
                {{ row.confirmed ? '已确认' : row.sent ? '待确认' : '-' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button 
                type="primary" 
                link 
                @click="handlePreview(row)"
              >
                预览
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 底部操作栏 -->
        <div class="footer-actions">
          <el-button @click="handlePrev">上一步</el-button>
          <el-button type="primary" @click="handleBatchSend">批量发送</el-button>
        </div>
      </div>
    </div>

    <!-- 预览抽屉 -->
    <el-drawer
      v-model="previewDialog.visible"
      :title="previewDialog.title"
      direction="rtl"
      size="460px"
      :close-on-click-modal="false"
      destroy-on-close
      class="preview-drawer"
    >
      <div class="preview-wrapper">
        <PhonePreview 
          :salary-data="previewDialog.data"
          :remarks="previewDialog.remarks"
          :employee-info="previewDialog.employeeInfo"
          :categories="previewDialog.categories"
          :payroll-month="previewDialog.month"
        />
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, Connection, View, Search } from '@element-plus/icons-vue'
import PhonePreview from '@/components/PhonePreview.vue'

const router = useRouter()

// 数据
const employees = ref([])
const selectedEmployees = ref([])
const searchKeyword = ref('')
const smsCount = ref(0)

// 预览弹窗数据
const previewDialog = reactive({
  visible: false,
  title: '',
  data: {},
  remarks: '',
  employeeInfo: {},
  categories: [],
  month: ''
})

// 计算属性
const selectedCount = computed(() => selectedEmployees.value.length)

const filteredEmployees = computed(() => {
  if (!searchKeyword.value) return employees.value
  
  const keyword = searchKeyword.value.toLowerCase()
  return employees.value.filter(emp => 
    emp.name.toLowerCase().includes(keyword) ||
    emp.employeeId.toLowerCase().includes(keyword)
  )
})

// 初始化数据
const initData = () => {
  try {
    // 检查必要的数据是否存在
    const salaryData = localStorage.getItem('salaryTableData')
    const displayConfig = localStorage.getItem('salaryDisplayConfig')
    const currentConfig = localStorage.getItem('currentSalaryConfig')

    if (!salaryData || !displayConfig || !currentConfig) {
      ElMessage.warning('缺少必要的配置数据')
      router.replace('/salary/send')
      return
    }

    // 从 localStorage 获取工资表数据
    const parsedSalaryData = JSON.parse(salaryData)
    
    // 从 localStorage 获取已发送记录
    const sentRecords = JSON.parse(localStorage.getItem('salaryRecords') || '[]')
    
    // 合并数据
    employees.value = parsedSalaryData.map(emp => {
      const sentRecord = sentRecords.find(record => 
        record.employeeId === emp.employeeId && record.name === emp.name
      )
      return {
        ...emp,
        sent: !!sentRecord,
        confirmed: sentRecord?.confirmed || false,
        sendTime: sentRecord?.sendTime || null,
        confirmTime: sentRecord?.confirmTime || null
      }
    })
    
    // 计算需要发送短信的人数
    smsCount.value = employees.value.filter(emp => !emp.sent).length
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('加载数据失败')
    router.replace('/salary/send')
  }
}

// 格式化金额
const formatAmount = (amount) => {
  return Number(amount).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedEmployees.value = selection
}

// 处理预览
const handlePreview = (employee) => {
  try {
    // 获取工资条配置
    const config = JSON.parse(localStorage.getItem('currentSalaryConfig') || '{}')
    const displayConfig = JSON.parse(localStorage.getItem('salaryDisplayConfig') || '{}')
    const salaryData = JSON.parse(localStorage.getItem('salaryTableData') || '[]')

    // 获取当前员工的工资数据
    const employeeData = salaryData.find(item => 
      item.employeeId === employee.employeeId && item.name === employee.name
    )

    if (!employeeData) {
      ElMessage.error('未找到员工工资数据')
      return
    }

    // 设置预览数据
    previewDialog.title = `${employee.name}的工资条预览`
    previewDialog.data = {
      // 基础信息
      name: employeeData.name,
      employeeId: employeeData.employeeId,
      department: employeeData.department,
      position: employeeData.position,
      company: employeeData.company,
      // 工资项
      应发工资: employeeData.grossSalary,
      个人所得税: employeeData.personalIncomeTax,
      实发工资: employeeData.netSalary,
      基本工资: employeeData.basicSalary,
      岗位工资: employeeData.positionSalary,
      绩效工资: employeeData.performanceSalary,
      交通补贴: employeeData.transportAllowance,
      考勤扣款: employeeData.attendanceDeduction,
      个人社保: employeeData.personalInsurance,
      个人公积金: employeeData.personalHousingFund
    }

    // 使用保存的显示配置
    previewDialog.remarks = displayConfig.tips || ''
    previewDialog.employeeInfo = displayConfig.employeeInfo || {
      name: true,
      employeeId: true,
      department: true,
      position: true,
      company: false,
      companyName: false
    }
    previewDialog.categories = displayConfig.categories || [
      {
        id: 1,
        name: '基本项目',
        isSystem: true,
        items: [
          { id: 1, name: '应发工资', checked: true },
          { id: 2, name: '个人所得税', checked: true },
          { id: 3, name: '实发工资', checked: true }
        ]
      },
      {
        id: 2,
        name: '其他明细',
        isSystem: true,
        items: [
          { id: 4, name: '基本工资', checked: true, help: '基本工资标准' },
          { id: 5, name: '岗位工资', checked: true, help: '根据岗位职责确定的工资' },
          { id: 6, name: '绩效工资', checked: true, help: '根据绩效考核结果确定的工资' },
          { id: 7, name: '交通补贴', checked: true, help: '交通补助费用' },
          { id: 8, name: '考勤扣款', checked: true, help: '因迟到、早退、旷工等考勤问题扣除的金额' },
          { id: 9, name: '个人社保', checked: true, help: '个人承担的社会保险费用' },
          { id: 10, name: '个人公积金', checked: true, help: '个人承担的住房公积金' }
        ]
      }
    ]
    previewDialog.month = config.selectedMonth?.replace(/-/g, '') || ''
    
    // 显示预览弹窗
    previewDialog.visible = true
  } catch (error) {
    console.error('预览失败:', error)
    ElMessage.error('预览失败')
  }
}

// 处理刷新
const handleRefresh = () => {
  initData()
  ElMessage.success('数据已刷新')
}

// 处理同步
const handleSync = () => {
  ElMessage.info('正在开发中...')
}

// 处理查看额度
const handleViewScope = () => {
  ElMessage.info('正在开发中...')
}

// 处理修改
const handleModify = () => {
  ElMessage.info('正在开发中...')
}

// 上一步
const handlePrev = () => {
  router.push('/salary/display')
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.salary-push {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .push-content {
    margin-top: 24px;
  }

  .send-tips {
    margin-bottom: 24px;

    .highlight {
      color: var(--el-color-primary);
      font-weight: bold;
      margin: 0 4px;
    }
  }

  .employee-list {
    background: #fff;
    border-radius: 8px;

    .list-header {
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .selected-count {
        font-size: 14px;
        color: #606266;

        span {
          color: var(--el-color-primary);
          font-weight: bold;
          margin: 0 4px;
        }
      }

      .actions {
        display: flex;
        gap: 8px;
      }
    }

    .search-bar {
      margin-bottom: 16px;

      :deep(.el-input) {
        width: 240px;
      }
    }

    .footer-actions {
      margin-top: 24px;
      text-align: center;
    }
  }
}

.preview-drawer {
  :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 16px 20px;
    border-bottom: 1px solid #dcdfe6;
  }

  :deep(.el-drawer__body) {
    padding: 0;
    background: #f5f7fa;
    height: calc(100% - 55px);
    overflow-y: auto;
  }

  .preview-wrapper {
    padding: 20px;
    min-height: 100%;
    box-sizing: border-box;
  }
}
</style>