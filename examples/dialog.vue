<!--
 * @Description:
 * @StartVersion: 2.0
 * @LastVersion: 2.0
 * @Autor: gaoyue
 * @Date: 2023-03-13 20:09:48
 * @LastEditTime: 2023-03-20 16:19:46
-->
<template>
  <div>
    <el-dialog v-bind="$attrs" :title="op.title" v-on="$listeners">
      <el-form ref="elForm" :model="formData" :rules="rules" size="mini" label-width="100px">
        <GyForm v-model="formData.input" label="输入框" required prop="input"></GyForm>
        <GyForm v-model="formData.select" type="select" prop="select" required :options="selectOptions" label="下拉单选"></GyForm>
        <GyForm v-model="formData.radio" type="radio" prop="radio" required :options="selectOptions" label="单选框"></GyForm>
        <GyForm v-model="formData.check" type="check" prop="check" required :options="selectOptions" label="多选框"></GyForm>
        <GyForm v-model="formData.email" type="email" prop="email" required label="邮箱"></GyForm>
        <GyForm v-model="formData.tel" type="tel" prop="tel" required label="电话号码"></GyForm>
        <GyForm v-model="formData.textarea" prop="textarea" required type="textarea" label="多行文本"></GyForm>
        <GyForm v-model="formData.daterange" prop="daterange" required type="daterange" label="日期范围"></GyForm>
        <GyForm v-model="formData.decimal" prop="decimal" required type="decimal" label="数字"></GyForm>
        <GyForm v-model="formData.chineseDecimal" prop="chineseDecimal" required type="chinese-decimal" label="中文数字"></GyForm>
        <GyForm v-model="formData.year" prop="year" required type="year" label="年份"></GyForm>
        <GyForm v-model="formData.month" prop="month" required type="month" label="月份"></GyForm>
        <GyForm v-model="formData.date" prop="date" required type="date" label="日期"></GyForm>
        <GyForm v-model="formData.inputNumber" prop="inputNumber" required type="input-number" label="输入数字">
          <template #header> 头部</template>
          <template #footer> 尾部</template>
        </Gyform>
      </el-form>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
export default {
  props: {
    op: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      rules: { classifyName: [{ required: true, message: '请输入分类名称', trigger: 'blur' }] },
      formData: { check: [], daterange: [] },
      selectOptions: [
        { label: '选项1', value: '1' },
        { label: '选项2', value: '2' }
      ]
    }
  },
  created() {
    if (this.op.type == 'edit') {
      this.formData = { ...this.op.rowData }
    }
  },
  methods: {
    // 点击保存
    handleSave() {
      this.$refs.elForm.validate(valid => {
        if (!valid) return
        this.op.api(this.formData).then(() => {
          this.$message.success('保存成功')
          this.resetForm(true)
        })
      })
    },
    resetForm(isRefresh) {
      this.$emit('cancel')
      if (isRefresh === true) {
        this.bus.$emit('filter', this.formFilter)
        this.bus.$emit('resetBtn')
      }
    },
    close() {
      this.$emit('update:visible', false)
    }
  }
}
</script>
