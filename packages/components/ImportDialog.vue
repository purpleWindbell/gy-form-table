<!--
 * @params:
-->
<!--
 * @params:
-->
<template>
  <div>
    <el-dialog v-bind="$attrs" title="导入" v-on="$listeners">
      <upload-file></upload-file>
      <el-row class="m-b-10 f-s-12">
        请先下载《<el-link type="primary" @click="download">批量导入模板</el-link>》，并按照模板中的格式填写完整后再上传。
      </el-row>
      <el-row v-if="op.explainList && op.explainList.length >0">
        <el-row class="m-b-10 f-s-12">
          模板说明：
        </el-row>
        <div v-for="(item,index) in op.explainList" :key="index" class="m-b-10 f-s-12">{{ item }}</div>
      </el-row>
      <div slot="footer">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="handelConfirm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
// import { downloadFileByUrl } from '@/utils/common'
import UploadFile from './UploadFile.vue'
// import { downloadModel, importSkills } from '@/api/ehr/schedule/systemSetting/skillSchedule'
export default {
  components: { UploadFile },
  props: {
    op: {
      type: Object,
      default: () => {}
    },
    label: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      formData: [],
      batchExportProp: {
        title: '上传导入文件',
        errorMsgList: [],
        fileSize: {
          application: 1024 * 1024 * 15
        }
      }
    }
  },
  created() {
  },
  methods: {
    download() {
      const filename = '导入模板-' + (this.label || this.op.label)
      // if (this.op.downType == 'url') {
      //   downloadFileByUrl(this.op.url, filename + '.xlsx')
      //   return
      // }
      this.downloadTemplate({
        api: this.op.downloadApi,
        params: {},
        info: {
          filename: filename
        }
      })
    },
    close() {
      this.$emit('update:visible', false)
    },
    handelConfirm() {
      if (this.formData instanceof Array) {
        this.$message.warning('请先导入文件')
        return
      }
      const loading = this.$loading({
        lock: true,
        text: '正在导入...',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
      if (this.op.params) {
        Object.keys(this.op.params).forEach(item => {
          this.formData.append(item, this.op.params[item])
        })
      }
      this.op.importApi(this.formData).then(res => {
        if (res.data && res.data.error && res.data.error.length > 0) {
          this.batchExportProp.errorMsgList = res.data.error
        } else {
          this.$emit('importConfirm', res.data)
          this.resetForm()
          if (!this.op.noPageFilter) {
            this.bus.$emit('filter')
            this.bus.$emit('resetBtn')
            this.$message.success('保存成功')
          }
        }
      }).finally(() => {
        loading.close()
      })
    },
    resetForm() {
      this.$emit('cancel')
    },
    getFileData(data) {
      this.formData = data
    }
  }
}
</script>
