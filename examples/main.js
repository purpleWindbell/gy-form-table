import Vue from 'vue'
import App from './index.vue'
import GyButtons from '../packages/page/Buttons.vue'
import GyFilter from '../packages/page/Filter.vue'
import GyTable from '../packages/page/Table.vue'
import GyForm from '../packages/form/index.vue'
import GyPage from '../packages/page/index.vue'
import Element from 'element-ui'
import store from './store'
import router from './router'
import permission from '../packages/directive/permission/index.js'
import 'element-ui/lib/theme-chalk/index.css'
import { handleConfirmData, exportData } from '../packages/utils/common.js'
Vue.config.productionTip = false

const bus = new Vue()
Vue.prototype.bus = bus
Vue.use(permission)
Vue.component('GyButtons', GyButtons)
Vue.component('GyFilter', GyFilter)
Vue.component('GyTable', GyTable)
Vue.component('GyForm', GyForm)
Vue.component('GyPage', GyPage)
Vue.use(Element, { size: 'mini' })
Vue.prototype.exportData = exportData
Vue.prototype.handleConfirmData = handleConfirmData
new Vue({
  store,
  router,
  render: h => h(App)
}).$mount('#app')
