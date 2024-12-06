<template>
  <div class="salary-display">
    <!-- 向导步骤 -->
    <div class="steps-wrapper">
      <el-steps :active="2" finish-status="success">
        <el-step title="核对人员工资" />
        <el-step title="选择工资条显示" />
        <el-step title="发送工资条" />
      </el-steps>
    </div>

    <div class="display-content">
      <!-- 左侧设置区域（可滚动） -->
      <div class="settings-scroll-wrapper">
        <div class="settings-section">
          <!-- 温馨提示 -->
          <div class="tips-section">
            <div class="section-title">温馨提示</div>
            <el-input
              v-model="form.tips"
              type="textarea"
              :rows="3"
              placeholder="请输入温馨提示"
              maxlength="300"
              show-word-limit
              @input="handleTipsChange"
            />
          </div>

          <!-- 员工信息 -->
          <div class="employee-info">
            <div class="section-title">员工信息</div>
            <div class="info-items">
              <el-checkbox v-model="form.employeeInfo.name">员工姓名</el-checkbox>
              <el-checkbox v-model="form.employeeInfo.employeeId">工号</el-checkbox>
              <el-checkbox v-model="form.employeeInfo.department">所属部门</el-checkbox>
              <el-checkbox v-model="form.employeeInfo.position">工作岗位</el-checkbox>
              <el-checkbox v-model="form.employeeInfo.company">合同公司</el-checkbox>
              <el-checkbox v-model="form.employeeInfo.companyName">企业名称</el-checkbox>
            </div>
          </div>

          <!-- 设置可见工资项 -->
          <div class="salary-items">
            <div class="section-header">
              <div class="section-title">设置可见工资项</div>
              <div class="template-select">
                <span>选择模板：</span>
                <el-select v-model="form.template" placeholder="新模版">
                  <el-option label="新模版" value="new" />
                </el-select>
              </div>
            </div>

            <div class="items-container">
              <!-- 全选 -->
              <div class="select-all">
                <el-checkbox v-model="form.selectAll" @change="handleSelectAll">全选</el-checkbox>
                <div class="category-actions">
                  工资科目分类显，工资条更清晰
                  <el-button type="primary" plain @click="handleNewCategory">新建分类</el-button>
                </div>
              </div>

              <!-- 工资项列表 -->
              <div class="salary-categories">
                <!-- 分类拖拽 -->
                <draggable 
                  v-model="categories" 
                  item-key="id"
                  :handle="false"
                  @end="handleCategoryDragEnd"
                >
                  <template #item="{element: category}">
                    <div class="category">
                      <div class="category-header">
                        <div class="title-wrapper">
                          <template v-if="category.isEditing">
                            <el-input
                              v-model="category.name"
                              size="small"
                              @blur="saveTitle(category)"
                              @keyup.enter="saveTitle(category)"
                              placeholder="请输入分类名称"
                              ref="titleInput"
                            />
                          </template>
                          <span v-else class="title">{{ category.name }}</span>
                        </div>
                        <div class="actions">
                          <el-icon @click="handleAddBlock"><Plus /></el-icon>
                          <el-icon @click="handleEditTitle(category)"><Edit /></el-icon>
                          <el-icon 
                            @click="handleDeleteCategory(index)" 
                            v-if="!category.isSystem"
                          >
                            <Delete />
                          </el-icon>
                          <el-icon><More /></el-icon>
                        </div>
                      </div>
                      
                      <!-- 项目拖拽 -->
                      <div class="category-items">
                        <draggable 
                          v-model="category.items" 
                          item-key="id"
                          :handle="false"
                          @end="handleItemDragEnd"
                        >
                          <template #item="{element: item}">
                            <div class="item">
                              <div class="item-content">
                                <el-checkbox v-model="item.checked">{{ item.name }}</el-checkbox>
                                <el-icon class="add-help" @click="handleAddHelp(item)"><Plus /></el-icon>
                                <el-icon><More /></el-icon>
                              </div>
                            </div>
                          </template>
                        </draggable>
                      </div>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="footer-actions">
            <el-button @click="handlePrev">上一步</el-button>
            <el-button type="primary" @click="handleNext">下一步</el-button>
          </div>
        </div>
      </div>

      <!-- 右侧预览区域 -->
      <div class="preview-section">
        <div class="preview-header">
          <div class="preview-title">员工李示例的发放预览</div>
        </div>
        <div class="preview-content">
          <PhonePreview 
            :salary-data="previewData || {}"
            :remarks="form.tips"
            :employee-info="form.employeeInfo"
            :categories="categories || []"
            :payroll-month="payrollMonth"
          />
        </div>
      </div>
    </div>
  </div>

  <!-- 在 template 最后添加帮助说明弹窗 -->
  <el-dialog
    v-model="helpDialogVisible"
    title="填写注释"
    width="500px"
    :close-on-click-modal="false"
    :show-close="true"
    class="help-dialog"
  >
    <div class="help-form">
      <div class="form-item">
        <div class="label">工资项：</div>
        <div class="value">{{ helpForm.name }}</div>
      </div>
      <div class="form-item">
        <div class="label">备注说明：</div>
        <el-input
          v-model="helpForm.help"
          type="textarea"
          :rows="4"
          placeholder="请输入备注说明"
          maxlength="200"
          show-word-limit
        />
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="helpDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveHelp">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Plus, Edit, Delete, More } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PhonePreview from '@/components/PhonePreview.vue'
import draggable from 'vuedraggable'

export default {
  name: 'SalaryDisplay',
  components: {
    PhonePreview,
    Plus,
    Edit,
    Delete,
    More,
    draggable
  },
  setup() {
    const router = useRouter()

    // 表单数据
    const form = reactive({
      tips: '',
      employeeInfo: {
        name: true,      // 默认选中
        employeeId: true, // 默认选中
        department: true, // 默认选中
        position: true,   // 默认选中
        company: false,
        companyName: false
      },
      template: 'new',
      selectAll: true,  // 默认选
      items: {
        basicSalary: true,
        positionSalary: true,
        performanceSalary: true,
        transportAllowance: true,
        attendanceDeduction: true,
        personalInsurance: true,
        personalHousingFund: true,
        personalIncomeTax: true,
        netSalary: true
      }
    })

    // 处理全选
    const handleSelectAll = (val) => {
      Object.keys(form.items).forEach(key => {
        form.items[key] = val
      })
    }

    // 新建分类
    const handleNewCategory = () => {
      const newCategory = {
        id: Date.now(),
        name: '新建分类',
        isEditing: true,
        isSystem: false,
        items: []
      }
      categories.value.push(newCategory)
    }

    // 上一步
    const handlePrev = () => {
      router.push('/salary/check')
    }

    // 下一步
    const handleNext = () => {
      try {
        // 保存工资条显示配置
        localStorage.setItem('salaryDisplayConfig', JSON.stringify({
          tips: form.tips,
          employeeInfo: form.employeeInfo,
          categories: categories.value
        }))

        // 跳转到推送页面
        router.push('/salary/push')
      } catch (error) {
        console.error('保存配置失败:', error)
        ElMessage.error('保存失败，请重试')
      }
    }

    // 区块数据
    const categories = ref([
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
    ])

    // 预览数据
    const previewData = computed(() => {
      // 基础数据
      const baseData = {
        name: '李示例',
        employeeId: '10086',
        department: '技术部',
        position: '前端工程师',
        company: '某某科技有限公司',
        companyName: '某某集团',
      }

      // 获取其他明细分类
      const otherCategory = categories.value.find(cat => cat.name === '其他明细')
      const otherItems = {}
      
      // 如果找到其他明细分类，则只显示被勾选的项目
      if (otherCategory) {
        otherCategory.items.forEach(item => {
          if (item.checked) {
            // 这里使用模拟数据，实际项目中应该从后端获取真实数据
            const mockValue = {
              '基本工资': 2000.00,
              '岗位工资': 800.00,
              '绩效工资': 500.00,
              '交通补贴': 200.00,
              '考勤扣款': -100.00,
              '个人社保': -200.00,
              '个人公积金': -200.00
            }
            otherItems[item.name] = mockValue[item.name] || 0
          }
        })
      }

      // 获取基本项目分类
      const basicCategory = categories.value.find(cat => cat.name === '基本项目')
      const basicItems = {}

      // 如果找到基本项目分类，则只显示被勾选的项目
      if (basicCategory) {
        basicCategory.items.forEach(item => {
          if (item.checked) {
            const mockValue = {
              '应发工资': 3300.00,
              '个人所得税': -100.00,
              '实发工资': 3000.00
            }
            basicItems[item.name] = mockValue[item.name] || 0
          }
        })
      }

      // 合并所有数据
      const finalData = {
        ...baseData,
        ...basicItems,
        ...otherItems
      }
      console.log('预览数据:', finalData)
      return finalData
    })

    // 获取当前工资配置
    const currentConfig = computed(() => {
      const config = localStorage.getItem('currentSalaryConfig')
      return config ? JSON.parse(config) : null
    })

    // 工资月份
    const payrollMonth = computed(() => {
      if (currentConfig.value) {
        return currentConfig.value.selectedMonth.replace(/-/g, '')
      }
      return ''
    })

    // 初始化数据
    const initData = () => {
      try {
        // 从 localStorage 获取数据
        const data = localStorage.getItem('salaryTableData')
        if (!data) {
          ElMessage.warning('没有找到工资数据')
          router.replace('/salary/check')
          return
        }

        // 初始化其他数据...
      } catch (error) {
        console.error('初始化数据失败:', error)
        ElMessage.error('加载数据失败')
      }
    }

    onMounted(() => {
      initData()
    })

    // 添加新区块
    const handleAddBlock = () => {
      const newCategory = {
        id: Date.now(),
        name: '新建分类',
        items: []
      }
      categories.value.push(newCategory)
      ElMessage.success('新增分类成功')
    }

    // 编辑标题
    const handleEditTitle = (category) => {
      category.isEditing = true
    }

    // 保存标题
    const saveTitle = (category) => {
      if (!category.name.trim()) {
        ElMessage.warning('分类名称不能为空')
        return
      }
      category.isEditing = false
      ElMessage.success('修改成功')
    }

    // 处理拖拽排序
    const handleDragSort = (evt) => {
      const { oldIndex, newIndex } = evt
      // 交换位置
      const temp = categories.value[oldIndex]
      categories.value[oldIndex] = categories.value[newIndex]
      categories.value[newIndex] = temp
    }

    // 删除分类
    const handleDeleteCategory = (index) => {
      const category = categories.value[index]
      if (category.isSystem) {
        ElMessage.warning('系统分类不能删除')
        return
      }
      
      ElMessageBox.confirm('确定要删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        categories.value.splice(index, 1)
        ElMessage.success('删除成功')
      }).catch(() => {})
    }

    // 处理温馨提示变化
    const handleTipsChange = (value) => {
      form.tips = value
    }

    // 处理分类拖拽结束
    const handleCategoryDragEnd = () => {
      // 分类顺序改变后，预览会自动更新，因为使用了响应式数据
    }

    // 处理项目拖拽结束
    const handleItemDragEnd = () => {
      // 项目顺序改变后，预览会自动更新，因为使用了响应式数据
    }

    // 在 setup 中添加
    const helpDialogVisible = ref(false)
    const helpForm = reactive({
      name: '',
      help: '',
      item: null
    })

    // 处理添加帮助说明
    const handleAddHelp = (item) => {
      helpForm.name = item.name
      helpForm.help = item.help || ''
      helpForm.item = item
      helpDialogVisible.value = true
    }

    // 保存帮助说明
    const saveHelp = () => {
      if (helpForm.item) {
        helpForm.item.help = helpForm.help
        // 保存到本地存储
        localStorage.setItem('salaryItemHelps', JSON.stringify(
          categories.value.reduce((acc, category) => {
            category.items.forEach(item => {
              if (item.help) {
                acc[item.name] = item.help
              }
            })
            return acc
          }, {})
        ))
      }
      helpDialogVisible.value = false
      ElMessage.success('保存成功')
    }

    return {
      form,
      handleSelectAll,
      handleNewCategory,
      handlePrev,
      handleNext,
      categories,
      handleAddBlock,
      handleEditTitle,
      handleDragSort,
      previewData,
      saveTitle,
      handleDeleteCategory,
      handleTipsChange,
      handleCategoryDragEnd,
      handleItemDragEnd,
      payrollMonth,
      helpDialogVisible,
      helpForm,
      handleAddHelp,
      saveHelp,
    }
  }
}
</script>

<style lang="scss" scoped>
.salary-display {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .steps-wrapper {
    position: sticky;
    top: 0;
    padding: 24px;
    background: #fff;
    z-index: 100;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .display-content {
    flex: 1;
    display: flex;
    padding: 24px;
    height: calc(100vh - 180px);
    overflow: hidden;
    position: relative;
    padding-bottom: 80px; // 为底部按钮留出空间

    // 左侧设置区域（可滚动）
    .settings-scroll-wrapper {
      width: 50%;
      overflow-y: auto;
      padding-right: 12px;
      padding-bottom: 60px; // 为底部按钮留出空间

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ddd;
        border-radius: 3px;
      }

      .settings-section {
        display: flex;
        flex-direction: column;
        gap: 24px;

        .section-title {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .tips-section,
        .employee-info,
        .salary-items {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
        }

        .employee-info {
          .info-items {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
          }
        }

        .salary-items {
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;

            .template-select {
              display: flex;
              align-items: center;
              gap: 8px;
              
              :deep(.el-select) {
                width: 160px;
              }
            }
          }

          .select-all {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .category {
            background: #fff;
            border: 1px solid #e4e7ed;
            border-radius: 4px;
            margin-bottom: 16px;

            .category-header {
              display: flex;
              align-items: center;
              padding: 12px 16px;
              border-bottom: 1px solid #e4e7ed;

              .drag-handle {
                cursor: move;
                color: #999;
                font-size: 16px;
                margin-right: 8px;
                
                &:hover {
                  color: var(--el-color-primary);
                }
              }

              .title-wrapper {
                flex: 1;
                
                .title {
                  cursor: pointer;
                  font-size: 14px;
                  color: #333;
                  
                  &:hover {
                    color: var(--el-color-primary);
                  }
                }

                .el-input {
                  width: 200px;
                }
              }

              .actions {
                display: flex;
                gap: 8px;
                color: #999;

                .el-icon {
                  cursor: pointer;
                  font-size: 16px;

                  &:hover {
                    color: var(--el-color-primary);
                  }
                }
              }
            }

            .category-items {
              padding: 12px 16px;

              .item {
                display: flex;
                align-items: center;
                padding: 8px 0;
                
                .drag-handle {
                  cursor: move;
                  color: #999;
                  font-size: 16px;
                  margin-right: 8px;
                  visibility: hidden;
                }

                &:hover {
                  .drag-handle,
                  .item-actions {
                    visibility: visible;
                  }
                }

                .el-checkbox {
                  flex: 1;
                }

                .item-actions {
                  display: flex;
                  gap: 8px;
                  color: #999;
                  visibility: hidden;

                  .el-icon {
                    cursor: pointer;
                    font-size: 16px;

                    &:hover {
                      color: var(--el-color-primary);
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 右侧预览区域
      .preview-section {
        width: 50%;
        background: #fff;
        border-radius: 8px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;

        .preview-header {
          padding: 24px 24px 0;
          background: #fff;
          position: sticky;
          top: 0;
          z-index: 1;
        }

        .preview-content {
          flex: 1;
          padding: 24px;
          background: #f5f7fa;
          border-radius: 8px;
          margin: 20px;
          overflow-y: auto;
          max-height: calc(100vh - 280px);

          :deep(.phone-preview) {
            height: auto;
            min-height: 600px;
            display: flex;
            justify-content: center;
            padding: 20px;

            .section {
              width: 100%;
              margin-bottom: 16px;

              .item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #eee;

                &:last-child {
                  border-bottom: none;
                }
              }
            }
          }
        }
      }
    }

    .footer-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 16px;
      background: #fff;
      border-radius: 8px;
      display: flex;
      justify-content: center;
      gap: 12px;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
      z-index: 100;
    }
  }
}

.category {
  cursor: move;
  
  .category-header {
    &:hover {
      background-color: #f5f7fa;
    }
  }

  .category-items {
    .item {
      cursor: move;
      
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

.phone-preview {
  .phone-container {
    width: 280px;
    height: 580px;
    background: #fff;
    border-radius: 40px;
    position: relative;
    overflow: hidden;

    .salary-content {
      height: calc(100% - 68px);
      overflow-y: auto;
      background: #f5f7fa;
      padding: 16px;
      position: absolute;
      top: 68px;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}

.category-items {
  .item {
    .item-content {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;

      .el-checkbox {
        flex: 1;
      }

      .add-help {
        color: #409EFF;
        cursor: pointer;
        font-size: 16px;
        
        &:hover {
          color: #66b1ff;
        }
      }
    }
  }
}

.help-dialog {
  .help-form {
    padding: 0 20px;
    
    .form-item {
            margin-bottom: 20px;

      .label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 8px;
      }
      
      .value {
                  font-size: 14px;
                  color: #333;
        font-weight: 500;
      }
    }
  }
}
</style> 