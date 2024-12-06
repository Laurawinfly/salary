export default {
  path: '/salary',
  component: () => import('../../views/Layout.vue'),
  children: [
    {
      path: '',  // 默认重定向到发送页面
      redirect: '/salary/send'
    },
    {
      path: 'send',
      name: 'SendSalary',
      component: () => import('../../views/salary/SendSalary.vue')
    },
    {
      path: 'check',
      name: 'SalaryCheck',
      component: () => import('../../views/salary/SalaryCheck.vue')
    },
    {
      path: 'display',
      name: 'SalaryDisplay',
      component: () => import('../../views/salary/SalaryDisplay.vue')
    },
    {
      path: 'push',
      name: 'SalaryPush',
      component: () => import('../../views/salary/SalaryPush.vue')
    },
    {
      path: 'records',
      name: 'SendRecords',
      component: () => import('../../views/salary/SendRecords.vue')
    },
    {
      path: 'analysis',
      name: 'Statistics',
      component: () => import('../../views/salary/Statistics.vue')
    },
    {
      path: 'operation-logs',
      name: 'OperationLogs',
      component: () => import('../../views/salary/OperationLogs.vue')
    }
  ]
} 