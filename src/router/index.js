import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',  //后面所有配置的路由, 都要配个name值,大写字母开头
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard' }
    }]
  },
]

export const allAsyncRoutes = [
  // 配置商品管理相关的路由
  {
    path: '/product', //一级路由组件只有login和layout两个,
    component: Layout,  //显示一级路由组件架子,并且立马重定向二级路由组件
    name: 'Product',
    redirect: '/product/trademark/list',
    meta: { title: '商品管理', icon: 'el-icon-s-shop' },
    children: [
      {
        path: 'trademark/list',
        component: () => import('@/views/product/trademark/List'),
        name: 'Trademark',
        meta: { title: '品牌管理' }  //二级路由下没有图片icon
      },
      {
        path: 'attr/list',
        component: () => import('@/views/product/attr/List'),
        name: 'Attr',
        meta: { title: '平台属性管理' }  //二级路由下没有图片icon
      },
      {
        path: 'spu/list',
        component: () => import('@/views/product/spu/List'),
        name: 'Spu',
        meta: { title: 'SPU管理' }  //二级路由下没有图片icon
      },
      {
        path: 'sku/list',
        component: () => import('@/views/product/sku/List'),
        name: 'Sku',
        meta: { title: 'SKU管理' }  //二级路由下没有图片icon
      },
      {
        path: 'category/list',
        component: () => import('@/views/product/category/List'),
        name: 'Category',
        meta: { title: '分类管理' }  //二级路由下没有图片icon
      },
    ]
  },

  
]

export const anyRoute = {
  path: '*',
  redirect: '/404',
  hidden: true
}

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
