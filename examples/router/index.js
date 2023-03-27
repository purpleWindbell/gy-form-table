import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/**
 * Note: 路由配置项
 *
 * hidden: true                   // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * alwaysShow: true               // 当你一个路由下面的 children 声明的路由大于1个时，自动会变成嵌套的模式--如组件页面
 *                                // 只有一个时，会将那个子路由当做根路由显示在侧边栏--如引导页面
 *                                // 若你想不管路由下面的 children 声明的个数都显示你的根路由
 *                                // 你可以设置 alwaysShow: true，这样它就会忽略之前定义的规则，一直显示根路由
 * redirect: noRedirect           // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'             // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * meta : {
    roles: ['admin','editor']    // 设置该路由进入的权限，支持多个权限叠加
    title: 'title'               // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'             // 设置该路由的图标，对应路径src/icons/svg
    breadcrumb: false            // 如果设置为false，则不会在breadcrumb面包屑中显示
  }
 */

// 公共路由
export const constantRoutes = [
  {
    path: '/page1',
    name: 'page1',
    component: resolve => require(['../testPage.vue'], resolve),
    hidden: true
  },

  {
    path: '/page2',
    name: 'page2',
    component: resolve => require(['../page.vue'], resolve),
    hidden: true
  }
  // {
  //   path: "/store",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: "basicInfo",
  //       component: resolve =>
  //         require(["@/views/storeCenter/basic/index"], resolve),
  //       name: "basic",
  //       meta: { title: "基础信息管理" },
  //       children: [
  //         {
  //           path: "list",
  //           component: resolve =>
  //             require(["@/views/storeCenter/basic/index"], resolve),
  //           name: "PerformOrder",
  //           meta: { title: "履约单管理" }
  //         }
  //       ]
  //     },
  //     {
  //       path: "perform",
  //       component: resolve =>
  //         require(["@/views/storeCenter/perform/index"], resolve),
  //       name: "perform",
  //       meta: { title: "履约单管理" },
  //       children: [
  //         {
  //           path: "performOrder",
  //           component: resolve =>
  //             require(["@/views/storeCenter/perform/perform/index"], resolve),
  //           name: "PerformOrder",
  //           meta: { title: "履约单管理" }
  //         },
  //         {
  //           path: "deliveryOrder",
  //           component: resolve =>
  //             require([
  //               "@/views/storeCenter/perform/deliveryOrder/index"
  //             ], resolve),
  //           name: "DeliveryOrder",
  //           meta: { title: "配送单管理" }
  //         }
  //       ]
  //     },
  //     {
  //       path: "operationsRules",
  //       component: resolve =>
  //         require(["@/views/storeCenter/operationsRules/index"], resolve),
  //       name: "OperationsRules",
  //       meta: { title: "运营规则设置" },
  //       children: [
  //         {
  //           path: "receipt",
  //           component: resolve =>
  //             require([
  //               "@/views/storeCenter/operationsRules/receipt/index"
  //             ], resolve),
  //           name: "PerformOrder",
  //           meta: { title: "小票规则设置" }
  //         },
  //         {
  //           path: "deliveryRule",
  //           component: resolve =>
  //             require([
  //               "@/views/storeCenter/operationsRules/deliveryRule/index"
  //             ], resolve),
  //           name: "DeliveryRule",
  //           meta: { title: "配送规则设置" }
  //         },
  //         {
  //           path: "operateRule",
  //           component: resolve =>
  //             require([
  //               "@/views/storeCenter/operationsRules/operateRule/index"
  //             ], resolve),
  //           name: "OperateRule",
  //           meta: { title: "运营规则设置" }
  //         },
  //         {
  //           path: "timePlan",
  //           component: resolve =>
  //             require([
  //               "@/views/storeCenter/operationsRules/timePlan/index"
  //             ], resolve),
  //           name: "deliveryOrder",
  //           meta: { title: "配送规则设置" }
  //         }
  //       ]
  //     }
  //   ]
  // }
  // {
  //   path: "/system",
  //   component: Layout,
  //   hidden: true,
  //   children: [
  //     {
  //       path: "dict",
  //       component: resolve => require(["@/views/system/dict/index"], resolve),
  //       name: "dict",
  //       meta: { title: "基础信息管理" },
  //       children: [
  //         {
  //           path: "list",
  //           component: resolve => require(["@/views/storeCenter/basic/index"], resolve),
  //           name: "PerformOrder",
  //           meta: { title: "履约单管理" }
  //         },
  //       ]
  //     }
  //   ]
  // },
]

export default new Router({
  mode: 'history', // 去掉url中的#
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})
