<template>
  <div ref="tableWrapper" class="hytable" :height="tableH">
    <el-table
      ref="multipleTable"
      v-loading="loading"
      size="mini"
      :data="tableData"
      :cell-style="handleCellStyle"
      border
      class="user-set"
      :max-height="tableH"
      style="width: 100%"
      highlight-current-row
      @row-click="handleCurrentChange"
      @selection-change="handleSelectionChange"
    >
      <el-table-column
        v-if="op.tableType == 'selection'"
        type="selection"
        width="50"
        :fixed="op.fixed"
        align="center"
      />
      <el-table-column
        v-if="op.tableType == 'sort'"
        type="index"
        width="50"
        :fixed="op.fixed"
        align="center"
      >
      </el-table-column>
      <TableColumn
        v-for="(item, index) in op.tableFormat"
        :key="index"
        :col="item"
        :dicts-prefix="dictsPrefix"
        @getRow="getRow"
        @handle="handle"
        @img-preview="previewImg"
        @file-preview="handleFilePreview"
      />
    </el-table>
    <div v-if="!noPage" ref="pagination" class="pagination-wapper">
      <el-pagination
        :current-page="page.pageNum"
        :page-sizes="[10, 25, 50]"
        :page-size="page.pageSize"
        :total="total"
        :page-count="pageCount"
        layout="prev, pager, next, total,sizes,jumper"
        @size-change="handleSizeChange"
        @current-change="handleIndexChange"
      />
    </div>
    <!-- <previewImage v-if="previewShow" class="test7777" :show="previewShow" :url-list="previewImgList" @close="()=>{previewShow = false}">
      <slot></slot>
    </previewImage> -->
    <!-- <FilePreviewDialog
      v-if="dialogOpen"
      :op="dialogOp"
      :visible.sync="dialogOpen"
      @cancel="()=>{dialogOpen = false}"
    ></FilePreviewDialog> -->
  </div>
</template>

<script>
// import { mapGetters } from 'vuex'
import TableColumn from './TableColumn'
export default {
  name: 'PdTable',
  components: { TableColumn },
  props: {
    dictsPrefix: {
      type: String
    },
    op: {
      type: [Object],
      required: true
    },
    newBus: {
      type: Object,
      default: () => {}
    },
    noPage: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      dialogOpen: false,
      dialogOp: {},
      screenHgt: 0,
      loading: false,
      tableH: 0,
      condition: {},
      // 表格数据 数组
      tableData: [],

      page: {
        // 页码 默认1
        pageNum: 1,
        // 页面大小 默认10
        pageSize: 10
      },
      // 筛选条件
      filterParams: {},
      // 总页面数
      total: 0,
      pageCount: 0,
      // 选中行数据
      selectedRowData: null,
      newRouter: '',
      // 图片预览
      previewShow: false,
      previewImgList: []
    }
  },
  computed: {
    // ...mapGetters(['dicts', 'pageSize']),
    defaultParams() {
      return JSON.parse(JSON.stringify(this.op.params))
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.resetHeight()
    })
    window.onresize = () => {
      this.resetHeight()
    }
  },
  activated(val) {
    // this.$store.dispatch('common/setTotal', this.total)
    if (this.op.tableFrom !== 'dialog') {
      this.$bus.$off('filter')
      this.$bus.$on('filter', (filterParams = {}) => {
        this.setFilter(filterParams)
      })
    }
    this.$bus.$on('resetHeight', (delay) => {
      this.$nextTick(() => {
        this.resetHeight(delay)
      })
    })
  },
  deactivated() {
    this.$bus.$off('filter')
    this.$bus.$off('resetHeight')
  },
  beforeDestroy() {
    this.$bus.$off('filter')
    this.$bus.$off('resetHeight')
  },

  created() {
    this.$bus = this.newBus || this.bus
    this.screenHgt = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    this.page.pageSize = this.pageSize
    // 初始化页面
    // 组件needNotInit设置为true,表示初次不加载需配合beforeCreate钩子使用
    // needInit设置为true, 表示初次加载，一般用再table接收对象（op）从dialog中传入
    if (!this.op.needNotInit || this.op.needInit) {
      this.init()
    }
    this.filterParams = {
      ...this.defaultParams
    }
    if (this.op.tableFrom !== 'dialog') {
      // this.$bus.$off('filter')
      this.$bus.$on('filter', (filterParams = {}) => {
        this.setFilter(filterParams)
      })
    }
  },
  methods: {
    handleFilePreview(url) {
      const arr = url.split('.')
      const type = arr[arr.length - 1]
      if (type == 'docx' || type == 'doc') {
        this.dialogOpen = true
        this.dialogOp = {
          url: url
        }
      }
    },
    setFilter(filterParams) {
      this.page.pageNum = filterParams.pageNum ? filterParams.pageNum : 1
      this.page.pageSize = filterParams.pageSize ? filterParams.pageSize : 10
      // 筛选条件
      this.filterParams = filterParams
      const params = Object.assign(
        {},
        this.page,
        this.filterParams
      )
      this.getData(params)
    },
    showCompose({ method, propShow }, row) {
      return method(propShow, row)
    },
    showList({ prop, value, method }, row) {
      return method(row)
    },
    switchChange(value, { method }, row) {
      method(value, row)
    },
    renderUrl(item, row) {
      if (item.type === 'tb_img') {
        return process.env.VUE_APP_BASE_UPLOAD_URL + '/' + row[item.prop]
      } else {
        return row[item.prop]
      }
    },
    getRow(row) {
      this.$emit('getRow', row)
    },
    handle(obj) {
      this.$emit('handle', obj)
    },
    init() {
      // 获取表格数据
      const params = Object.assign({}, this.page, this.defaultParams)
      this.getData(params)
    },

    // 重置选中行
    toggleRow(row) {
      this.$refs.multipleTable.setCurrentRow(row)
    },
    // 重置批量选择
    toggleSelection() {
      if (this.selectedRowData) {
        this.selectedRowData.forEach(row => {
          this.$refs.multipleTable.toggleRowSelection(row)
        })
      } else {
        this.$refs.multipleTable.clearSelection()
      }
    },
    /** 获取数据列表 */
    getData(params) {
      this.loading = true
      // 保存筛选项
      // const formFilter = {
      //   ...params
      // }
      // this.$store.dispatch('common/setFormFilter', formFilter)

      this.op.api(params).then((datas) => {
        this.loading = false
        if (!this.noPage) {
          this.handlePageData(datas)
        } else {
          this.handleNoPageData(datas)
        }
      }, () => {
        this.loading = false
        // this.$store.dispatch('common/setTotal', 0)
      })
      this.pageCount = 1
    },
    handleNoPageData(datas) {
      this.tableData = datas.data
      this.resetHeight()
    },
    handlePageData(datas) {
      this.tableData = datas.data.data || datas.data.list || datas.data.pageData
      this.total = datas.data.total
      // this.$store.dispatch('common/setTotal', datas.data.total)
      this.pageCount = Math.ceil(datas.data.total / datas.data.pageSize)
      this.resetHeight()
      if (datas.data.other) {
        // 特殊需求
        // this.$store.dispatch('common/setOther', datas.data.other)
      }
    },
    // 重新设置高度
    resetHeight() {
      this.tableH = 0
      const refsTable = this.$refs.tableWrapper
      if (refsTable) {
        const pageH = this.noPage ? 0 : this.$refs.pagination.offsetHeight
        // table的高度 可以理解为document.documentElement.clientHeight - table的top值 - 页脚的高度（35px）
        const hight = this.screenHgt - refsTable.getBoundingClientRect().top - pageH
        this.tableH = hight < this.defaultHgt ? this.defaultHgt : hight
      }
    },
    // 设置table高度
    fetTableHeight() {
      this.resetHeight()
      const top = this.$refs.tableWrapper.getBoundingClientRect().top
      const height = document.documentElement.clientHeight - top - 80
      this.tableH = height < 200 ? 200 : height
    },
    /** 改变分页 页号 */
    handleIndexChange(val) {
      this.page.pageNum = val
      delete this.filterParams.pageNum
      const params = Object.assign(
        {},
        this.page,
        this.filterParams
      )
      this.getData(params)
    },
    /** 点击行 */
    handleCurrentChange(val) {
      // 重置批量选择
      this.toggleSelection()
      this.toggleRow(val)
      this.$emit('getRow', val)
      this.$emit('getSelection', [val])
      this.$bus.$emit('changeBtnStatue', 'row')
    },
    // 图片预览弹框
    previewImg(item, row) {
      if (!item.isPreview) return
      this.previewImgList = [row[item.prop]]
      this.previewShow = true
    },
    /** 批量操作 */
    handleSelectionChange(val) {
      // 重置选中行
      this.toggleRow()
      this.selectedRowData = val
      if (val.length === 0) {
        this.$bus.$emit('changeBtnStatue', '')
      } else if (val.length === 1) {
        this.$emit('getRow', val[0])
        this.$emit('getSelection', val)
        this.toggleRow(val[0])
        this.$bus.$emit('changeBtnStatue', 'row')
      } else {
        this.$emit('getSelection', val)
        this.$bus.$emit('changeBtnStatue', 'group')
      }
    },
    /** 改变分页 单页长度 */
    handleSizeChange(val) {
      delete this.filterParams.pageSize
      delete this.filterParams.pageNum
      this.page.pageNum = 1
      this.page.pageSize = val
      // this.$store.dispatch('common/setPageSize', val)
      const params = Object.assign(
        {},
        this.page,
        this.filterParams
      )
      this.getData(params)
    },
    handleCellStyle({ row }) {
      if (this.op.unique && this.selectedRowData) {
        if (row[this.op.unique] === this.selectedRowData[this.op.unique]) {
          return { backgroundColor: '#E9E9E9FF', color: '#303133FF' }
        }
      }
    }
  }

}
</script>

<style scoped lang="scss">
.user-set /deep/ button{
  user-select: unset;
}
.user-set /deep/ .el-table__empty-block {
  border-bottom: 1px solid #dfe6ec;
}
</style>

