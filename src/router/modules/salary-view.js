export default {
  path: '/salary-view',
  component: () => import('@/views/salary-view/layout.vue'),
  children: [
    {
      path: '',
      name: 'SalaryViewHome',
      component: () => import('@/views/salary-view/index.vue')
    },
    {
      path: 'verify',
      name: 'SalaryVerify',
      component: () => import('@/views/salary-view/verify.vue')
    },
    {
      path: 'detail',
      name: 'SalaryDetail',
      component: () => import('@/views/salary-view/detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: 'month-detail',
      name: 'MonthDetail',
      component: () => import('@/views/salary-view/month-detail.vue'),
      meta: { requiresAuth: true }
    }
  ]
} 