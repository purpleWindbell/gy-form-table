/* eslint-disable vue/no-side-effects-in-computed-properties */
<template>
  <div class="pd-filter pd-filter-fold">
    <transition name="fade" @enter="enter" @after-leave="afterLeave">
      <el-form
        v-show="!isFold"
        ref="formList"
        :model="formList"
        :inline="true"
        :size="size"
        :label-width="labelWidth"
      >
        <div class="item-container">
          <slot name="header" />
          <slot name="chain" />
        </div>
        <template v-for="(item, index) in sortFilterList">
          <!-- 自定义时间范围组件label值自定义 -->
          <el-form-item
            v-if="showFilterItem(item)"
            :key="index"
            :label="
              (item.type == 'datetimerange_custom' &&
                item.filterLabel.join('/') + '时间') || item.labelFilter ||
                item.label
            "
            :prop="item.prop"
            :label-width="item.filterLabelWidth"
          >

            <!-- 下拉框-->
            <!-- type类型（ select: 单选， select_button： prop对应的值即是筛选项的下拉框又是表格中可点击的按钮， select_remote： 远程搜索 ）-->
            <!-- notClear:不需要清空，默认下拉搜索可以清空 -->
            <el-select
              v-if="item.type == 'select' || item.type=='select_button' || item.type=='select_map' || item.type=='select_color'"
              v-model="formList[item.prop]"
              :filterable="item.filterable || filterable"
              :multiple="item.multiple || multiple"
              :remote="item.remote || remote"
              :no-data-text="item.noDataText || ''"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :style="{ width: itemWidth }"
              reserve-keyword
              :remote-method="remoteMethod"
              :clearable="!item.notClear"
              @focus="focus(item)"
              @change="chainSelectCahnge($event, item)"
            >
              <el-option v-if="!item.selectType && !item.multiple && !item.remote && !item.notShowAllOption" value label="全部" />
              <template v-if="item.options">
                <el-option
                  v-for="(opt,idx) in item.options"
                  :key="idx"
                  :label="opt[item.labelProp?item.labelProp:'label']"
                  :value="selectOptionValue(item,opt)"
                />
              </template>
              <!--  item.value 判断该字段传枚举字段label还是value-->
              <template v-else-if="item.dictsName">
                <el-option
                  v-for="(opt,idx) in (dicts[item.dictsName] && dicts[item.dictsName][item.dictsName + '_' + (item.isYesOrNo? 'yesOrNo' : (item.optionProp ? item.optionProp : item.prop))] || [])"
                  :key="idx"
                  :label="opt[item.selectLabelProp?item.selectLabelProp:'label']"
                  :value="selectOptionValue(item,opt)"
                />
              </template>
              <template v-else>
                <el-option
                  v-for="(opt,idx) in (dicts[dictsPrefix] && dicts[dictsPrefix][dictsPrefix + '_' + (item.isYesOrNo? 'yesOrNo' : (item.optionProp ? item.optionProp : item.prop))] || [])"
                  :key="idx"
                  :label="opt[item.selectLabelProp?item.selectLabelProp:'label']"
                  :value="selectOptionValue(item,opt)"
                />
              </template>
            </el-select>
            <!-- type类型 (公共的枚举值) -->
            <el-select
              v-else-if="item.type == 'select_otherSys'"
              v-model="formList[item.prop]"
              :filterable="item.filterable || filterable"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :style="{ width: itemWidth }"
              clearable
            >
              <el-option
                v-if="!item.selectType && !item.multiple && !item.remote"
                value
                label="全部"
              />
              <el-option
                v-for="(op,idx) in (dicts[dictsPrefix] && dicts[dictsPrefix][item.dictsPrefix + '_' + item.prop] || [])"
                :key="idx"
                :label="op.label"
                :value="item.value == 'label' ? op.label : op.value"
              ></el-option>
            </el-select>
            <!-- <span v-else-if="item.type == 'select_otherSys'">  {{ dicts }}</span> -->
            <!-- 日期 -->
            <el-date-picker
              v-else-if="item.type === 'date'"
              v-model="formList[item.prop]"
              type="date"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :format="item.format || dateformat || defaultFormat(item)"
              :value-format="item.format || dateformat || defaultFormat(item)"
            />
            <!-- 月份 -->
            <el-date-picker
              v-else-if="item.type === 'month'"
              v-model="formList[item.prop]"
              type="month"
              :style="{ width: itemWidth }"
              :clearable="!item.required"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :format="item.format || defaultFormat(item) || dateformat "
              :value-format="item.valueFormat || item.format || defaultFormat(item)|| dateformat "
            />
            <!-- 年份 -->
            <el-date-picker
              v-else-if="item.type === 'year'"
              v-model="formList[item.prop]"
              type="year"
              :style="{ width: itemWidth }"
              :clearable="!item.required"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :format="item.format || defaultFormat(item) || dateformat "
              :value-format="item.valueFormat || item.format || defaultFormat(item)|| dateformat "
            />
            <!-- 时间 -->
            <el-time-select
              v-else-if="item.type === 'time'"
              v-model="formList[item.prop]"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :picker-options="item.pickeroptions || pickerOptions"
            />
            <!-- 日期时间 -->
            <el-date-picker
              v-else-if="item.type === 'datetime'"
              v-model="formList[item.prop]"
              type="datetime"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :format="item.format || datetimeformat"
              :value-format="item.format || datetimeformat"
            />
            <!-- 日期时间范围 -->
            <el-date-picker
              v-else-if="item.type == 'datetimerange'"
              v-model="formList[item.prop]"
              type="datetimerange"
              range-separator="至"
              :clearable="!item.required"
              :start-placeholder="item.filterLabel?`${item.filterLabel[0]}时间`:'开始时间'"
              :end-placeholder="item.filterLabel?`${item.filterLabel[1]}时间`:'结束时间'"
              :style="{ width: '420px' }"
              :format="item.format || datetimeformat"
              :value-format="item.format || datetimeformat"
            />
            <!-- 月份范围 -->
            <el-date-picker
              v-else-if="item.type == 'monthrange'"
              v-model="formList[item.prop]"
              type="monthrange"
              range-separator="至"
              :clearable="!item.required"
              :start-placeholder="item.filterLabel?`${item.filterLabel[0]}时间`:'开始时间'"
              :end-placeholder="item.filterLabel?`${item.filterLabel[1]}时间`:'结束时间'"
              :style="{ width: '420px' }"
              :format="item.format || datetimeformat"
              :value-format="item.format || datetimeformat"
            />
            <!-- 日期范围 -->
            <el-date-picker
              v-else-if="item.type == 'daterange'"
              v-model="formList[item.prop]"
              type="daterange"
              range-separator="至"
              :clearable="!item.required"
              :style="{ width: item.filterWidth?item.filterWidth:'420px', }"
              :start-placeholder="item.filterLabel?`${item.filterLabel[0]}时间`:'开始时间'"
              :end-placeholder="item.filterLabel?`${item.filterLabel[1]}时间`:'结束时间'"
              :format="item.format || dateformat"
              :value-format="item.format || dateformat"
            />
            <!-- 日期时间范围----自定义 -->
            <el-date-picker
              v-else-if="item.type == 'datetimerange_custom'"
              v-model="formList[item.propShow]"
              type="datetimerange"
              range-separator="至"
              :start-placeholder="item.filterLabel?`${item.filterLabel[0]}时间`:'开始时间'"
              :end-placeholder="item.filterLabel?`${item.filterLabel[1]}时间`:'结束时间'"
              :format="item.format || datetimeformat"
              :style="{ width: '420px' }"
              :value-format="item.format || datetimeformat"
            />
            <!-- 输入框 -->
            <el-input
              v-else-if="item.type== 'otherParams'"
              v-model="formList[item.propShow]"
              :placeholder="'请输入' + (item.labelFilter?item.labelFilter:item.label)"
              clearable
              :style="{ width: item.type === 'input_col' ? '420px' : itemWidth }"
            />
            <!--树状下拉 -->
            <!-- <treeselect
              v-else-if="item.type == 'tree_select'"
              v-model="formList[item.prop]"
              class="treeSelect"
              :multiple="item.multiple"
              :normalizer="item.normalizer?item.normalizer:normalizer"
              :placeholder="'请选择' + (item.labelFilter?item.labelFilter:item.label)"
              :options="item.optionList"
              :is-default-expanded="true"
              :value-consists-of="item.valueConsistsOf? item.valueConsistsOf:'ALL'"
              :style="{
                width: item.filterWidth?item.filterWidth:'250px',
                display: 'inline-block'
              }"
              @select="item.needTreeOtherProp?handleTreeSelect($event,item):''"
              @input="item.needTreeOtherProp?handleDeSelect($event,item):''"
            >
            </treeselect> -->

            <!-- type （input_col： 筛选项跨列 -->
            <el-input
              v-else
              v-model="formList[item.prop]"
              :placeholder="'请输入' + (item.labelFilter?item.labelFilter:item.label)"
              clearable
              :style="{ width: item.type === 'input_col' ? '420px' : itemWidth }"
              @change="(data) => {$emit('input-change',data,item)}"
            />

          </el-form-item>
        </template>

        <el-form-item v-if="filterList.length > 0">
          <el-button
            type="primary"
            icon="el-icon-search"
            @click.native="handleQuery"
          >搜索</el-button>
          <el-button
            icon="el-icon-refresh"
            @click.native="handleReset"
          >重置</el-button>
        </el-form-item>
      </el-form>
    </transition>
    <!-- <div v-if="sortFilterList.length > 3 " class="box" @click="handleShowMore">
      <p class="more">
        <span class="lf" />
        <span>{{ isFold?'展开':'折叠' }}查询条件<i :class="!isFold? 'el-icon-d-arrow-left' : 'el-icon-d-arrow-right'" /></span>
        <span class="rg" />
      </p>
    </div> -->
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
// import Treeselect from '@riophae/vue-treeselect'
// import PdAreaSelect from '@/components/pingdao/PdAreaSelect'
// import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  name: 'PdFilter',
  // components: { Treeselect },
  props: {
    // 枚举字典
    dictsPrefix: {
      type: String,
      default: () => ''
    },
    // 筛选项联动的api接口
    chainData: {
      type: Array,
      default: () => []
    },
    // 筛选列表
    filterList: {
      required: true
    },
    size: {
      type: String,
      default: 'mini'
    },
    labelWidth: {
      type: String,
      default: '110px'
    },
    filterable: {
      type: Boolean,
      default: false
    },
    remote: {
      type: Boolean,
      default: false
    },
    multiple: {
      type: Boolean,
      default: false
    },
    itemWidth: {
      type: String,
      default: '150px'
    },

    dateformat: {
      type: String,
      default: 'yyyy-MM-dd'
    },
    datetimeformat: {
      type: String,
      default: 'yyyy-MM-dd HH:mm:ss'
    },
    pickerOptions: {
      type: Object,
      default: () => {
        return {
          start: '08:30',
          step: '00:15',
          end: '18:30'
        }
      }
    },
    op: {
      type: Object,
      default: () => {}
    },
    chainPropArr: {
      type: Array,
      default: () => []
    },
    newBus: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      isFold: false, // 控制查询条件展开还是折叠
      areaPropList: [],
      areaLabelList: [],
      formList: {},
      curItem: {},
      remoteProps: [], // 保存模糊搜索下拉框对应的项
      areaSetObj: {
        area_country: 0,
        area_province: 1,
        area_city: 2,
        area_region: 3
      },
      $bus: ''

    }
  },
  computed: {
    ...mapGetters(['dicts']),
    // 筛选项根据filterSort排序
    sortFilterList() {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const sortList = this.filterList.sort(this.compareFn)
      // 筛选模糊搜索对应的项
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.remoteProps = sortList.filter((it) => it.remote)
      return sortList
    },
    showFilterItem() {
      return function(item) {
        return !(item.isFilterShow === false || (item.isFilterShow && item.isFilterShow() === false)) && Object.keys(this.areaSetObj).indexOf(item.type) === -1
      }
    },
    defaultFormat() {
      return function(item) {
        if (item.type == 'month') {
          return 'yyyy-MM'
        }
        if (item.type == 'year') {
          return 'yyyy'
        }
        return 'yyyy-MM-dd'
      }
    }

  },
  watch: {
  },
  created() {
    this.$bus = this.newBus || this.bus
    this.setDefaultValue()
    // this.$store.dispatch('common/setFormFilter', this.formList)
  },
  activated() {
    // 保存筛选项
    // this.$store.dispatch('common/setFormFilter', this.formList)
  },
  methods: {
    // 此方法用于树状搜索时，后端需要属性不是树的id而是其他的属性如：部门名字搜索（后端因为导入没有id，所以没有办法通过id搜索）
    /**
     *  {
            label: '部门',
            propShow: 'departName',
            type: 'tree_select',
            //需要树状内部搜索的属性名称--和normalizer的属性需一一对应
            needTreeOtherProp:'departName',
            //其他搜索的属性名称--传递给后端的属性名称
            otherPropFilter:'departName',
            prop: 'departId',
            filterSort: 1,
            width: '150px',
            optionList: []
          },
     */
    selectOptionValue(item, opt) {
      if (item.valueProp) {
        return opt[item.valueProp]
      } else {
        return item.value == 'label' ? opt.label : opt.value
      }
    },

    handleTreeSelect(node, item) {
      this.formList[item.otherPropFilter] = node[item.needTreeOtherProp]
    },
    handleDeSelect(value, item) {
      if (!value && item.needTreeOtherProp) {
        this.formList[item.otherPropFilter] = undefined
      }
    },
    // 树状搜索的部门默认参数
    normalizer(node) {
      return {
        id: node.departId,
        label: node.departName,
        children: node.list
      }
    },
    // 省市区组件选择处理 将所需的id加入到搜索list里面
    handleAreaChange(data) {
      this.formList = Object.assign({}, this.formList, data)
    },
    // 将index页面传入的省市区数据格式化为组件所需
    getAreaFilterData() {
      this.filterList.map(item => {
        if (item.type && item.type.split('_') && item.type.split('_')[0] === 'area') {
          this.areaPropList.push(item)
        }
      })
    },
    // 存在场景： 在列表有额外的组件点击进行搜索（如点击部门进行搜索）
    clickToSearch(data) {
      Object.keys(data).forEach(item => {
        this.$set(this.formList, item, data[item])
      })
      this.handleQuery()
    },
    setDefaultValue() {
      if (this.op && JSON.stringify(this.op.params) !== '{}') {
        Object.keys(this.op.params).forEach((key) => {
          this.$set(this.formList, key, this.op.params[key])
        })
        // 保存筛选项
        // this.$store.dispatch('common/setFormFilter', this.formList)
      }
      this.getAreaFilterData()
    },

    // 联动下拉框的change方法
    chainSelectCahnge(pid, item) {
      if (!pid) {
        // 清空默认值时
        this.$set(this.formList, item.prop, pid)
        if (this.op && JSON.stringify(this.op.params) !== '{}') {
          // 默认参数中包含时删除项时
          // if (this.op.params.hasOwnProperty(item.prop)) {
          //   this.$bus.$emit('resetOpParams', item.prop, pid)
          // }
        }
        // 当前下拉框为远程搜索类型时，清空初始化下拉框数据
        if (item.remote) {
          this.$emit('remoteMethod', item)
        }
      }
      if (item.selectType === 'chainSelect') {
        this.$emit('chainSelectChange', pid, item)
      }
    },
    focus(item) {
      this.curItem = item
    },
    remoteMethod(key) {
      this.$emit('remoteMethod', this.curItem, key)
    },
    // 筛选搜索
    handleQuery() {
      this.$emit('queryChange', this.formList)
      // 处理空属性
      for (const i in this.formList) {
        if (!this.formList[i] && this.formList[i] !== false) {
          delete this.formList[i]
        }
      }
      // 保存筛选项
      // this.$store.dispatch('common/setFormFilter', this.formList)
      this.$bus.$emit('filter', { ...this.formList, pageNum: 1 })
    },
    // 根据当前搜索条件刷新页面
    refresh() { this.$bus.$emit('filter', { ...this.formList }) },
    // 获取当前搜索条件
    getCurrentFilter() { return this.formList },
    // 筛选重置
    handleReset() {
      this.$emit('queryChange', this.formList)
      // 表单重置
      this.resetForm('formList')

      // 重置时将联动下拉框的列表值也清空
      const dictsObj = this.dicts[this.dictsPrefix]
      this.chainPropArr.slice(1).map((it) => {
        delete dictsObj[`${this.dictsPrefix}_${it}`]
      })
      // this.$store.dispatch('dicts/mergeDicts', { type: 2, dictsObj })

      if (this.op && JSON.stringify(this.op.params) !== '{}') {
        this.formList = {
          ...this.op.params
        }
      } else {
        this.formList = {}
      }
      // 按钮重置
      this.$bus.$emit('resetBtn')

      // 重置默认项
      this.setDefaultValue()

      // 重置模糊搜索下拉框的列表值
      this.remoteProps.map((it) => {
        this.$emit('remoteMethod', it)
      })

      // 保存筛选项
      // this.$store.dispatch('common/setFormFilter', this.formList)
      // 重置table
      this.$bus.$emit('filter', this.formList)

      this.$emit('resetFilter')
    },
    handleShowMore() {
      this.isFold = !this.isFold
    },
    enter() {
      this.$bus.$emit('resetHeight')
    },
    afterLeave() {
      this.$bus.$emit('resetHeight')
    },
    compareFn(a, b) {
      return Number(a.filterSort) - Number(b.filterSort)
    }
  }
}
</script>

<style scoped lang="scss">
.treeSelect  /deep/ .vue-treeselect__menu {
  max-width: 350px;
  overflow:auto;

}
.treeSelect  /deep/ .vue-treeselect__label {
 overflow:initial;
}
 /* 查询条件过渡动画 */
 .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter-active {
  transition: opacity 1s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
