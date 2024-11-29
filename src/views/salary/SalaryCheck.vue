<template>
  <div class="salary-check">
    <!-- 向导步骤 -->
    <el-steps :active="1" finish-status="success">
      <el-step title="核对人员工资" />
      <el-step title="选择工资条显示" />
      <el-step title="发送工资条" />
    </el-steps>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :inline="true" :model="filterForm">
        <!-- 姓名/工号搜索 -->
        <el-form-item label="姓名/工号">
          <el-input
            v-model="filterForm.keyword"
            placeholder="请输入姓名或工号"
            clearable
          />
        </el-form-item>

        <!-- 岗位多选 -->
        <el-form-item label="岗位" v-if="positions.length">
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

        <!-- 工作性质多选 -->
        <el-form-item label="工作性质" v-if="jobTypes.length">
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

        <!-- 员工状态多选 -->
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

        <!-- 合同公司多选 -->
        <el-form-item label="合同公司" v-if="companies.length">
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
      </el-form>
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

    <!-- 删除确认弹窗 -->
    <el-dialog
      v-model="deleteDialog.visible"
      title="确认删除"
      width="300px"
    >
      <span>确定要删除吗？</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="deleteDialog.visible = false">取消</el-button>
          <el-button type="danger" @click="confirmDelete">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'SalaryCheck',
  setup() {
    const router = useRouter()

    // 筛选表单数据
    const filterForm = reactive({
      keyword: '',
      positions: [],
      jobTypes: [],
      status: [],
      companies: []
    })

    // 员工状态选项
    const employeeStatus = ['在职', '离职', '试用期']

    // 从模板中读取的选项数据
    const positions = ref([])
    const jobTypes = ref([])
    const companies = ref([])

    // 表格数据
    const tableData = ref([])
    const tableColumns = ref([
      { prop: 'name', label: '姓名', width: 100 },
      { prop: 'employeeId', label: '工号', width: 100 },
      { prop: 'department', label: '部门', width: 120 },
      { prop: 'position', label: '岗位', width: 120 },
      { prop: 'jobType', label: '工作性质', width: 120 },
      { prop: 'status', label: '员工状态', width: 100 },
      { prop: 'company', label: '合同公司', width: 150 },
      { prop: 'phone', label: '手机号', width: 120 },
      { prop: 'basicSalary', label: '基本工资', width: 100, isSalary: true },
      { prop: 'positionSalary', label: '岗位工资', width: 100, isSalary: true },
      { prop: 'performanceSalary', label: '绩效工资', width: 100, isSalary: true },
      { prop: 'transportAllowance', label: '交通补贴', width: 100, isSalary: true },
      { prop: 'attendanceDeduction', label: '考勤扣款', width: 100, isSalary: true },
      { prop: 'grossSalary', label: '应发工资', width: 100, isSalary: true },
      { prop: 'personalInsurance', label: '个人社保', width: 100, isSalary: true },
      { prop: 'personalHousingFund', label: '个人公积金', width: 100, isSalary: true },
      { prop: 'personalIncomeTax', label: '个人所得税', width: 100, isSalary: true },
      { prop: 'netSalary', label: '实发工资', width: 100, isSalary: true }
    ])

    // 列表标题
    const listTitle = computed(() => {
      // 从路由或vuex中获取日期和模板名称
      return '2024年03月-销售部薪资'
    })

    // 过滤后的表格数据
    const filteredTableData = computed(() => {
      let result = [...tableData.value]

      // 关键字搜索
      if (filterForm.keyword) {
        const keyword = filterForm.keyword.toLowerCase()
        result = result.filter(item => 
          item.name.toLowerCase().includes(keyword) ||
          item.employeeId.toLowerCase().includes(keyword)
        )
      }

      // 岗位筛选
      if (filterForm.positions.length) {
        result = result.filter(item => filterForm.positions.includes(item.position))
      }

      // 工作性质筛选
      if (filterForm.jobTypes.length) {
        result = result.filter(item => filterForm.jobTypes.includes(item.jobType))
      }

      // 员工状态筛选
      if (filterForm.status.length) {
        result = result.filter(item => filterForm.status.includes(item.status))
      }

      // 合同公司筛选
      if (filterForm.companies.length) {
        result = result.filter(item => filterForm.companies.includes(item.company))
      }

      return result
    })

    // 编辑表单相关
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
      // 薪资项验证规则
      basicSalary: [
        { pattern: /^\d+(\.\d{1,2})?$/, message: '请输入数值，最多只允许2位小数', trigger: 'blur' }
      ]
      // ... 其他验证规则
    }

    // 可编辑字段配置
    const editableFields = computed(() => {
      return tableColumns.value.map(column => ({
        ...column,
        disabled: ['name', 'employeeId'].includes(column.prop),
        placeholder: column.isSalary ? '请输入数值，最多只允许2位小数' : `请输入${column.label}`
      }))
    })

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
        // 保存逻辑
        editDrawer.visible = false
        ElMessage.success('保存成功')
      } catch (error) {
        console.error('表单验证失败:', error)
      }
    }

    // 删除相关
    const deleteDialog = reactive({
      visible: false,
      currentRow: null
    })

    const handleDelete = (row) => {
      deleteDialog.currentRow = row
      deleteDialog.visible = true
    }

    const confirmDelete = () => {
      // 删除逻辑
      deleteDialog.visible = false
      ElMessage.success('删除成功')
    }

    // 下一步
    const handleNext = () => {
      router.push('/salary/display')  // 跳转到选择工资条显示页面
    }

    return {
      filterForm,
      employeeStatus,
      positions,
      jobTypes,
      companies,
      tableData,
      tableColumns,
      listTitle,
      filteredTableData,
      editDrawer,
      editForm,
      editFormRef,
      editRules,
      editableFields,
      deleteDialog,
      handleEdit,
      handleSave,
      handleDelete,
      confirmDelete,
      handleNext
    }
  }
}
</script>

<style lang="scss" scoped>
.salary-check {
  padding: 24px;

  .filter-section {
    margin: 24px 0;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
  }

  .salary-list {
    background: #fff;
    padding: 16px;
    border-radius: 4px;

    h2 {
      margin: 0 0 16px;
      font-size: 18px;
      font-weight: normal;
    }
  }

  .drawer-footer {
    padding: 16px;
    text-align: right;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .footer-actions {
    margin-top: 24px;
    padding: 16px;
    background: #fff;
    border-radius: 4px;
    text-align: center;
  }

  // 金额列样式
  :deep(.el-table) {
    .salary-column {
      text-align: right;
    }
  }
}
</style> 