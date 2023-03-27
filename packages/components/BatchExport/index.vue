<template>
  <div>
    <el-row :gutter="15">
      <el-form ref="elForm" :model="formData" class="m-t-20 p-l-20">
        <el-row>
          <el-col :span="24">
            <!-- :api-upload="true" -->
            <el-form-item :label="prop.title">
              <UploadFile
                ref="upload"
                v-model="fileList"
                :file-accept="fileAccept"
                :file-size="fileSize"
                :is-limit="isLimit"
                :limit-num="limitNum"
                :button-text="'上传附件'"
                class="upload-button-style"
              >
              </UploadFile>
            </el-form-item>
          </el-col>
        </el-row>
        <slot></slot>
      </el-form>
    </el-row>
    <err-dialog :open="errorOpen" :form-list="errorFormList" @closeErr="closeErrDialog"></err-dialog>
  </div>
</template>
<script>

import errDialog from './errDialog'
import UploadFile from '@/components/UploadFile/index'
import { mapGetters } from 'vuex'
export default {
  components: {
    UploadFile,
    errDialog
  },
  inheritAttrs: false,
  props: {
    prop: {
      type: Object,
      default: () => {
        return {
          title: '添加导入文件'
        }
      }
    }
  },
  data() {
    return {
      dictsPrefix: 'ehrCoupon',
      formData: {},
      errorFormList: [],
      errorOpen: false,
      fileList: [],
      isLimit: true,
      limitNum: 1,
      fileAccept: 'application/xls,application/xlsx',
      fileSize: {
        application: 1024 * 1024 * 50
      }
    }
  },
  computed: {
    ...mapGetters(['dicts'])
  },
  watch: {
    fileList: {
      deep: true,
      handler(val) {
        this.gitFileData(val)
      }
    },

    prop: {
      deep: true,
      handler(val) {
        if (val.errorMsgList && val.errorMsgList.length > 0) {
          this.errorOpen = true
          this.errorFormList = val.errorMsgList
        } else {
          this.errorOpen = false
        }
        if (val.fileSize) {
          this.fileSize = val.fileSize
        }
      }
    }
  },
  created() {
    if (this.prop.fileSize) {
      this.fileSize = this.prop.fileSize
    }
  },
  mounted() {},
  methods: {
    deleteFile() {
      this.$refs.upload.removeAllFile()
      this.$emit('getData', [])
    },
    // 关闭错误提示弹框
    closeErrDialog() {
      this.errorOpen = false
    },
    // 拿到上传的文件信息
    gitFileData(f) {
      if (f.length > 0) {
        const formdata = new FormData()
        formdata.append('file', f[0])
        this.$emit('getData', formdata)
      } else {
        this.$emit('getData', [])
      }
    }

    // 暂时没有用，目前使用的导入流程是：前端整个文件传给后端，后端自己识别拿到数据
    // 这个方法是前端用于拿到xlsx文件数据
    // readFile(f) {
    //   return new Promise(resolve => {
    //     var binary = ''
    //     var wb // 读取完成的数据
    //     var outdata // 你需要的数据
    //     var reader = new FileReader()
    //     reader.onload = (e) => {
    //     // 读取成Uint8Array，再转换为Unicode编码（Unicode占两个字节）
    //       var bytes = new Uint8Array(reader.result)
    //       var length = bytes.byteLength
    //       for (var i = 0; i < length; i++) {
    //         binary += String.fromCharCode(bytes[i])
    //       }
    //       // 接下来就是xlsx了，具体可看api
    //       wb = XLSX.read(binary, {
    //         type: 'binary'
    //       })
    //       outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]])
    //       resolve(outdata)
    //     }
    //     reader.readAsArrayBuffer(f)
    //   })
    // }
  }
}

</script>
<style>
</style>
