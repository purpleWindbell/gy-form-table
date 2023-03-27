<template>
  <div>
    <gy-filter ref="gyFilter" :dicts-prefix="dictsPrefix" :filter-list="filterList" :op="tableOp" :new-bus="pageBus" @queryChange="handleFilterChange" />
    <gy-buttons :data-list="btnList" :class="{ 'is-fixed': isFixed }" :new-bus="pageBus" v-on="$listeners" />
    <gy-table :dicts-prefix="dictsPrefix" :op="tableOp" :new-bus="pageBus" @getRow="getRow" v-on="$listeners" @getSelection="getSelection" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getFilterList } from '../utils/common'
import { generateNewBus } from './bus'
export default {
  name: 'GyPage',
  props: {
    dictsPrefix: {
      type: String,
      default: 'ehr'
    },
    btnList: {
      type: Array,
      default: () => []
    },
    tableOp: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      // 是否定位显示中间按钮区
      isFixed: false,
      //* 枚举字典前缀 枚举字典在TeaCore-系统管理-字典管理中添加 字典命名规则  前缀_字段名
      //   dictsPrefix: 'ehr',
      dialogTitle: '',
      // 筛选项组件初始参数
      filterList: [],
      formData: {},
      pageBus: generateNewBus()
    }
  },
  computed: {
    // vuex 枚举字典
    ...mapGetters(['dicts'])
  },
  watch: {
    tableOp: {
      immediate: true,
      handler(val) {
        this.filterList = getFilterList(val.tableFormat)
      }
    }
  },
  created() {},
  methods: {
    // 表格多选操作
    getSelection(val) {
      this.$parent.selectionList = val
    },
    // 表格单选操作 || 点击行
    getRow(row) {
      this.$parent.rowData = row
    },
    getStatue(row) { row },
    refresh() {
      this.$refs.gyFilter.refresh()
    },
    getCurrentFilter() {
      return this.$refs.gyFilter.getCurrentFilter()
    },
    handleFilterChange() {
      this.$parent.currentFilter = this.getCurrentFilter()
    }
  }
}
</script>
<style></style>
