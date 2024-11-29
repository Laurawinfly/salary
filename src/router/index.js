import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/salary/send'
  },
  {
    path: '/salary',
    component: () => import('../views/Layout.vue'),
    children: [
      {
        path: 'send',
        name: 'SendSalary',
        component: () => import('../views/salary/SendSalary.vue')
      },
      {
        path: 'check',
        name: 'SalaryCheck',
        component: () => import('../views/salary/SalaryCheck.vue')
      },
      {
        path: 'records',
        name: 'SalaryRecords',
        component: () => import('../views/salary/SalaryRecords.vue')
      },
      {
        path: 'statistics',
        name: 'Statistics',
        component: () => import('../views/salary/Statistics.vue')
      },
      {
        path: 'operations',
        name: 'Operations',
        component: () => import('../views/salary/Operations.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 