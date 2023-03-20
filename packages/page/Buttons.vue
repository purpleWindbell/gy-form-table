<template>
  <div class="pd-btn " style="margin-bottom:20px">
    <template v-for="(item, index) in dataList">
      <el-tooltip :key="index" class="item" effect="dark" :disabled="!item.tooltipInfo" :content="item.tooltipInfo?item.tooltipInfo.msg:''" placement="top-start">
        <el-button
          v-if="item.permissionCode"
          v-hasPermi="item.permissionCode"
          size="mini"
          :disabled="item.disabled"
          :type="type[item.prop] || defaultType"
          @click.native="handleClick(item)"
        >{{ item.label }}</el-button>
        <el-button
          v-else
          size="mini"
          :disabled="item.disabled"
          :type="type[item.prop] || defaultType"
          @click.native="handleClick(item)"
        >{{ item.label }}</el-button>
      </el-tooltip>

    </template>
  </div>
</template>
<script>
export default {
  name: 'PdBtn',
  props: {
    dataList: {
      required: true
    },
    defaultType: {
      type: String,
      default: 'primary'
    },
    newBus: {
      type: Object,
      default: () => {}
    }
  },

  data() {
    return {
      type: {
        add: 'primary',
        edit: 'primary',
        show: 'primary',
        export: 'primary'
      },
      formList: {},
      btnGroupStatus: undefined,
      $bus: ''
    }
  },

  created() {
    this.$bus = this.newBus || this.bus
    this.setBtnStatus()
    // 监听按钮组件重置；
    this.$bus.$on('changeBtnStatue', (btnGroupStatus) => {
      // 设置按钮组状态
      this.setBtnStatus(btnGroupStatus)
    })
    // 监听按钮组件重置
    this.$bus.$on('resetBtn', (msg) => {
      // 设置按钮组状态
      this.setBtnStatus()
    })
  },
  activated(val) {
    this.$bus.$off('changeBtnStatue')
    this.$bus.$off('resetBtn')
    // 监听按钮组件重置；
    this.$bus.$on('changeBtnStatue', (btnGroupStatus) => {
      // 设置按钮组状态
      this.setBtnStatus(btnGroupStatus)
    })
    // 监听按钮组件重置
    this.$bus.$on('resetBtn', (msg) => {
      // 设置按钮组状态
      this.setBtnStatus()
    })
  },
  deactivated() {
    this.$bus.$off('changeBtnStatue')
    this.$bus.$off('resetBtn')
  },
  methods: {
    setBtnStatus(val = '') {
      for (const item of this.dataList) {
        if (item.canClick.includes('all')) {
          // 永远可点击
          this.$set(item, 'disabled', false)
        } else if (item.canClick.includes('never')) {
          // 永远不可点击
          this.$set(item, 'disabled', 'disabled')
        } else {
          // 基于传参判断是否可点击.
          // eslint-disable-next-line eqeqeq
          if (item.canClick.find((i) => i == val)) {
            this.$set(item, 'disabled', false)
          } else {
            this.$set(item, 'disabled', 'disabled')
          }
        }
      }
    },
    handleClick(item) {
      this.$emit('handle', item)
    }
  }
}
</script>
