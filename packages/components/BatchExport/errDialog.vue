<!--
 * @Description:
 * @StartVersion: 2.0
 * @LastVersion: 2.0
 * @Autor: gaoyue
 * @Date: 2022-04-14 19:29:21
 * @LastEditTime: 2022-11-30 18:20:30
-->
<template>
  <div>
    <el-dialog
      title="错误提示"
      width="50%"
      :append-to-body="true"
      :visible.sync="open"
      :close-on-click-modal="false"
      @close="close"
    >
      <div v-for="(item,index) in formList" :key="index">
        <div class="m-b-10 f-s-12">{{ item }}</div>
      </div>
      <el-button style="margin-left: 90%" type="primary" size="mini" @click="close">确定</el-button>
    </el-dialog>
  </div>
</template>

<script>
export default {
  props: {
    open: {
      type: Boolean,
      default: false
    },
    formList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
    }
  },
  watch: {
    open(val) {
    }
  },
  created() {
  },
  methods: {
    close() {
      this.$emit('closeErr')
    }
  }
}
</script>
