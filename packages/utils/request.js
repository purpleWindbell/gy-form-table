import axios from 'axios'
import { Message } from 'element-ui'
// import { getToken } from '@/utils/auth'
// import qs from 'query-string'
axios.defaults.headers['Content-Type'] = 'application/json;charset=utf-8'
const blobType = ['application/octet-stream', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/xml', 'multipart/form-data', 'application/x-zip-compressed']
// const flag = 0;
// 创建axios实例
const service = axios.create({
  // axios中请求配置有baseURL选项，表示请求URL公共部分
  // baseURL: baseURL,
  // 超时
  timeout: 100000
})

// request拦截器
service.interceptors.request.use(
  config => {
    if (!config.baseURL) {
      config.baseURL = process.env.VUE_APP_BASE_TEACORE_API
    }
    // 是否需要设置 token
    // if (process.env.VUE_APP_ORIGIN && process.env.NODE_ENV !== 'development') {

    // }
    config.baseURL = 'https://operate-test-api.pin-dao.cn' + config.baseURL
    const isToken = (config.headers || {}).isToken === false
    if (localStorage.getItem('token') && !isToken) {
      config.headers['Authorization'] = localStorage.getItem('token')// 让每个请求携带自定义token 请根据实际情况自行修改
    }
    return config
  },
  error => {
    Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  res => {
    // debugger
    const code = res.data.code
    // 正常返参
    if (code == 200 || code == 0) {
      return res.data
    }
    // 导出报错，没有code
    if (res.request.responseType === 'blob' && !blobType.includes(res.data.type) && res.data.type.includes('application/json')) {
      const reader = new FileReader()
      reader.onload = function(event) {
        const content = JSON.parse(reader.result || '{}')// 内容就在这里
        Message({
          message: content.message,
          type: 'error',
          duration: 5 * 1000
        })
      }
      reader.readAsText(res.data)
      return Promise.reject(res.data)
    }
    // 导出文件，没有code
    if (res.request.responseType == 'blob' && blobType.includes(res.data.type)) {
      // debugger
      return res.data
    }

    // 错误处理
    Message({
      message: res.data.message || res.data.msg,
      type: 'error',
      duration: 5 * 1000
    })

    return Promise.reject(res.data)
  }
)
export default service
