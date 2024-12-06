<!--
 * @Description: 发放工资组件
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->

<template>
  <div class="send-salary">
    <h2>发送工资条</h2>
    
    <div class="content-wrapper">
      <!-- 上半部分：表单和预览 -->
      <div class="top-section">
        <div class="salary-form">
          <h3>发送电子工资条</h3>

          <el-form ref="formRef" :model="form" :rules="rules">
            <!-- 工资表所属月份 -->
            <div class="form-item">
              <div class="label">工资表所属月份年</div>
              <div class="input-wrapper">
                <el-date-picker
                  v-model="form.selectedMonth"
                  type="month"
                  format="YYYY年MM月"
                  value-format="YYYY-MM"
                  placeholder="选择工资所属月份"
                  :clearable="false"
                  class="month-picker"
                  :popper-class="'month-picker-dropdown'"
                />
                <div v-if="errors.selectedMonth" class="error-message">{{ errors.selectedMonth }}</div>
              </div>
            </div>

            <!-- 工资表名称 -->
            <div class="form-item">
              <div class="label">工资表名称</div>
              <div class="input-group">
                <el-input 
                  v-model="form.salaryName"
                  placeholder="请输入工资表名称"
                  maxlength="100"
                  show-word-limit
                />
                <el-upload
                  :auto-upload="false"
                  :show-file-list="false"
                  accept=".xlsx"
                  @change="handleFileChange"
                >
                  <el-button type="primary" plain>
                    上传工资表
                    <el-icon><Upload /></el-icon>
                  </el-button>
                </el-upload>
                <el-button type="primary" plain @click="downloadTemplate">
                  下载标准模板
                  <el-icon><Download /></el-icon>
                </el-button>
              </div>
              <!-- 添加文件展示区域 -->
              <div v-if="uploadedFile" class="uploaded-file">
                <el-tag closable @close="removeFile">
                  <el-icon><Document /></el-icon>
                  {{ uploadedFile.name }}
                </el-tag>
              </div>
            </div>
          </el-form>

          <!-- 生成工资条按钮 -->
          <el-button 
            type="primary" 
            class="generate-btn"
            @click="generateSalary"
            :disabled="!canGenerate"
          >
            生成工资表
          </el-button>
        </div>

        <!-- 右侧预览图 -->
        <div class="preview-image">
          <img src="@/assets/salary-preview.png" alt="工资条预览">
        </div>
      </div>

      <!-- 最近更新的工资表列表 -->
      <div class="recent-salary-list">
        <div class="list-header">
          <h3>最近更新的工资表</h3>
        </div>
        <el-table :data="recentSalaryList" border>
          <el-table-column label="工资表名称" prop="name" min-width="200" />
          <el-table-column label="所属月份" prop="month" width="120" />
          <el-table-column label="总人数" prop="totalCount" width="100" align="center" />
          <el-table-column label="已发放" prop="sentCount" width="100" align="center" />
          <el-table-column label="操作人" prop="operator" width="120" />
          <el-table-column label="操作时间" prop="operateTime" width="160" />
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="operation-buttons">
                <el-button 
                  type="primary" 
                  link 
                  @click="handleViewDetail(row)"
                >
                  查看发放详情
                </el-button>
                <el-divider direction="vertical" />
                <el-button 
                  type="primary" 
                  link 
                  @click="handleContinueSend(row)"
                >
                  继续发放
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 导入进度弹窗 -->
    <el-dialog
      v-model="importDialog.visible"
      title="导入月工资表"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
    >
      <div class="import-progress">
        <div class="progress-icon">
          <img src="@/assets/excel-icon.png" alt="Excel图标">
        </div>
        <div class="progress-text">导入成功</div>
        <div class="progress-value">99%</div>
        <el-progress :percentage="importDialog.progress" :show-text="false" />
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, computed, reactive } from 'vue'
import { Calendar, ArrowLeft, ArrowRight, Download, Upload, Document } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'

export default {
  name: 'SendSalary',
  components: {
    Calendar,
    ArrowLeft,
    ArrowRight,
    Download,
    Upload,
    Document
  },
  setup() {
    const router = useRouter()
    const formRef = ref(null)
    const form = reactive({
      selectedMonth: '',
      salaryName: ''
    })
    
    const errors = reactive({
      selectedMonth: '',
      salaryName: ''
    })

    const rules = {
      selectedMonth: [
        { required: true, message: '请选择工资所属月份', trigger: 'change' }
      ],
      salaryName: [
        { required: true, message: '请输入工资表名称', trigger: 'blur' }
      ]
    }

    const uploading = ref(false)
    const uploadedFile = ref(null)

    // 导入进度弹窗数据
    const importDialog = reactive({
      visible: false,
      progress: 0
    })

    // 计算属性：是否可以生成工资条
    const canGenerate = computed(() => {
      return form.selectedMonth && form.salaryName && uploadedFile.value
    })

    // 从 localStorage 获取记录列表，如果没有则使用空数组
    const recentSalaryList = ref(JSON.parse(localStorage.getItem('recentSalaryList') || '[]'))

    // 添加更新记录的方法
    const addSalaryRecord = (record) => {
      // 将新记录添加到列表开头
      recentSalaryList.value.unshift(record)
      // 保持列表最多显示 10 条记录
      if (recentSalaryList.value.length > 10) {
        recentSalaryList.value = recentSalaryList.value.slice(0, 10)
      }
      // 保存到 localStorage
      localStorage.setItem('recentSalaryList', JSON.stringify(recentSalaryList.value))
    }

    // 生成工资条
    const generateSalary = async () => {
      // 验证表单
      if (!form.selectedMonth) {
        errors.selectedMonth = '必填'
      }
      if (!form.salaryName) {
        errors.salaryName = '必填'
      }
      if (!form.selectedMonth || !form.salaryName) {
        return
      }

      try {
        // 显示进度弹窗
        importDialog.visible = true
        importDialog.progress = 0

        // 定义进度节点
        const progressSteps = [30, 99]
        let currentStep = 0

        // 模拟导入进度
        const timer = setInterval(() => {
          if (currentStep < progressSteps.length) {
            importDialog.progress = progressSteps[currentStep]
            currentStep++
          } else {
            clearInterval(timer)
            // 关闭进度弹窗
            importDialog.visible = false
            
            // 过滤有效数据（只保留有姓名和手机号的数据）
            const validData = uploadedFile.value.jsonData.filter(row => {
              const hasName = Object.keys(row).some(key => 
                ['姓名', '名字', 'name', 'Name'].includes(key.trim()) && row[key]
              )
              const hasPhone = Object.keys(row).some(key => 
                ['手机号码', '手机', '手机号', 'phone', 'Phone', 'mobile', 'Mobile'].includes(key.trim()) && row[key]
              )
              return hasName && hasPhone
            })

            // 保存工资表数据到 localStorage
            const salaryData = {
              id: Date.now().toString(), // 生成唯一ID
              month: form.selectedMonth,
              name: form.salaryName,
              data: validData,  // 只存储有效数据
              createTime: new Date().toISOString()
            }
            
            // 获取现有数据
            const existingData = JSON.parse(localStorage.getItem('salaryData') || '[]')
            existingData.unshift(salaryData)
            localStorage.setItem('salaryData', JSON.stringify(existingData))

            // 添加新的更新记录
            const newRecord = {
              id: salaryData.id,
              name: form.salaryName,
              month: new Date(form.selectedMonth).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long'
              }),
              totalCount: validData.length,
              sentCount: '--',
              operator: 'lili',
              operateTime: new Date().toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
            }

            addSalaryRecord(newRecord)

            // 将表格数据存储到 localStorage
            localStorage.setItem('salaryTableData', JSON.stringify(validData))
            localStorage.setItem('currentSalaryConfig', JSON.stringify({
              selectedMonth: form.selectedMonth,
              salaryName: form.salaryName,
              totalCount: validData.length
            }))
            
            // 先显示提示，确认后再跳转
            ElMessageBox.alert('全部导入成功！', '导入提示', {
              confirmButtonText: '知道了',
              callback: () => {
                // 在点击确认后跳转
                router.push({
                  name: 'SalaryCheck',
                  query: {
                    id: salaryData.id,
                    timestamp: Date.now()
                  },
                  replace: true
                }).catch(error => {
                  console.error('跳转失败:', error)
                  ElMessage.error('跳转失败，请重试')
                })
              }
            })
          }
        }, 300)
      } catch (error) {
        console.error('生成工资条失败:', error)
        ElMessage.error('生成工资条失败')
        importDialog.visible = false
      }
    }

    // 下载模板
    const downloadTemplate = async () => {
      try {
        // 创建工作簿
        const XLSX = await import('xlsx')
        const wb = XLSX.utils.book_new()
        
        // 示例数据
        const templateData = [
          {
            序号: 1,
            姓名: '李示例',
            工号: '1001',
            部门: '销售部',
            岗位: '销售员',
            手机号码: '13999688000',
            基本工资: 1000.00,
            岗位工资: 1000.00,
            绩效工资: 1000.00,
            交通补贴: 500.00,
            考勤扣款: 200.00,
            应发工资: 3300.00,
            个人社保: 300.00,
            个人公积金: 300.00,
            个人所得税: 100.00,
            实发工资: 3000.00,
            备注: '工资科目可自行增删'
          },
          {
            序号: 2,
            姓名: '张示例',
            工号: '1002',
            部门: '销售部',
            岗位: '销售员',
            手机号码: '15285920000',
            基本工资: 1000.00,
            岗位工资: 1000.00,
            绩效工资: 1000.00,
            交通补贴: 500.00,
            考勤扣款: 200.00,
            应发工资: 3300.00,
            个人社保: 300.00,
            个人公积金: 300.00,
            个人所得税: 100.00,
            实发工资: 3000.00,
            备注: '工资科目可自行增删'
          }
        ]
        
        // 转换数据为工作表
        const ws = XLSX.utils.json_to_sheet(templateData)
        
        // 设置列宽
        ws['!cols'] = [
          { wch: 6 },   // 序号
          { wch: 8 },   // 姓名
          { wch: 8 },   // 工号
          { wch: 10 },  // 部门
          { wch: 10 },  // 岗位
          { wch: 12 },  // 手机号码
          { wch: 10 },  // 基本工资
          { wch: 10 },  // 岗位工资
          { wch: 10 },  // 绩效工资
          { wch: 10 },  // 交通补贴
          { wch: 10 },  // 考勤扣款
          { wch: 10 },  // 应发工资
          { wch: 10 },  // 个人社保
          { wch: 10 },  // 个人公积金
          { wch: 10 },  // 个人所得税
          { wch: 10 },  // 实发工资
          { wch: 30 }   // 备注
        ]

        // 添加黄色背景色
        const range = XLSX.utils.decode_range(ws['!ref'])
        for(let R = range.s.r; R <= range.e.r; R++) {
          for(let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = {c: C, r: R}
            const cell_ref = XLSX.utils.encode_cell(cell_address)
            if(!ws[cell_ref]) continue
            ws[cell_ref].s = {
              fill: {
                fgColor: { rgb: "FFFF00" },
                patternType: "solid"
              }
            }
          }
        }

        // 添加备注说明
        const notes = [
          '以下提示可删除:',
          '1. 姓名为必填项，若该员工不在花名册中，请务必填写手机号码，否则无法上传；',
          '2. 工资科目可以任意修改/新增/删除，注意不要进行合并单元格；',
          '3. 上传工资表时请务必保证表格数据准确，系统不会进行二次计算；',
          '4. 港澳台及海外地区员工，需在手机号前加区号，例如"+853 82991000"。'
        ]
        
        // 计算注释的起始行
        const startRow = range.e.r + 2
        notes.forEach((note, idx) => {
          const cell_ref = XLSX.utils.encode_cell({c: 0, r: startRow + idx})
          ws[cell_ref] = { v: note }
          // 设置黄色背景
          ws[cell_ref].s = {
            fill: {
              fgColor: { rgb: "FFFF00" },
              patternType: "solid"
            }
          }
        })

        // 更新工作表范围以包含注释
        ws['!ref'] = XLSX.utils.encode_range({
          s: { c: 0, r: 0 },
          e: { c: range.e.c, r: startRow + notes.length - 1 }
        })
        
        // 将工作表添加到工作簿
        XLSX.utils.book_append_sheet(wb, ws, '工资表模板')
        
        // 下载文件
        XLSX.writeFile(wb, '工资表模板.xlsx')
        
        ElMessage.success('模板下载成功')
      } catch (error) {
        console.error('下载模板失败:', error)
        ElMessage.error('模板下载失败')
      }
    }

    // 修改文件上传处理方法
    const handleFileChange = async (file) => {
      const isExcel = file.raw.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      if (!isExcel) {
        ElMessage.error('只能上传 Excel 文件!')
        return
      }

      uploading.value = true
      try {
        const reader = new FileReader()
        reader.onload = async (e) => {
          try {
            const XLSX = await import('xlsx')
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })
            
            // 获取第一个工作表
            const firstSheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[firstSheetName]
            
            // 找到数据的实际范围（排除备注说明）
            const range = XLSX.utils.decode_range(worksheet['!ref'])
            let lastDataRow = range.e.r

            // 从后往查找，找到后一个非空行（排除备注说明）
            for (let r = range.e.r; r >= 0; r--) {
              let rowIsEmpty = true
              for (let c = 0; c <= range.e.c; c++) {
                const cellRef = XLSX.utils.encode_cell({ r, c })
                if (worksheet[cellRef] && worksheet[cellRef].v) {
                  // 检查是否是备注说明的开始
                  if (c === 0 && typeof worksheet[cellRef].v === 'string' && 
                      worksheet[cellRef].v.includes('以下提示可删除')) {
                    continue
                  }
                  rowIsEmpty = false
                  break
                }
              }
              if (!rowIsEmpty) {
                lastDataRow = r
                break
              }
            }

            // 设置新的范围，只包含实际数据
            worksheet['!ref'] = XLSX.utils.encode_range({
              s: { c: 0, r: 0 },
              e: { c: range.e.c, r: lastDataRow }
            })
            
            // 转换为JSON数据
            const jsonData = XLSX.utils.sheet_to_json(worksheet)
            
            if (jsonData.length === 0) {
              throw new Error('Excel 文件中没有数据')
            }

            // 检查是否包含必要字段（姓名和手机号）
            const firstRow = jsonData[0]
            const hasName = Object.keys(firstRow).some(key => 
              ['姓名', '名字', 'name', 'Name'].includes(key.trim())
            )
            const hasPhone = Object.keys(firstRow).some(key => 
              ['手机号码', '手机', '手机号', 'phone', 'Phone', 'mobile', 'Mobile'].includes(key.trim())
            )

            if (!hasName || !hasPhone) {
              throw new Error('Excel 文件必须包含姓名和手机号字段')
            }

            // 保存文件数据
            uploadedFile.value = {
              name: file.raw.name,
              data: e.target.result,
              jsonData
            }
            form.salaryName = file.raw.name.replace(/\.xlsx$/, '')
            
            ElMessage.success('上传成功')
          } catch (error) {
            console.error('解析Excel失败:', error)
            ElMessage.error(error.message || '解析Excel失败')
            uploadedFile.value = null
            form.salaryName = ''
          }
        }
        
        reader.onerror = () => {
          ElMessage.error('读取文件失败')
          uploadedFile.value = null
          form.salaryName = ''
        }
        
        reader.readAsArrayBuffer(file.raw)
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('上传失败')
        uploadedFile.value = null
        form.salaryName = ''
      } finally {
        uploading.value = false
      }
    }

    // 添加删除文件方法
    const removeFile = () => {
      uploadedFile.value = null
      form.salaryName = ''  // 清空工资表
    }

    // 添加月份中文翻译
    const monthNames = {
      1: '一月',
      2: '二',
      3: '三月',
      4: '四月',
      5: '五月',
      6: '六月',
      7: '七月',
      8: '八月',
      9: '九月',
      10: '十月',
      11: '十一月',
      12: '十二月'
    }

    // 查看发放详情
    const handleViewDetail = (row) => {
      router.push({
        path: '/salary/push',
        query: {
          id: row.id,
          month: row.month,
          name: row.name
        }
      })
    }

    // 修改继续发放方法
    const handleContinueSend = (row) => {
      try {
        // 从 salaryData 中获取对应的工资数据
        const allSalaryData = JSON.parse(localStorage.getItem('salaryData') || '[]')
        const salaryData = allSalaryData.find(item => item.id === row.id)
        
        if (!salaryData) {
          ElMessage.error('未找到对应的工资数据')
          return
        }

        // 更新当前工资表数据
        localStorage.setItem('salaryTableData', JSON.stringify(salaryData.data))
        
        // 更新当前配置
        localStorage.setItem('currentSalaryConfig', JSON.stringify({
          selectedMonth: salaryData.month,
          salaryName: salaryData.name,
          totalCount: salaryData.data.length
        }))

        // 跳转到核对页面
        router.push({
          name: 'SalaryCheck',
          query: {
            id: row.id,
            timestamp: Date.now()
          },
          replace: true
        })
      } catch (error) {
        console.error('继续发放失败:', error)
        ElMessage.error('继续发放失败，请重试')
      }
    }

    // 处理下一步
    const handleNext = async () => {
      if (!form.selectedMonth || !form.salaryName || !form.salaryTableData) {
        ElMessage.warning('请完善表单信息')
        return
      }

      try {
        // 保存当前工资配置
        localStorage.setItem('currentSalaryConfig', JSON.stringify({
          selectedMonth: form.selectedMonth,
          salaryName: form.salaryName
        }))

        // 保存工资表数据
        localStorage.setItem('salaryTableData', JSON.stringify(form.salaryTableData))

        // 跳转到核对页面
        router.push('/salary/check')
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error('操作失败，请重试')
      }
    }

    return {
      formRef,
      form,
      errors,
      rules,
      uploading,
      uploadedFile,
      importDialog,
      canGenerate,
      downloadTemplate,
      handleFileChange,
      generateSalary,
      removeFile,
      recentSalaryList,
      handleViewDetail,
      handleContinueSend,
      addSalaryRecord,
      handleNext
    }
  }
}
</script>

<style lang="scss" scoped>
.send-salary {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  display: flex;
  gap: 40px;

  h2 {
    display: none;
  }

  h3 {
    font-size: 20px;
    margin: 0 0 24px;
    font-weight: normal;
  }
  
  .content-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .top-section {
    background: #fff;
    border-radius: 8px;
    padding: 24px;
    display: flex;
    gap: 40px;
  }

  .salary-form {
    flex: 1;

    .form-item {
      margin-bottom: 24px;
      
      .label {
        font-size: 14px;
        color: #333;
        margin-bottom: 8px;
        display: block;
      }

      :deep(.el-date-editor.el-input),
      .el-input {
        width: 100% !important;
      }

      .input-group {
        display: flex;
        align-items: center;
        gap: 12px;

        .el-input {
          flex: 1;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }
      }

      .error-message {
        color: #f56c6c;
        font-size: 12px;
        margin-top: 4px;
      }

      .uploaded-file {
        margin-top: 8px;
        
        .el-tag {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 6px 10px;
          
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }

    .generate-btn {
      width: 100%;
      height: 40px;
      margin: 24px 0;
      background-color: #409EFF;
      border-color: #409EFF;
      color: #fff;
      font-weight: 500;
      
      &:hover {
        opacity: 0.9;
      }
    }
  }

  .preview-image {
    width: 360px;
    
    img {
      width: 100%;
      height: auto;
    }
  }

  .recent-salary-list {
    padding: 24px;
    background: #fff;
    border-radius: 8px;
    
    .list-header {
      margin-bottom: 16px;
      
      h3 {
        font-size: 16px;
        color: #333;
        margin: 0;
        font-weight: 500;
        position: relative;
        padding-left: 12px;
        
        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 4px;
          height: 16px;
          background: var(--el-color-primary);
          border-radius: 2px;
        }
      }
    }
    
    :deep(.el-table) {
      .operation-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        
        .el-button {
          padding: 4px 0;
        }

        .el-divider--vertical {
          height: 1em;
          margin: 0 8px;
        }
      }
    }
  }
}

// 导入进度弹窗样式
.import-progress {
  padding: 20px;
  text-align: center;

  .progress-icon {
    margin-bottom: 16px;
    img {
      width: 48px;
      height: 48px;
    }
  }

  .progress-text {
    margin-bottom: 8px;
    font-size: 16px;
    color: #333;
  }

  .progress-value {
    margin-bottom: 16px;
    font-size: 24px;
    color: #0bb27a;
    font-weight: bold;
  }

  :deep(.el-progress-bar__inner) {
    background-color: #0bb27a;
  }
}

// 误提示样式
.el-form-item {
  &.is-error {
    margin-bottom: 4px;
  }

  .el-form-item__error {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 4px;
  }
}

.form-item {
  .label {
    font-size: 14px;
    color: #333;
    margin-bottom: 8px;
  }

  .input-group {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-input {
      flex: 1;
    }
  }
}
</style> 