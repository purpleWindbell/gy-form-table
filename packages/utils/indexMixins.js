/*
 * @Author: guozhenjiang
 * @Date: 2022-09-20 15:22:06
 * @LastEditTime: 2023-03-14 09:45:04
 * @Description:
 */
import { mapGetters } from 'vuex'
import { getFilterList } from '../utils/common'
export const indexMixins = {
  template: `
  <div class="app-container">
    <div
      v-show="!(open && tag.endsWith('Page'))"
      class="main"
    >
      <div ref="fitlerBtn">
        <gy-filter
          :dicts-prefix="dictsPrefix"
          :filter-list="filterList"
          :op="op"
          ref="pdFilter"
          :new-bus="bus" 
        ></-filter>
        <gy-buttons
          :data-list="btnList"
          :class="{ 'is-fixed': isFixed }"
          @handle="handlePage"
          :new-bus="bus" 
        ></-btn>
      </div>

      <gy-table
        :dicts-prefix="dictsPrefix"
        :op="op"
        ref="pdTable"
        :new-bus="bus" 
        @getRow="getRow"
        @handle="handlePage"
        @getSelection="getSelection"
      ></-table>
    </div>
    <component
      :is="tag"
      v-if="open"
      :api="otherOp.api"
      :defaultFilter="otherOp.defaultFilter"
      :visible.sync="open"
      :open="open"
      :dicts-prefix="dictsPrefix"
      :op="formOp"
      :ref="tag"
      @change="handleDialogChange"
      @dialog-confirm="handleDialogConfirm"
      @cancel="cancelPage"
      @setData="handleDialogConfirm"
      @handle="handleDialogAction"
    ></component>
  </div>
  `,
  computed: {
    // vuex 枚举字典
    ...mapGetters(['dicts', 'formFilter'])
  },
  created() {
    // 系统枚举
    // if (this.dictsApi) {
    //   const obj = {
    //     api: this.dictsApi,
    //     params: { dictType: this.dictsPrefix }
    //   }
    //   // 基于项目前缀获取对应枚举字典列表对象
    //   // this.$store.dispatch('dicts/setDicts', obj)
    // } else if (this.dictsPrefix) {
    //   this.$store.dispatch('dicts/setDicts', { 'sysFlag': this.dictsPrefix })
    // }
    // // 获取筛选项初始参数
    this.filterList = getFilterList(this.op.tableFormat)
  },
  data() {
    return {
      // 其他的一些子页面参数
      otherOp: { api: '' },
      // 是否定位显示中间按钮区
      isFixed: false,
      // 筛选项组件初始参数
      filterList: [],
      // 行数据
      rowData: {},
      // 选中行
      selectionList: [],
      // 二级页面标签
      tag: '',
      // 二级页面显示
      open: false
    }
  },
  methods: {
    // 表格多选操作
    getSelection(val) {
      this.selectionList = val
    },
    // 表格单选操作 || 点击行
    getRow(row) {
      this.rowData = row
      this.setBtnStatus(row)
    },
    setBtnStatus() {},
    // 交互触发绑定方法
    handlePage(data) {
      this.tag = ''
      this[data.prop](data)
      if (this.tag) {
        this.showPage()
      }
    },
    handleDialogAction(data) {
      this[data.prop](data)
    },
    handleDialogChange() {},
    handleDialogConfirm() {
      this.open = false
    },
    refresh(params) {
      this.bus.$emit('filter', params || this.formFilter)
    },
    // 显示二级页面
    showPage(data) {
      if (data && data.tag) {
        this.tag = data.tag
        this.formOp = data.formOp
      }
      this.open = true
    },

    // 取消二级页面
    cancelPage(isRefresh) {
      this.open = false
      if (isRefresh === true) {
        this.bus.$emit('filter', this.$refs.pdfilter.formList)
      }
    }
  }
}
