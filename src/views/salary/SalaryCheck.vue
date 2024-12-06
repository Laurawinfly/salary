<!--
 * @Description: 工资核对组件
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->
<template>
  <div class="salary-check">
    <!-- 向导步骤 -->
    <el-steps :active="0" finish-status="success" class="salary-steps">
      <el-step title="核对人员工资" />
      <el-step title="选择工资条显示" />
      <el-step title="发送工资条" />
    </el-steps>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <!-- 普通筛选 -->
      <div class="basic-filter">
        <el-input
          v-model="filterForm.keyword"
          placeholder="姓名/工号"
          class="search-input"
          clearable
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <!-- 高级筛选按钮和下拉内容 -->
        <el-popover
          v-model:visible="showAdvancedFilter"
          placement="bottom-start"
          :width="800"
          trigger="click"
          popper-class="filter-popover"
        >
          <template #reference>
            <el-button class="filter-btn">
              <el-icon><Filter /></el-icon>
            </el-button>
          </template>

          <!-- 筛选内容 -->
          <div class="advanced-filter">
            <h4>高级筛选</h4>
            <el-form :model="filterForm" label-width="80px">
              <div class="filter-row">
                <!-- 岗位 -->
                <el-form-item label="岗位">
                  <el-select
                    v-model="filterForm.positions"
                    multiple
                    collapse-tags
                    placeholder="请选择岗位"
                    clearable
                  >
                    <el-option
                      v-for="item in positions"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>

                <!-- 工作性质 -->
                <el-form-item label="工作性质">
                  <el-select
                    v-model="filterForm.jobTypes"
                    multiple
                    collapse-tags
                    placeholder="请选择工作性质"
                    clearable
                  >
                    <el-option
                      v-for="item in jobTypes"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>

                <!-- 员工状态 -->
                <el-form-item label="员工状态">
                  <el-select
                    v-model="filterForm.status"
                    multiple
                    collapse-tags
                    placeholder="请选择员工状态"
                    clearable
                  >
                    <el-option
                      v-for="item in employeeStatus"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>

                <!-- 合同公司 -->
                <el-form-item label="合同公司">
                  <el-select
                    v-model="filterForm.companies"
                    multiple
                    collapse-tags
                    placeholder="请选择合同公司"
                    clearable
                  >
                    <el-option
                      v-for="item in companies"
                      :key="item"
                      :label="item"
                      :value="item"
                    />
                  </el-select>
                </el-form-item>
              </div>

              <!-- 筛选操作按钮 -->
              <div class="filter-footer">
                <el-button @click="resetFilter">重置</el-button>
                <el-button type="primary" @click="handleFilter">确定</el-button>
              </div>
            </el-form>
          </div>
        </el-popover>
      </div>
    </div>

    <!-- 列表 -->
    <div class="salary-list">
      <h2>{{ listTitle }}</h2>
      <el-table :data="filteredTableData" border>
        <!-- 选择列 -->
        <el-table-column type="selection" width="50" fixed="left" />
        <!-- 序号列 -->
        <el-table-column type="index" label="序号" width="60" fixed="left" />
        <!-- 动态列 -->
        <el-table-column
          v-for="column in tableColumns"
          :key="column.prop"
          :prop="column.prop"
          :label="column.label"
          :width="column.width"
          :min-width="column.minWidth"
        >
          <!-- 金额列右对齐 -->
          <template #default="scope" v-if="column.isSalary">
            <span style="float: right">{{ scope.row[column.prop] }}</span>
          </template>
        </el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              修改
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-actions">
      <el-button type="primary" @click="handleNext">下一步</el-button>
    </div>

    <!-- 修改表单弹窗 -->
    <el-drawer
      v-model="editDrawer.visible"
      title="修改员工工资"
      direction="rtl"
      size="500px"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        :rules="editRules"
        label-width="100px"
      >
        <el-form-item
          v-for="field in editableFields"
          :key="field.prop"
          :label="field.label"
          :prop="field.prop"
        >
          <el-input
            v-model="editForm[field.prop]"
            :disabled="field.disabled"
            :placeholder="field.placeholder"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="drawer-footer">
          <el-button @click="editDrawer.visible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Search, Filter } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()

// 获取当前工资配置
const currentConfig = computed(() => {
  const config = localStorage.getItem('currentSalaryConfig')
  return config ? JSON.parse(config) : null
})

// 筛选表单数据
const filterForm = reactive({
  keyword: '',
  positions: [],
  jobTypes: [],
  status: [],
  companies: []
})

// 从上传的模板中读取的选项数据
const positions = ref([])  // 岗位选项
const jobTypes = ref([])   // 工作性质选项
const companies = ref([])  // 合同公司选项
const employeeStatus = ref(['在职', '离职', '待入职'])  // 员工状态选项（固定）

// 表格数据
const tableData = ref([])

// 列表标题
const listTitle = computed(() => {
  if (currentConfig.value) {
    const date = new Date(currentConfig.value.selectedMonth)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${year}年${month}月-${currentConfig.value.salaryName}`
  }
  return ''
})

// 表格列配置
const tableColumns = ref([
  { prop: 'name', label: '姓名', minWidth: 100 },
  { prop: 'employeeId', label: '工号', minWidth: 100 },
  { prop: 'department', label: '部门', minWidth: 120 },
  { prop: 'position', label: '岗位', minWidth: 120 },
  { prop: 'jobType', label: '工作性质', minWidth: 100 },
  { prop: 'status', label: '员工状态', minWidth: 100 },
  { prop: 'company', label: '合同公司', minWidth: 150 },
  { prop: 'phone', label: '手机号', minWidth: 120 },
  { prop: 'basicSalary', label: '基本工资', minWidth: 100, isSalary: true },
  { prop: 'positionSalary', label: '岗位工资', minWidth: 100, isSalary: true },
  { prop: 'performanceSalary', label: '绩效工资', minWidth: 100, isSalary: true },
  { prop: 'transportAllowance', label: '交通补贴', minWidth: 100, isSalary: true },
  { prop: 'attendanceDeduction', label: '考勤扣款', minWidth: 100, isSalary: true },
  { prop: 'grossSalary', label: '应发工资', minWidth: 100, isSalary: true },
  { prop: 'personalInsurance', label: '个人社保', minWidth: 100, isSalary: true },
  { prop: 'personalHousingFund', label: '个人公积金', minWidth: 100, isSalary: true },
  { prop: 'personalIncomeTax', label: '个人所得税', minWidth: 100, isSalary: true },
  { prop: 'netSalary', label: '实发工资', minWidth: 100, isSalary: true }
])

// 过滤后的表格数据
const filteredTableData = computed(() => {
  let result = [...tableData.value]

  // 关键字搜索
  if (filterForm.keyword) {
    const keyword = filterForm.keyword.toLowerCase()
    result = result.filter(item => 
      item.name?.toLowerCase().includes(keyword) ||
      item.employeeId?.toLowerCase().includes(keyword)
    )
  }

  // 岗位筛选
  if (filterForm.positions.length > 0) {
    result = result.filter(item => filterForm.positions.includes(item.position))
  }

  // 工作性质筛选
  if (filterForm.jobTypes.length > 0) {
    result = result.filter(item => filterForm.jobTypes.includes(item.jobType))
  }

  // 员工状态筛选
  if (filterForm.status.length > 0) {
    result = result.filter(item => filterForm.status.includes(item.status))
  }

  // 合同公司筛选
  if (filterForm.companies.length > 0) {
    result = result.filter(item => filterForm.companies.includes(item.company))
  }

  return result
})

// 编辑相关数据
const editDrawer = reactive({
  visible: false,
  currentRow: null
})

const editForm = reactive({})
const editFormRef = ref(null)

// 编辑规则
const editRules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式有误', trigger: 'blur' }
  ],
  basicSalary: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  positionSalary: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  performanceSalary: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  transportAllowance: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  attendanceDeduction: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  grossSalary: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  personalInsurance: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  personalHousingFund: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  personalIncomeTax: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ],
  netSalary: [
    { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
  ]
}

// 可编辑字段配置
const editableFields = computed(() => {
  return tableColumns.value.map(column => {
    const isDisabled = ['name', 'employeeId'].includes(column.prop)
    const isSalary = [
      'basicSalary', 'positionSalary', 'performanceSalary',
      'transportAllowance', 'attendanceDeduction', 'grossSalary',
      'personalInsurance', 'personalHousingFund', 'personalIncomeTax',
      'netSalary'
    ].includes(column.prop)

    return {
      ...column,
      disabled: isDisabled,
      placeholder: isSalary 
        ? '请输入数值，最多只允许2位小数' 
        : column.prop === 'phone'
          ? '请输入手机号'
          : `请输入${column.label}`
    }
  })
})

// 从模板数据中提取选项值
const extractOptionsFromTemplate = (data) => {
  // 提取岗位选项
  const positionSet = new Set(data.map(item => item.position).filter(Boolean))
  positions.value = Array.from(positionSet)

  // 提取工作性质选项
  const jobTypeSet = new Set(data.map(item => item.jobType).filter(Boolean))
  jobTypes.value = Array.from(jobTypeSet)

  // 提取合同公司选项
  const companySet = new Set(data.map(item => item.company).filter(Boolean))
  companies.value = Array.from(companySet)
}

// 初始化数据
const initData = () => {
  try {
    // 从 localStorage 获取数据
    const data = localStorage.getItem('salaryTableData')
    if (data) {
      const parsedData = JSON.parse(data)
      // 处理数据，将中文字段名映射到英文字段名
      tableData.value = parsedData.map(item => {
        const mappedItem = {
          name: item['姓名'] || item['名字'] || item.name || '',
          employeeId: item['工号'] || item.employeeId || '',
          department: item['部门'] || item.department || '',
          position: item['岗位'] || item.position || '',
          jobType: item['工作性质'] || item.jobType || '全职',
          status: item['员工状态'] || item.status || '在职',
          company: item['合同公司'] || item.company || '',
          phone: item['手机号'] || item['手机号码'] || item.phone || '',
          basicSalary: item['基本工资'] || item.basicSalary || '0',
          positionSalary: item['岗位工资'] || item.positionSalary || '0',
          performanceSalary: item['绩效工资'] || item.performanceSalary || '0',
          transportAllowance: item['交通补贴'] || item.transportAllowance || '0',
          attendanceDeduction: item['考勤扣款'] || item.attendanceDeduction || '0',
          grossSalary: item['应发工资'] || item.grossSalary || '0',
          personalInsurance: item['个人社保'] || item.personalInsurance || '0',
          personalHousingFund: item['个人公积金'] || item.personalHousingFund || '0',
          personalIncomeTax: item['个人所得税'] || item.personalIncomeTax || '0',
          netSalary: item['实发工资'] || item.netSalary || '0'
        }
        // 格式化金额字段
        Object.keys(mappedItem).forEach(key => {
          if (tableColumns.value.find(col => col.prop === key && col.isSalary)) {
            mappedItem[key] = Number(mappedItem[key]).toFixed(2)
          }
        })
        return mappedItem
      })

      // 提取选项数据
      extractOptionsFromTemplate(tableData.value)
    } else {
      ElMessage.warning('没有找到工资数据')
      router.replace('/salary/send')
    }
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('加载数据失败')
  }
}

// 处理编辑
const handleEdit = (row) => {
  editDrawer.currentRow = row
  editDrawer.visible = true
  Object.assign(editForm, row)
}

// 处理保存
const handleSave = async () => {
  try {
    await editFormRef.value.validate()
    // 更新表数据
    const index = tableData.value.findIndex(item => item.employeeId === editDrawer.currentRow.employeeId)
    if (index !== -1) {
      tableData.value[index] = { ...editForm }
      // 更新 localStorage
      localStorage.setItem('salaryTableData', JSON.stringify(tableData.value))
    }
    editDrawer.visible = false
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 处理删除
const handleDelete = (row) => {
  ElMessageBox.confirm(
    '确定要删除该员工的工资数据吗？',
    '删除确认',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = tableData.value.findIndex(item => item.employeeId === row.employeeId)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      // 更新 localStorage
      localStorage.setItem('salaryTableData', JSON.stringify(tableData.value))
      ElMessage.success('删除成功')
    }
  }).catch(() => {})
}

// 下一步
const handleNext = () => {
  if (!tableData.value || tableData.value.length === 0) {
    ElMessage.warning('没有可用的工资数据')
    return
  }

  router.push({
    name: 'SalaryDisplay',
    query: { timestamp: Date.now() }
  })
}

// 高级筛选显示状态
const showAdvancedFilter = ref(false)

// 重置筛选条件
const resetFilter = () => {
  filterForm.keyword = ''
  filterForm.positions = []
  filterForm.jobTypes = []
  filterForm.status = []
  filterForm.companies = []
}

// 处理筛选
const handleFilter = () => {
  showAdvancedFilter.value = false
}

onMounted(() => {
  initData()
})
</script>

<style lang="scss" scoped>
.salary-check {
  padding: 24px;
  background: #fff;
  border-radius: 8px;

  .salary-steps {
    margin-bottom: 24px;
  }

  .filter-section {
    margin-bottom: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;

    .basic-filter {
      display: flex;
      align-items: center;
      gap: 8px;

      .search-input {
        width: 240px;
      }

      .filter-btn {
        padding: 8px;
      }
    }
  }

  .salary-list {
    background: #fff;
    border-radius: 4px;
    padding: 16px;

    h2 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 500;
    }
  }

  .footer-actions {
    margin-top: 24px;
    text-align: center;
  }
}

.advanced-filter {
  padding: 16px;

  h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 500;
  }

  .filter-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .filter-footer {
    margin-top: 16px;
    text-align: right;
  }
}

.drawer-footer {
  padding: 16px;
  text-align: right;
}
</style> 