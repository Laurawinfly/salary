import { createRouter, createWebHistory } from 'vue-router'
import salaryAdmin from './modules/salary'
import salaryView from './modules/salary-view'

const routes = [
  {
    path: '/',
    redirect: '/salary-view'
  },
  salaryAdmin, // 管理端路由
  salaryView   // 员工端路由
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  console.log('路由跳转:', {
    to: to.path,
    from: from.path,
    query: to.query
  })
  
  // 检查是否需要验证
  if (to.meta.requiresAuth) {
    const isVerified = localStorage.getItem('salary_verified')
    if (!isVerified) {
      next({
        path: '/salary-view/verify',
        query: {
          redirect: to.path,
          ...to.query
        }
      })
      return
    }
  }
  
  next()
})

export default router 