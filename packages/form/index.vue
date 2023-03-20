<!--
 * @Description:
 * @StartVersion: 2.0
 * @LastVersion: 2.0
 * @Autor: gaoyue
 * @Date: 2022-10-19 10:55:42
 * @LastEditTime: 2023-03-20 16:15:28
-->
<template>
  <!-- 单行文本 -->
  <el-form-item v-if="type=='input'" :label="label" class="item-input" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input v-model="valueData" :disabled="disabled" :maxlength="maxlength?maxlength:100" :show-word-limit="!!maxlength" :placeholder="'请输入'+label" :style="{width: width?width:''}" clearable @change="handleInputChange"></el-input>
  </el-form-item>
  <el-form-item v-else-if="type=='input-button'" :label="label" class="item-input" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input v-model="valueData" :disabled="true" placeholder="暂无">
      <el-button slot="append" icon="el-icon-search" :style="!disabled?{backgroundColor:'#2F8DFB',color: '#fff'}:{}" @click="$emit('click')"></el-button>
    </el-input>
  </el-form-item>
  <!-- 多行文本 -->
  <el-form-item v-else-if="type=='textarea'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input v-model="valueData" :disabled="disabled" type="textarea" :maxlength="maxlength?maxlength:100" :show-word-limit="!!maxlength" :placeholder="'请输入'+label" :style="{width: '100%'}" @change="handleInputChange"></el-input>
  </el-form-item>
  <!-- 电话号码 -->
  <el-form-item v-else-if="type=='tel'" class="item-input" :label="label" :prop="prop" :rules="[{required:required, validator: validatePhone, trigger: 'blur' }]" :label-width="labelWidth">
    <el-input
      v-model="valueData"
      type="number"
      :maxlength="11"
      :disabled="disabled"
      show-word-limit
      :placeholder="'请输入'+label"
      :style="{width: width?width:''}"
      @change="handleInputChange"
    ></el-input>
  </el-form-item>
  <!-- 邮箱 -->
  <el-form-item v-else-if="type=='email'" class="item-input" :label="label" :prop="prop" :rules="[{required:required, validator: validateEmail, trigger: 'blur' }]" :label-width="labelWidth">
    <el-input
      v-model="valueData"
      :disabled="disabled"
      show-word-limit
      :placeholder="'请输入'+label"
      :style="{width: width?width:''}"
      @change="handleInputChange"
    />
  </el-form-item>
  <!-- 两位小数 -->
  <el-form-item v-else-if="type=='decimal' || type=='chinese-decimal'" class="item-input-number" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input-number
      v-model="valueData"
      controls-position="right"
      :disabled="disabled"
      :precision="precision"
      :min="0"
      :max="99999999"
      @change="handleInputNumberChange"
    ></el-input-number>
    <span v-if="type=='chinese-decimal'" style="font-size:12px">{{ getChineseNum() ||'暂无' }}</span>
  </el-form-item>
  <!-- 整数 -->
  <!-- <el-form-item v-else-if="type=='integer' || type=='chinese-integer'" class="item-input-number" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input-number
      v-model="valueData"
      controls-position="right"
      :precision="0"
      :min="0"
      :disabled="disabled"
      :max="99999999"
      @change="handleInputNumberChange"
    > </el-input-number>
    <span v-if="type == 'chinese-integer'" style="font-size:12px">{{ getChineseNum() ||'暂无' }}</span>
  </el-form-item> -->
  <!-- 起始日期 -->
  <el-form-item v-else-if="type=='daterange'" ref="daterangeRef" :label="label" :prop="startProp?startProp:prop" :rules="formRules" :label-width="labelWidth">
    <el-date-picker
      v-model="valueData"
      type="daterange"
      :style="{width: width?width:''}"
      :disabled="disabled"
      range-separator="至"
      start-placeholder="开始日期"
      value-format="yyyy-MM-dd"
      end-placeholder="结束日期"
      @change="handleDateChange"
    >
    </el-date-picker>
  </el-form-item>
  <!-- 日期 -->
  <el-form-item v-else-if="type=='date' || type=='month' || type=='year'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-date-picker
      v-model="valueData"
      :type="type"
      :disabled="disabled"
      :style="{width: width?width:''}"
      value-format="yyyy-MM-dd"
      placeholder="选择日期"
      @change="handleDateChange"
    >
    </el-date-picker>
  </el-form-item>

  <el-form-item v-else-if="type=='select'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-select v-model="valueData" :disabled="disabled" :placeholder="'请输入'+label" clearable :multiple="multiple" :style="{width: width?width:''}" cl @change="handleSelectChange">
      <el-option
        v-for="(item, index) in options"
        :key="index"
        :label="item[labelProp]"
        :value="optionValue(item[valueProp])"
        :disabled="item[disabledProp]"
      />
    </el-select>
  </el-form-item>
  <!-- 远程下拉 -->
  <el-form-item v-else-if="type=='remote_select'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-select
      v-model="valueData"
      :disabled="disabled"
      :placeholder="'请输入'+label"
      clearable
      filterable
      remote
      :style="{width: width?width:''}"
      :remote-method="querySearchAsync"
      :loading="loading"
    >
      <el-option
        v-for="(item, index) in remoteOptions"
        :key="index"
        :label="item[labelProp]"
        :value="optionValue(item[valueProp])"
        :disabled="item[disabledProp]"
      />
    </el-select>
  </el-form-item>
  <el-form-item v-else-if="type=='radio'" ref="radioRef" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-radio-group v-model="valueData" :disabled="disabled" @change="handleSelectChange">
      <el-radio
        v-for="(item, index) in options"
        :key="index"
        style="line-height:30px"
        :label="item[valueProp]"
        :disabled="item[disabledProp]"
      >{{ item[labelProp] }}</el-radio>
    </el-radio-group>
  </el-form-item>
  <el-form-item v-else-if="type=='check'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-checkbox-group v-model="valueData" :disabled="disabled" @change="handleSelectChange">
      <el-checkbox
        v-for="(item, index) in options"
        :key="index"
        :label="optionValue(item[valueProp])"
      >{{ item.label }}</el-checkbox>
    </el-checkbox-group>
  </el-form-item>

  <el-form-item v-else-if="type=='input-number'" :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <slot name="header"></slot>
    <el-input-number
      v-model="valueData"
      :precision="precision"
      :style="{width: width?width:'150px'}"
      controls-position="right"
      :min="0"
      :disabled="disabled"
      :max="max"
      @change="handleInputChange"
    ></el-input-number>
    <slot name="footer"></slot>
    <slot></slot>
  </el-form-item>

  <!-- 通用的单选弹框 -->
  <el-form-item v-else-if="type == 'single_select'&& !mutiple" :rules="formRules" :label-width="labelWidth" :label="label">
    <component
      :is="tag"
      v-model="valueData"
      :default-filter="defaultParams"
      :disabled="disabled"
      :api="api"
      :width="width"
      :label="label"
      :show-prop="op.showProp"
      @change="handleSingleDialogSelectChange"
    ></component>
  </el-form-item>
  <el-form-item v-else :label="label" :prop="prop" :rules="formRules" :label-width="labelWidth">
    <el-input v-model="valueData" :disabled="disabled" :maxlength="maxlength?maxlength:100" :show-word-limit="!!maxlength" :placeholder="'请输入'+label" :style="{width: width?width:''}" clearable @change="handleInputChange"></el-input>
  </el-form-item>
</template>
<script>
import { getChineseNumber, getArabNumber } from '../utils/common.js'
export default {
  components: { },
  props: {
    value: {
      type: [String, Number, Array, Object, Boolean],
      default: () => ''
    },
    // 选择通用组件的标签
    tag: {
      type: String,
      default: () => ''
    },
    type: {
      type: String,
      default: () => ''
    },
    label: {
      type: String,
      default: () => ''
    },
    api: {
      type: [String, Function],
      default: () => ''
    },
    defaultParams: {
      type: [Object, String],
      default: () => {}
    },
    // 其他的组件的一些特定参数
    op: {
      type: [Object, Function],
      default: () => { return {} }
    },
    formData: {
      type: Object,
      default: () => {}
    },
    precision: {
      type: Number,
      default: () => 2
    },
    prop: {
      type: String,
      default: () => ''
    },
    propShow: {
      type: String,
      default: () => ''
    },
    mutiple: {
      type: Boolean,
      default: () => false
    },
    disabled: {
      type: Boolean,
      default: () => false
    },
    open: {
      type: Boolean,
      default: () => false
    },
    selectionList: {
      type: Array,
      default: () => []
    },
    // 选择员工/部门/职位后，是否显示已选择名称
    namsBoxShow: {
      type: Boolean,
      default: () => false
    },
    // 选择员工/部门/职位后，后端传的名称字符串数组
    selectNames: {
      type: Array,
      default: () => []
    },
    options: {
      type: Array,
      default: () => []
    },
    required: {
      type: Boolean,
      default: () => false
    },
    multiple: {
      type: Boolean,
      default: () => false
    },
    labelWidth: {
      type: [String, Number],
      default: () => ''
    },
    width: {
      type: [String, Number],
      default: () => ''
    },
    labelProp: {
      type: [String],
      default: () => 'label'
    },
    valueProp: {
      type: [String],
      default: () => 'value'
    },
    disabledProp: {
      type: [String],
      default: () => 'disabled'
    },
    // 时间范围类型需要
    startProp: {
      type: [String],
      default: () => ''
    },
    endProp: {
      type: [String],
      default: () => ''
    },
    // 可输入的最大长度
    maxlength: {
      type: Number,
      default: () => 0
    },
    // 数字可输入的最大值
    max: {
      type: Number,
      default: () => 999999999
    },
    // 数字可输入的最小值
    min: {
      type: Number,
      default: () => 0
    },
    // 下拉数组value类型处理 当出现数组value是数字但是后端字段返回时字符串清空
    isString: {
      type: Boolean,
      default: () => false
    },
    isNumber: {
      type: Boolean,
      default: () => false
    },
    // 远程搜索的入参
    remoteProp: {
      type: String,
      default: () => ''
    },
    // 是否显示多余的信息
    otherInfoShow: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      valueData: '',
      dialogOpen: false,
      loading: false,
      empOp: {
        employeeCheckList: [],
        multiple: true,
        needStatusFilter: false
      },
      remoteOptions: [],
      chineseNum: ''
    }
  },
  computed: {
    optionValue() {
      return function(value) {
        if (this.isString) {
          return String(value)
        }
        if (this.isNumber) {
          return Number(value)
        }
        return value
      }
    },
    formRules() {
      let triggerType = 'blur'
      const changeType = ['select', 'daterange', 'company']
      const submitType = ['radio']
      const blurType = ['decimal', 'input', 'chinese-decimal']
      if (changeType.includes(this.type)) {
        triggerType = ['change', 'submit']
      } else if (submitType.includes(this.type)) {
        triggerType = ['change', 'submit']
      } else if (blurType.includes(this.type)) {
        triggerType = ['blur', 'submit']
      } else {
        triggerType = ['blur', 'change', 'submit']
      }
      const messageType = blurType.includes(this.type) ? '输入' : '选择'
      return [
        { required: this.required, message: `请${messageType}${this.label}`, trigger: triggerType }
      ]
    },
    empNames() {
      const arr = []
      if (this.selectNames && this.selectNames.length > 0) {
        return this.selectNames.join(';')
      }
      if (!this.selectionList || this.selectionList.length == 0) {
        return
      }
      this.selectionList.forEach(item => { arr.push(item.name) })
      return arr.join(';')
    },
    deptNames() {
      const arr = []
      if (this.selectNames && this.selectNames.length > 0) {
        return this.selectNames.join(';')
      }
      if (!this.selectionList || this.selectionList.length == 0) {
        return
      }
      this.selectionList.forEach(item => { arr.push(item.departName) })
      return arr.join(';')
    }
  },
  watch: {
    value: {
      deep: true,
      handler(val) {
        this.getModelValue()
      }
    },
    open(val) {
      if (!val) return
      this.handleDialogOpen()
    }
  },
  created() {
    this.getModelValue()
  },
  methods: {

    handleInputNumberChange() {
      if (this.type == 'chinese-decimal') {
        this.chineseNum = getChineseNumber(this.valueData)
        this.$emit('input', this.chineseNum)
        console.log('--->chineseNum', this.chineseNum)

        this.$emit('change', this.chineseNum)
      } else {
        this.$emit('input', this.valueData)
        this.$emit('change', this.valueData)
      }
    },
    getChineseNum() {
      this.chineseNum = getChineseNumber(this.valueData)
      return this.chineseNum
    },
    getModelValue() {
      const singleSelectDialog = ['company', 'single_select', 'ehr']
      if (this.type == 'chinese-decimal' || this.type == 'chinese-integer') {
        this.valueData = getArabNumber(this.value)
      } else if (this.type == 'daterange' && this.startProp) {
        this.valueData = this.formData[this.startProp] ? [this.formData[this.startProp], this.formData[this.endProp]] : []
      } else if (this.type == 'company' && this.mutiple) {
        this.valueData = this.value
      } else if (singleSelectDialog.includes(this.type)) {
        this.valueData = this.propShow ? this.formData[this.propShow] : this.value
      } else {
        this.valueData = this.value
      }
    },
    validatePhone(rule, value, callback) {
      if (!this.required && !this.valueData) callback()
      console.log('--->value', value, this.valueData)

      if (this.required && !this.valueData) {
        callback(new Error('请输入手机号码'))
      } else if (!/^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(this.valueData)) {
        callback(new Error('请输入正确的手机号码'))
      } else {
        callback()
      }
    },
    validateEmail(rule, value, callback) {
      if (!this.required && !this.valueData) {
        callback()
      } else if (this.required && !this.valueData) {
        callback(new Error('请输入邮箱'))
      } else if (!/^([a-zA-Z]|[0-9])(\w|\-)+@([a-zA-Z0-9]|\-)+\.([a-zA-Z]{2,4})$/.test(value.trim())) {
        callback(new Error('请输入正确的邮箱'))
      } else {
        callback()
      }
    },
    handleInputChange() {
      this.$emit('input', this.valueData)
      this.$emit('change', this.valueData)
    },
    handleSelectChange(value) {
      this.$emit('input', value)
      if (this.type == 'radio') {
        this.$refs['radioRef'].$emit('el.form.change')
      }
      if (!this.multiple) {
        const obj = this.options.find(item => item[this.valueProp] == value)
        this.propShow ? this.formData[this.propShow] = obj[this.labelProp] : '' // 如果有propShow则formData对象必须存在，自动把名称赋给formData中
        this.$emit('change', obj, value)
        return
      }
      this.$emit('change', value)
    },
    handleDateChange(val) {
      if (this.type == 'daterange' && this.startProp) {
        this.$set(this.formData, this.startProp, val[0])
        this.$set(this.formData, this.endProp, val[1])
        this.$emit('change', val)
      } else {
        this.$emit('input', val)
        this.$emit('change', val)
      }
    },
    handleDialogOpen() {
      if (this.type == 'empSelectTable' && this.mutiple) {
        this.$refs.empSelectTable.chooseEmployee()
        this.empOp.employeeCheckList = this.valueData || this.selectionList
      } else {
        this.dialogOpen = true
      }
    },
    //   远程搜索
    querySearchAsync(e) {
      this.loading = true
      const params = { ...this.defaultParams }
      params[this.remoteProp] = e
      this.api(params).then(res => {
        this.remoteOptions = res.data || []
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>
<style scoped>
.names-box {
  border: 1px solid #eee;
  padding: 10px;
  width: 350px;
  font-size: 12px;
  min-height: 100px;
  max-height: 200px;
  overflow: auto;
}
</style>
