// 从 localStorage 获取工资配置
export const getSalaryConfig = () => {
  try {
    const config = localStorage.getItem('salaryConfig')
    return config ? JSON.parse(config) : null
  } catch (error) {
    console.error('获取工资配置失败:', error)
    return null
  }
}

// 从 localStorage 获取工资数据
export const getSalaryData = () => {
  try {
    const data = localStorage.getItem('salaryTableData')
    return data ? JSON.parse(data) : []
  } catch (error) {
    console.error('获取工资数据失败:', error)
    return []
  }
}

// 更新工资项分类
export const updateSalaryItemCategory = (itemId, categoryId) => {
  try {
    const config = getSalaryConfig()
    if (!config) return false

    // 更新分类
    // 这里可以根据实际需求实现更新逻辑
    
    localStorage.setItem('salaryConfig', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('更新工资项分类失败:', error)
    return false
  }
}

// 更新分类顺序
export const updateCategoriesOrder = (newOrder) => {
  try {
    const config = getSalaryConfig()
    if (!config) return false

    // 更新分类顺序
    // 这里可以根据实际需求实现更新逻辑
    
    localStorage.setItem('salaryConfig', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('更新分类顺序失败:', error)
    return false
  }
}

// 更新项目顺序
export const updateItemsOrder = (categoryId, newOrder) => {
  try {
    const config = getSalaryConfig()
    if (!config) return false

    // 更新项目顺序
    // 这里可以根据实际需求实现更新逻辑
    
    localStorage.setItem('salaryConfig', JSON.stringify(config))
    return true
  } catch (error) {
    console.error('更新项目顺序失败:', error)
    return false
  }
} 