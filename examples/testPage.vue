<template>
  <div class="app-container">
    <GyPage ref="gyPage" :btn-list="btnList" :table-op="op" @handle="handlePage"></GyPage>
    <!-- 动态加载二级页面 -->
    <component
      :is="tag"
      v-if="open"
      :ref="tag"
      :visible.sync="open"
      :op="formOp"
      @handle="handlePage"
      @cancel="cancelPage"
      v-on="$listeners"
    />
  </div>
</template>
<script>
import * as api from './api'
import EditDialog from './dialog'//* 二级页面组件
import DetailDialog from '../packages/components/DetailDialog'//* 二级页面组件
import ImportDialog from '../packages/components/ImportDialog'//* 二级页面组件
export default {
  name: 'Page1',
  components: { EditDialog, DetailDialog, ImportDialog },
  data() {
    return {
      open: false,
      tag: '',
      formOp: { api: undefined, formData: {}},
      btnList: [
        {
          label: '新增',
          prop: 'handleAdd',
          canClick: ['all']
          // permissionCode: ['page1:add']
        },
        {
          label: '删除',
          prop: 'handleDeleteBatch',
          canClick: ['row', 'group']
          // permissionCode: ['page1:delete']
        },
        {
          label: '导出',
          prop: 'handleExport',
          canClick: ['all']
          // permissionCode: ['page1:export']
        },
        {
          label: '导入',
          prop: 'handleImport',
          canClick: ['all']
          // permissionCode: ['page1:import']
        }
      ],
      detailOp: {
        dictsPrefix: 'ehr',
        api: api.attendCheckRecordPage,
        params: {},
        tableFormat: [
          {
            label: '更新时间',
            prop: 'empCode'
          },
          {
            label: '请假日期',
            prop: 'empName'
          },
          {
            label: '操作',
            width: '100px',
            type: 'action_status',
            buttons: [
              { name: '撤销', method: 'handleInvalidCancel' }
            ]
          }
        ]
      },
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
              { name: '调整', method: 'handleAdjust' },
              { name: '删除', method: 'handleDelete' }
            ]
          }
        ]
      }
    }
  },
  methods: {
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
    // 批量删除
    handleDeleteBatch(info) {
      info.label = '删除'
      info.alertAllMsg = `已选择${this.selectionList.length}条数据，是否确认删除已选数据？`
      const ids = []
      this.selectionList.forEach(item => { ids.push(item.id) })
      this.handleConfirmData({
        api: api.attendCheckRecordPage,
        params: { ids: ids },
        confirm: true,
        info,
        callback: this.refresh
      })
    },
    // 删除
    handleDelete(info) {
      this.handleConfirmData({
        api: api.attendCheckRecordPage,
        params: { id: this.rowData.id },
        confirm: true,
        info: { ...info, label: '删除' },
        callback: this.refresh
      })
    },
    // 导出
    handleExport(info) {
      this.exportData({
        api: api.exportSummaryAttendRecord,
        params: { filename: '基础设施清洁标准-导出', ...this.currentFilter },
        info
      })
    },
    // 导入
    handleImport(info) {
      this.tag = 'ImportDialog'
      this.formOp = {
        formData: this.rowData,
        info
      }
    },
    // 明细
    handleDetail(info) {
      this.tag = 'DetailDialog'
      this.formOp = {
        ...this.detailOp,
        params: { empCode: this.rowData.empCode },
        title: `明细/${this.rowData.empCode}-${this.rowData.empName}`
      }
      // this.showPage()
    },
    // 根据当前搜索条件刷新当前页面
    refresh() {
      debugger
      this.$refs.gyPage.refresh()
    },

    // 交互触发绑定方法
    handlePage(data) {
      this.tag = '' // 重置tag
      this[data.prop](data)// 执行绑定方法
      // 在方法中设置tag 如果tag存在 显示二级页面
      if (this.tag) { this.showPage() }
    },
    // 显示二级页面
    showPage() {
      this.open = true
    },
    // 取消二级页面
    cancelPage() {
      this.open = false
    }
  }

}
</script>
