<template>
  <el-dialog
    :title="op.title"
    v-bind="$attrs"
    width="60%"
    header-align="center"
    v-on="$listeners"
  >
    <el-table
      :data="tableData"
      border
      style="width: 100%"
    >
      <el-table-column
        label="序号"
        type="index"
        width="50"
        align="center"
      />
      <template v-for="(item,index) in op.tableFormat">
        <el-table-column
          :key="index"
          :prop="item.prop"
          :label="item.label"
          align="center"
          :width="item.width"
          :fixed="item.fixed"
          class="table-col-item"
          :show-overflow-tooltip="item.type!=='img'&&item.type!=='tb_img'&&!item.tooltip"
          :render-header="(h,obj) => renderHeader(h,obj,item)"
        >
          <template slot-scope="scope">
            <!-- 按钮操作 -->
            <span v-if="item.type == 'action_status'" width="1">
              <template v-for="(opa,i) in item.buttons">
                <span :key="i">
                  <el-button
                    v-if="((opa.isShow && opa.isShow(scope.row))||!opa.isShow) && opa.permissionCode"
                    v-hasPermi="opa.permissionCode"
                    :disabled="opa.disabled && opa.disabled(scope.row)"
                    size="mini"
                    type="text"
                    @click.stop="handle(opa, scope.row)"
                  >{{ opa.name }}&emsp;</el-button>
                  <el-button
                    v-else-if="!opa.permissionCode && opa.isShow && opa.isShow(scope.row)"
                    class="action-button"
                    size="mini"
                    type="text"
                    @click.stop="handle(opa, scope.row)"
                  >{{ opa.name }}&emsp;</el-button>
                  <el-button
                    v-else-if="!opa.isShow"
                    class="action-button"
                    size="mini"
                    type="text"
                    @click.stop="handle(opa, scope.row)"
                  >{{ opa.name }}&emsp;</el-button>
                  <div v-show="(item.buttons||[]).length === 0">暂无操作</div>
                </span>

              </template>
            </span>
            <!-- 需要用propShow显示且不需要tooltip类型 -->
            <span v-else-if="item.type=='select'">
              <!-- select动态查询时保存的是label，所以展示时显示的是Name，筛选时使用ID -->
              {{ tableRowShow(item,scope) }}
            </span>
            <span v-else-if="item.type=='custom_txt'">{{ scope.row[item.prop]?scope.row[item.prop]:item.propShow }}</span>
            <span v-else-if="item.type=='number'">{{ (scope.row[item.prop] || scope.row[item.prop]===0) ?scope.row[item.prop]:'/' }}</span>
            <!-- 普通text字段展示 -->
            <span v-else>
              <span v-if="item.showMethod">{{ item.showMethod(scope.row) }}</span>
              <span v-else>{{ rowTextShow(scope.row[item.prop],item) }}</span>
            </span>
          </template>

        </el-table-column>
      </template>
    </el-table>
    <el-pagination
      v-if="op.isPaging"
      class="inlineBlock"
      :current-page="pageParams.pageNum"
      :page-sizes="[10,20]"
      :page-size="pageParams.pageSize"
      :page-count="pageCount"
      :total="total"
      layout="prev, pager, next, total,sizes,jumper"
      @current-change="handleIndexChange"
      @size-change="handleSizeChange"
    >
    </el-pagination>
    <div v-if="op.showExtraInfo" class="extra-class">
      {{ op.extraInfo }}
    </div>
    <div class="footer-box">
      <el-button type="primary" @click="onClose">关闭</el-button>
    </div>

  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    title: {
      type: String,
      default: '附件历史版本'
    },
    op: {
      type: Object,
      default: () => {
        return {
          isPaging: false,
          showExtraInfo: false
        }
      }
    },
    isPaging: {
      type: Boolean,
      default: () => false
    },
    dictsPrefix: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      filterList: [],
      opData: {},
      tableData: [],
      pageParams: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      pageCount: 1
    }
  },
  computed: {
    ...mapGetters(['dicts']),
    setDicts() {
      const obj = {}
      if (this.dicts.length !== 0) {
        Object.keys(this.dicts).forEach(k => {
          if (this.dicts[k]) {
            for (const [key, value] of Object.entries(this.dicts[k])) {
              const o = {}
              obj[key] = {}
              if (value && value.length > 0) {
                value.forEach((item) => {
                  o[item.value] = item.label
                  o['color' + item.value] = item.color
                  obj[key] = Object.assign(obj[key], o)
                })
              }
            }
          }
        })
      }

      if (!obj) {
        this.op.obj.assign(obj)
      }
      return obj
    },
    rowTextShow() {
      return function(data, item) {
        if (data || (!data && typeof data == 'number')) {
          return data
        } else if (item.emptyText) {
          return item.emptyText
        } else {
          return '/'
        }
      }
    }
  },
  watch: {
    op: {
      deep: true,
      handler(val) {
        if (val.tableData && val.tableData.length > 0) {
          this.tableData = val.tableData
        }
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    refreshPage() {
      this.loadData()
    },
    tableRowShow(col, scope) {
      return this.showDictsLabel(col, scope.row)['label'] || '/'
    },
    // 根据枚举字典的value值展示对应的label值
    showDictsLabel({ prop, optionProp = '', value, dictsName, isYesOrNo = false }, row) {
      let label = ''
      let color = ''
      if (value === 'label') {
        label = row[prop]
        color = ''
      }
      const dictsPrefix = dictsName || this.dictsPrefix
      const dictProp = optionProp || prop
      if (this.setDicts[dictsPrefix + '_' + dictProp]) {
        // 选项value to lable ,value to color\
        label = this.setDicts[dictsPrefix + '_' + dictProp][row[prop]]
        color = this.setDicts[dictsPrefix + '_' + dictProp][
          'color' + row[prop]
        ]
      } else {
        label = ''
        color = ''
        if (isYesOrNo && this.setDicts[dictsPrefix + '_yesOrNo']) {
          label = this.setDicts[dictsPrefix + '_yesOrNo'][row[prop]]
        }
      }
      return { label, color }
    },
    renderHeader(h, { column, $index }, row) {
      if (row.extra) {
        return h(
          'div',
          [
            h('span', column.label),
            h('el-tooltip',
              [
                h('div', {
                  slot: 'content',
                  style: {
                    whiteSpace: 'normal'
                  }
                }, row.extra),
                h('i', {
                  class: 'el-icon-question',
                  style: 'color:#409eff;margin-left:5px;'
                })
              ]
            )
          ]
        )
      } else {
        return h(
          'div', [h('span', column.label)]
        )
      }
    },
    loadData() {
      if (this.op.tableData && this.op.tableData.length > 0) {
        this.tableData = this.op.tableData
        return
      }
      if (this.op.api) {
        let params = {}
        params = this.op.isPaging ? { ...this.op.params, ...this.pageParams } : { ...this.op.params }
        this.op.api(params).then(res => {
          this.tableData = res.data.list || res.data.data || res.data
          if (this.op.isPaging) {
            this.total = res.data.total
            this.pageCount = res.data.totalPage
          }
        })
      }
    },

    handle(prop, row) {
      // prop.method(row)
      const obj = {
        label: prop.label,
        prop: prop.method,
        row: row
      }
      this.$emit('handle', obj)
    },
    handleIndexChange(e) {
      this.pageParams.pageNum = e
      this.getPageData()
    },
    handleSizeChange(e) {
      this.pageParams.pageSize = e
      this.getPageData()
    },
    getPageData() {
      const params = { ...this.op.params, ...this.pageParams }
      this.op.api(params).then(res => {
        this.tableData = res.data.list || res.data.data || res.data
        this.total = res.data.total
        this.pageCount = res.data.totalPage
      })
    },
    onClose() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.footer-box {
    display: flex;
    justify-content: center;
    margin-top: 30px;
}
.extra-class {
  position: absolute;
  bottom: 90px;
  right: 20px;
  color: red;
}
.table-col-item{
  position: relative;
}
</style>
