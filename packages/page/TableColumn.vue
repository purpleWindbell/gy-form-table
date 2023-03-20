<template>

  <el-table-column
    v-if="!(col.isShow===false || (col.isShow && col.isShow() === false))"
    :key="col.prop"
    :prop="col.prop"
    :label="col.label || col.labelname"
    header-align="center"
    :width="col.width"
    :formatter="col.formatter"
    :fixed="col.fixed"
    :show-overflow-tooltip="col.type!=='img'&&col.type!=='tb_img'&&!col.tooltip"
    align="center"
    class="table-col-item"
    :render-header="renderHeader"
  >
    <!-- <el-tooltip class="tooltip-class" effect="light" content="深圳门店除台盖和喜年外，都选择深圳市奈雪餐饮管理有限公司" placement="right-start">
      <i class="el-icon-question" />
    </el-tooltip> -->
    <template slot-scope="scope">
      <!-- 给该列打标签 默认显示在右上角位置-->
      <div v-if="col.tagData" class="col-tag">
        <el-tag v-show="col.tagData(scope.row)">{{ col.tagData(scope.row) }}</el-tag>
      </div>
      <!-- 内嵌button -->
      <!-- type为select_button, 该列prop对应的筛选项为下拉框，表格中为button 按钮 -->
      <!-- input_button, 该列prop对应的筛选项为input框，表格中为button 按钮 -->
      <!-- showType == button 使用场景：当type字段已经被占用为其他搜索项如部门搜索，但是仍然需要按钮点击 -->
      <el-button
        v-if="col.type == 'button' || col.type == 'input_button' || col.type == 'select_button' || col.showType == 'button'"
        size="mini"
        type="text"
        :style="col.styleMethod ? col.styleMethod(scope.row) : { color: showDictsLabel(col, scope.row)['color'] }"
        @click.stop="handle(col, scope.row)"
      >
        <span v-if="col.buttonText">{{ col.buttonText }}</span>
        <span v-else-if="col.textMethod">{{ col.textMethod(scope.row) }}</span>
        <span v-else-if="col.selectDicts">{{ (showDictsLabel(col, scope.row)["label"] || '/') }}</span>
        <span v-else-if="col.propShow">{{ scope.row[col.propShow] || '/' }}</span>
        <span v-else>{{ scope.row[col.prop] || '/' }}</span>
      </el-button>
      <!-- 内嵌图片 -->
      <span v-else-if="col.type == 'img' || col.type=='tb_img'" class="col-span">
        <img
          v-if="scope.row[col.prop]"
          class="img-box"
          referrer="no-referrer|origin|unsafe-url"
          :src="renderUrl(col, scope.row)"
          alt
          @click="()=>{$emit('img-preview',col, scope.row)} "
        >
        <span v-else>暂无</span>
      </span>
      <!-- 操作按钮（例：增/删/改） -->
      <span v-else-if="col.type == 'action'" width="1">
        <template>
          <div class="action-button">
            <span
              v-for="(it, id) in col.buttons"
              :key="id"
              class="action-button"
            >
              <el-button
                v-if="it.permissionCode"
                v-hasPermi="it.permissionCode"
                size="mini"
                type="text"
                @click.stop="handle(it, scope.row)"
              >{{ it.name }}</el-button>
              <el-button
                v-else
                class="action-button"
                size="mini"
                type="text"
                @click.stop="handle(it, scope.row)"
              >{{ it.name }}</el-button>
            </span>
          </div>
        </template>
      </span>

      <!-- 内嵌操作按钮(根据状态动态加载操作按钮) -->
      <span v-else-if="col.type == 'action_status'" width="1">
        <template v-for="(it,i) in col.buttons">
          <span :key="i">
            <el-button
              v-if="((it.isShow && it.isShow(scope.row))||!it.isShow) && it.permissionCode"
              v-hasPermi="it.permissionCode"
              :disabled="it.disabled && it.disabled(scope.row)"
              size="mini"
              type="text"
              @click.stop="handle(it, scope.row)"
            >{{ it.name }}&emsp;</el-button>
            <el-button
              v-else-if="!it.permissionCode && it.isShow && it.isShow(scope.row)"
              class="action-button"
              size="mini"
              type="text"
              @click.stop="handle(it, scope.row)"
            >{{ it.name }}&emsp;</el-button>
            <el-button
              v-else-if="!it.isShow"
              class="action-button"
              size="mini"
              type="text"
              @click.stop="handle(it, scope.row)"
            >{{ it.name }}&emsp;</el-button>
          </span>
        </template>
        <div v-show="col.buttons.length === 0">暂无操作</div>
      </span>

      <span v-else-if="col.type === 'show_personal' || col.showMethod">
        <span>{{ col.showMethod(scope.row) }}</span>
      </span>

      <!-- 内嵌switch开关类型 -->
      <el-switch
        v-else-if="col.type == 'switch'"
        v-model="scope.row[col.prop]"
        :active-value="1"
        :inactive-value="2"
        active-color="#1890ff"
        inactive-color="#dcdfe6"
        @change="switchChange($event, col, scope.row)"
      />

      <span v-else-if="col.type === 'select_color'" :style="{ color: col.colorInfo(scope.row) }">
        <span>{{ col.propShow ? (scope.row[col.propShow]||'/') : (showDictsLabel(col, scope.row)["label"] || '/') }}</span>
      </span>

      <!-- 需要自定义tooltip类型 -->
      <span v-else-if="col.type === 'tooltip'" :style="{ color: showDictsLabel(col, scope.row)['color'] }">
        <el-tooltip :content="scope.row[col.tooltipShow]" placement="top">
          <span>{{ col.propShow ? (scope.row[col.propShow]||'/') : (showDictsLabel(col, scope.row)["label"] || '/') }}</span>
        </el-tooltip>
      </span>

      <!-- 需要自定义tooltip类型 但是该字段已经有其他类型占用 -->
      <span v-else-if="col.tooltip && needTooltipList.includes(col.type ) " :style="col.styleMethod ? col.styleMethod(scope.row) : { color: showDictsLabel(col, scope.row)['color'] }">
        <el-tooltip :content="scope.row[col.tooltipShow]" placement="top">
          <span>{{ col.propShow ? (scope.row[col.propShow]||'/') : (showDictsLabel(col, scope.row)["label"] || '/') }}</span>
        </el-tooltip>
      </span>

      <!-- 需要用propShow显示且不需要tooltip类型 -->
      <span v-else-if="propShowTypeList.includes(col.type)" :style="col.styleMethod ? col.styleMethod(scope.row) : { color: showDictsLabel(col, scope.row)['color'] }">
        <!-- {{ showDictsLabel(item, scope.row)['label'] }} -->
        <!-- select动态查询时保存的是label，所以展示时显示的是Name，筛选时使用ID -->
        {{ tableRowShow(col,scope) }}
      </span>

      <!-- 文件预览 -->
      <el-button
        v-else-if="col.type =='file-preview'"
        size="mini"
        type="text"
        @click.stop="$emit('file-preview', scope.row[col.urlProp])"
      >
        <span v-if="col.buttonText">{{ col.buttonText }}</span>
        <span v-else-if="col.textMethod">{{ col.textMethod(scope.row) }}</span>
        <span v-else-if="col.selectDicts">{{ (showDictsLabel(col, scope.row)["label"] || '/') }}</span>
        <span v-else-if="col.propShow">{{ scope.row[col.propShow] || '/' }}</span>
        <span v-else>{{ scope.row[col.prop] || '/' }}</span>
      </el-button>

      <!-- type为list_map，该列为列表数据且分行显示 -->
      <div
        v-for="(opt, idx) in scope.row[col.listProp]"
        v-else-if="col.type == 'list_map'"
        :key="idx"
        class="list-box"
      >
        <div v-if="col.showMethod" class="box">{{ col.showMethod(opt) }}</div>
        <div v-else class="box">{{ opt[col.prop] }}</div>
      </div>

      <!-- select_map类型 -->
      <span v-else-if="col.type == 'select_map'">{{ showList(col, scope.row) }}</span>

      <!-- type为poppver，表格<el-popover>展示 -->
      <el-popover
        v-else-if="col.type == 'poppver'"
        placement="top-start"
        width="200"
        trigger="hover"
        @show="showList(col, scope.row)"
      >
        <div v-html="showList(col, scope.row)" />
        <span slot="reference">{{ scope.row[col.prop] }}</span>
      </el-popover>

      <!-- 显示价格数字类型 -->
      <span
        v-else-if="col.type == 'price'"
      >{{ scope.row[col.prop] && (scope.row[col.prop] + "元") || "/" }}</span>

      <!-- type为compose 为多列组合显示-->
      <span v-else-if="col.type == 'compose'">{{ showCompose(col, scope.row) }}</span>
      <span
        v-else
        :style="col.styleMethod ? col.styleMethod(scope.row) : { color: showDictsLabel(col, scope.row)['color'] }"
      >{{ (col.propShow ? scope.row[col.propShow]: scope.row[col.prop]) || (String(scope.row[col.prop])==='0'? '0' : "/" ) }}
      </span>
    </template>

    <template v-if="col.children">
      <PdTableColumn
        v-for="(item, index) in col.children"
        :key="index"
        :col="item"
        :dicts-prefix="dictsPrefix"
      />
    </template>

  </el-table-column>
</template>
<script>

// import { mapGetters } from 'vuex'
export default {
  name: 'PdTableColumn',
  components: { },
  props: {
    col: {
      type: Object
    },
    dictsPrefix: {
      type: String
    },
    op: {
      type: [Object]
    }
  },
  data() {
    return {
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
      // 哪些类型支持propShow显示
      propShowTypeList: ['select', 'select_nofilter', 'datetimerange', 'daterange', 'select_otherSys', 'tree_select', 'area_country', 'area_province', 'area_city', 'area_region'],
      needTooltipList: ['tree_select', 'departTreeSelect'],
      currentLabelProp: '',
      currentValueProp: ''
    }
  },
  computed: {
    // ...mapGetters(['dicts']),
    //  改变枚举字典映射关系 keyName：   value ，keyValue：label  以便选项value to label
    setDicts() {
      const obj = {}
      if (this.dicts && this.dicts.length !== 0) {
        Object.keys(this.dicts).forEach(k => {
          if (this.dicts[k]) {
            for (const [key, value] of Object.entries(this.dicts[k])) {
              const o = {}
              obj[key] = {}
              if (value && value.length > 0) {
                value.forEach((item) => {
                  o[item[this.currentValueProp || 'value']] = item[this.currentLabelProp || 'label']
                  o['color' + item[this.currentValueProp || 'value']] = item.color
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
    defaultParams() {
      return JSON.parse(JSON.stringify(this.op.params))
    }
  },

  methods: {
    renderHeader(h, { column, $index }) { // h即为cerateElement的简写，具体可看vue官方文档
      if (this.col.extra) {
        return h(
          'div',
          [
            h('span', column.label),
            h('el-tooltip',
              [
                h('div', {
                  slot: 'content',
                  style: {
                    whiteSpace: 'normal',
                    wordWrap: 'break-work',
                    width: '320px',
                    lineHeight: '20px'
                  }
                }, this.col.extra),
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
    tableRowShow(col, scope) {
      if (col.propShow) return (scope.row[col.propShow] || '/')
      else if (col.showMethod) {
        return col.showMethod(scope.row)
      } else {
        return this.showDictsLabel(col, scope.row)['label'] || '/'
      }
    },
    testInput(val) {
      this.$emit('testInput', val)
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
    handle(item, row) {
      const obj = {
        label: item.label,
        prop: item.method
      }
      // 点击单元格触发行选中方法
      this.$emit('getRow', row)
      this.$emit('handle', obj)
    },

    // 根据枚举字典的value值展示对应的label值
    showDictsLabel(col, row) {
      const { prop, optionProp = '', value, dictsName, isYesOrNo = false } = col
      let label = ''
      let color = ''
      if (col.labelProp || col.valueProp) {
        this.currentLabelProp = col.labelProp
        this.currentValueProp = col.valueProp
      } else {
        this.currentLabelProp = ''
        this.currentValueProp = ''
      }
      if (value === 'label') {
        label = row[prop]
        color = ''
      }
      const dictsPrefix = dictsName || this.dictsPrefix
      const dictProp = optionProp || prop
      if (this.setDicts[dictsPrefix + '_' + dictProp]) {
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
    }

  }
}
</script>
<style lang="scss" scoped>
.item-span {
  height: 80px;
  width: 100px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
  background-image: url("") norepeat;

  img {
    width: 100%;
    height: 100%;
  }
}
.table-col-item{
  position: relative;
}
.col-tag {
  position:absolute;
  top: -3px;
  right: -3px;
  /deep/ .el-tag {
    transform: scale(0.8);
  }
}
// 操作栏里面的按钮间距大一些
.action-button /deep/ .el-button--text  {
  padding-right: 5px;
}
.list-box{
  border-bottom: 1px solid #eaeaea;
  padding: 5px 0;
  .box{
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 100%;
    overflow: hidden;
  }
  &:last-of-type{
    border-bottom: none;
  }
}
.img-box {
  height: 80px;
  width: 100px;
  display: inline-block;
  vertical-align: middle;
  text-align: center;
}

</style>
