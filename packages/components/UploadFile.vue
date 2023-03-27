<template>
  <div class="upload-container">
    <button class="upload-btn" @click="handleUploadClick">
      选择文件
    </button>
    <input ref="fileInput" class="file-input" type="file" @change="handleFileChange">

  </div>
</template>

<script>
export default {
  name: 'UploadComponent',
  methods: {
    handleFileChange(event) {
      debugger
      // const file = event.target.files[0]
      // 处理文件上传逻辑
    },
    handleUploadClick() {

    }
  }
}
</script>
<style scoped>
/* .upload-container {
  display: inline-block;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
} */
.upload-btn {
  position: absolute;
  margin-bottom: 10px;
  padding:5px 10px;
  background-color: #4CAF50;
  color: #fff;
  border-radius: 5px;
  cursor: pointer;
  border: none;
  transition: background-color 0.3s ease;
}
.file-input {
 opacity: 0;
  width: 100px;
  margin-bottom:10px;
}

</style>
