<template>
  <div class="app-container">
    <div v-show="!(open && tag.endsWith('Page'))" class="main">
      <div ref="fitlerBtn">
        <gy-filter :dicts-prefix="dictsPrefix" :filter-list="filterList" :op="op" />
        <gy-buttons
          :data-list="btnList"
          :class="{ 'is-fixed': isFixed }"
          @handle="handlePage"
        />
      </div>

      <gy-table
        :dicts-prefix="dictsPrefix"
        :op="op"
        @getRow="getRow"
        @handle="handlePage"
        @getSelection="getSelection"
      />

    </div>

    <!-- 动态加载二级页面 -->
    <component
      :is="tag"
      v-if="open"
      :ref="tag"
      :visible.sync="open"
      :dicts-prefix="dictsPrefix"
      :op="formOp"
      :title="dialogTitle"
      @handle="handlePage"
      @cancel="cancelPage"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFilterList } from '../packages/utils/common'
import * as api from './api'
import EditDialog from './dialog'//* 二级页面组件
// import { pageData } from './mock'
export default {
  name: 'Page2',
  components: { EditDialog },
  data() {
    return {
      // 是否定位显示中间按钮区
      isFixed: false,
      //* 枚举字典前缀 枚举字典在TeaCore-系统管理-字典管理中添加 字典命名规则  前缀_字段名
      dictsPrefix: 'ehr',
      dialogTitle: '',
      // 筛选项组件初始参数
      filterList: [],
      formData: {},
      //* 按钮组件PdBtn初始参数
      btnList: [
        {
          label: '新增',
          prop: 'handleAdd',
          canClick: ['all']
          // permissionCode: ['ehr-admin:holidayManage:annualLeave:add']
        },
        {
          label: '删除',
          prop: 'handleDelete',
          canClick: ['row', 'group']
          // permissionCode: ['ehr-admin:holidayManage:annualLeave:delete']
        },
        {
          label: '导出',
          prop: 'handleExport',
          canClick: ['all']
          // permissionCode: ['ehr-admin:holidayManage:annualLeave:export']
        }
      ],
      //* 表格组件PdTable初始参数
      op: {
        noPage: false, // 是否分页
        api: api.attendCheckRecordPage, //* 列表数据api
        params: { showType: 'hour' }, // 接口默认参数
        tableType: 'selection', // 显示 选择框还是序号
        needNotInit: false, // 初始是否需要调用接口
        tableFormat: [ // 表格数据配置
          {
            label: '工号',
            prop: 'empCode',
            filterSort: 2
          },
          {
            label: '姓名',
            prop: 'empName',
            filterSort: 1
          },
          {
            label: '部门',
            prop: 'departId',
            propShow: 'departName',
            // type: 'departTreeSelect',
            filterSort: 2
          },
          {
            label: '入职日期',
            prop: 'checkTime'
          },
          {
            label: '入职状态',
            prop: 'status',
            propShow: 'startStatusValue',
            type: 'select',
            filterSort: 3
          },
          {
            label: '操作',
            width: '200px',
            type: 'action_status',
            buttons: [
              { name: '明细', method: 'handleDetail' },
              { name: '调整', method: 'handleAdjust', permissionCode: ['ehr-admin:holidayManage:annualLeave:edit'] }
            ]
          }
        ]
      },
      rowData: {}, // 行数据
      selectionList: [], // 选中行
      tag: '', // 二级页面标签
      open: false, // 二级页面显示
      // 二级页面组件传入参数
      formOp: { api: undefined, formData: {}}
    }
  },
  computed: {
    // vuex 枚举字典
    ...mapGetters(['dicts'])
  },

  created() {
    this.filterList = getFilterList(this.op.tableFormat)
    console.log('lp============', this.$store)
  },
  methods: {
    handleInvalidCancel(data) {
      console.log('撤销', data)
      api.invalidCancel({ ...data.row }).then(res => {
        this.$message.success('撤销成功')
      })
    },
    //   新增
    handleAdd(info) {
      this.tag = 'EditDialog'
      this.formOp = {
        title: '新增',
        type: 'add',
        api: api.addAnnualLeave,
        rowData: { ...this.rowData },
        info
      }
    },
    // 调整
    handleAdjust(info) {
      this.tag = 'EditDialog'
      this.formOp = {
        title: '调整',
        type: 'edit',
        detailApi: api.annualLeaveSelectDays,
        api: api.updateAnnualLeave,
        rowData: { ...this.rowData },
        info
      }
    },
    // 明细
    handleDetail(info) {
      this.formOp = { ...this.detailOp }
      this.formOp.params = { empCode: this.rowData.empCode }
      this.tag = 'DetailDialog'
      this.dialogTitle = `明细/${this.rowData.empCode}-${this.rowData.empName}`
      this.showPage()
    },
    // 批量删除
    handleDelete(info) {
      info.label = '删除'
      info.alertAllMsg = `已选择${this.selectionList.length}条数据，是否确认删除已选数据？`
      const selectionList = this.selectionList.length ? this.selectionList : [this.rowData]
      const ids = []
      selectionList.filter(item => { ids.push(item.id) })
      this.handleData({
        api: api.deleteAnnualLeave,
        params: { idList: ids },
        confirm: true,
        info,
        formData: this.formFilter
      })
    },
    // 导入
    handleImport(info) {
      this.tag = 'ImportDialog'
      this.formOp = {
        formData: this.rowData,
        info,
        type: 'add'
      }
    },
    // 导出
    handleExport(info) {
      this.exportData({
        api: api.exportAnnualLeave,
        filename: '年假导出',
        info
      })
    },
    // 表格多选操作
    getSelection(val) {
      this.selectionList = val
    },
    // 表格单选操作 || 点击行
    getRow(row) {
      this.rowData = row
    },
    getStatue(row) {
      row
    },

    // 交互触发绑定方法
    handlePage(data) {
      // 重置tag
      this.tag = ''

      // 执行绑定方法
      this[data.prop](data)

      // 在方法中设置tag 如果tag存在 显示二级页面
      if (this.tag) {
        this.showPage()
      }
    },
    // 显示二级页面
    showPage() {
      this.open = true
    },
    // 取消二级页面
    cancelPage() {
      this.open = false
    },
    scrollFn() {
      this.getScrollPosition('fitlerBtn', bool => {
        this.isFixed = bool
      })
    }
  }
}
</script>
<style></style>
