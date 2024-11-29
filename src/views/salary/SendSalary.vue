<!--
 * @Description: 发放工资组件
 * @Version: 1.0.0
 * @Author: Claude
 * @Date: 2024-03-20
-->

<template>
  <div class="send-salary">
    <h2>发送工资条</h2>
    
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
            
            // 显示导入成功提示弹窗
            ElMessageBox.alert('全部导入成功！', '导入提示', {
              confirmButtonText: '知道了',
              callback: () => {
                // 修改跳转路径为 /salary/check
                router.push('/salary/check')
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
            id: 1,
            name: '李示例',
            employeeId: '1001',
            department: '销售部',
            position: '销售员',
            phone: '13999688000',
            basicSalary: 1000.00,
            positionSalary: 1000.00,
            performanceSalary: 1000.00,
            transportAllowance: 500.00,
            attendanceDeduction: 200.00,
            grossSalary: 3300.00,
            personalInsurance: 300.00,
            personalHousingFund: 300.00,
            personalIncomeTax: 100.00,
            netSalary: 3000.00,
            remarks: '历史薪资处理修正，工资科目可自行增删'
          },
          {
            id: 2,
            name: '张示例',
            employeeId: '1002',
            department: '销售部',
            position: '销售员',
            phone: '15285920000',
            basicSalary: 1000.00,
            positionSalary: 1000.00,
            performanceSalary: 1000.00,
            transportAllowance: 500.00,
            attendanceDeduction: 200.00,
            grossSalary: 3300.00,
            personalInsurance: 300.00,
            personalHousingFund: 300.00,
            personalIncomeTax: 100.00,
            netSalary: 3000.00,
            remarks: '工资科目可自行增删'
          }
        ]
        
        // 转换数据为工作表
        const ws = XLSX.utils.json_to_sheet(templateData)
        
        // 设置列宽
        ws['!cols'] = [
          { wch: 6 },  // 序号
          { wch: 8 },  // ���名
          { wch: 8 },  // 工号
          { wch: 10 }, // 部门
          { wch: 10 }, // 岗位
          { wch: 12 }, // 手机号码
          { wch: 10 }, // 基本工资
          { wch: 10 }, // 岗位工资
          { wch: 10 }, // 绩效工资
          { wch: 10 }, // 交通补贴
          { wch: 10 }, // 考勤扣款
          { wch: 10 }, // 应发工资
          { wch: 10 }, // 人社保
          { wch: 10 }, // 个人公积金
          { wch: 10 }, // 个人所得税
          { wch: 10 }, // 实发工资
          { wch: 30 }  // 备注
        ]
        
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
        // 模拟上传过程
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        uploadedFile.value = {
          name: file.raw.name,
          path: URL.createObjectURL(file.raw)
        }
        
        // 设置工资表名称为文件名（不包含扩展名）
        form.salaryName = file.raw.name.replace(/\.xlsx$/, '')
        
        ElMessage.success('上传成功')
      } catch (error) {
        console.error('上传失败:', error)
        ElMessage.error('上传失败')
      } finally {
        uploading.value = false
      }
    }

    // 添加删除文件方法
    const removeFile = () => {
      uploadedFile.value = null
      form.salaryName = ''  // 清空工资表名称
    }

    // 添加月份中文翻译
    const monthNames = {
      1: '一月',
      2: '二月',
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
      removeFile
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

// 错误提示样式
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