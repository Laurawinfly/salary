import request from '@/utils/request'

// 获取用户信息
export function getUserInfo() {
  return request({
    url: '/api/salary/user/info',
    method: 'get'
  })
}

// 获取工资历史年份列表
export function getSalaryYears() {
  return request({
    url: '/api/salary/years',
    method: 'get'
  })
}

// 获取指定年份的工资记录
export function getSalaryHistory(year) {
  return request({
    url: '/api/salary/history',
    method: 'get',
    params: { year }
  })
}

// 获取月度工资详情
export function getMonthDetail(params) {
  return request({
    url: '/api/salary/month/detail',
    method: 'get',
    params
  })
}

// Mock数据
export const getMockData = () => {
  return {
    history: {
      "2024": [
        {
          companyId: "1",
          companyName: "示例公司",
          months: [
            {
              month: 3,
              detail: {
                actualAmount: 8500.00,
                status: "已发放",
                employee: {
                  id: "EMP001",
                  name: "张三"
                },
                basic: {
                  totalSalary: 10000.00,
                  tax: 1500.00,
                  actualSalary: 8500.00
                },
                others: {
                  baseSalary: 5000.00,
                  positionSalary: 3000.00,
                  performanceSalary: 2000.00
                }
              }
            },
            {
              month: 2,
              detail: {
                actualAmount: 8500.00,
                status: "已发放",
                employee: {
                  id: "EMP001",
                  name: "张三"
                },
                basic: {
                  totalSalary: 10000.00,
                  tax: 1500.00,
                  actualSalary: 8500.00
                },
                others: {
                  baseSalary: 5000.00,
                  positionSalary: 3000.00,
                  performanceSalary: 2000.00
                }
              }
            }
          ]
        }
      ],
      "2023": [
        {
          companyId: "1",
          companyName: "示例公司",
          months: [
            {
              month: 12,
              detail: {
                actualAmount: 8500.00,
                status: "已发放",
                employee: {
                  id: "EMP001",
                  name: "张三"
                },
                basic: {
                  totalSalary: 10000.00,
                  tax: 1500.00,
                  actualSalary: 8500.00
                },
                others: {
                  baseSalary: 5000.00,
                  positionSalary: 3000.00,
                  performanceSalary: 2000.00
                }
              }
            }
          ]
        }
      ]
    }
  }
} 